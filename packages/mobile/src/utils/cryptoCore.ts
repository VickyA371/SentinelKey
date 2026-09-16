import Aes from 'react-native-aes-crypto';

/**
 * Low-level authenticated symmetric crypto for SentinelKey.
 *
 * react-native-aes-crypto@3.3.0 exposes no AEAD mode (no AES-GCM), so we build
 * authenticated encryption with the standard Encrypt-then-MAC construction:
 *   • AES-256-CBC (PKCS7)  -> confidentiality
 *   • HMAC-SHA256          -> integrity/authenticity
 * using two INDEPENDENT sub-keys. `open()` verifies the MAC in constant time
 * BEFORE attempting decryption and throws on any mismatch. Nothing in this
 * module ever returns the input, plaintext, or a partial result on failure —
 * it always fails closed. (Fixes the previous silent plaintext fallback.)
 */

// Versioned payload prefix so the scheme can evolve and legacy data is detectable.
export const CIPHER_VERSION = 'v2';

// PBKDF2 work factor for deriving a key from the master password.
// OWASP (2023) minimum for PBKDF2-HMAC-SHA256 is 600,000 iterations.
export const PBKDF2_ITERATIONS = 600_000;

const IV_BYTES = 16; // AES block size
const SUBKEY_BITS = 256; // each sub-key is 32 bytes
const KEY_MATERIAL_BITS = SUBKEY_BITS * 2; // 512 bits => 64 bytes => 128 hex chars
const KEY_MATERIAL_HEX_LEN = KEY_MATERIAL_BITS / 4;

export interface KeyMaterial {
    /** 32-byte AES-256 encryption key, hex-encoded. */
    encKeyHex: string;
    /** 32-byte HMAC-SHA256 key, hex-encoded. */
    macKeyHex: string;
}

/** Generate `bytes` cryptographically-random bytes as a hex string. */
export const randomHex = (bytes: number): Promise<string> => Aes.randomKey(bytes);

/** Split 64-byte hex key material into independent encryption + MAC sub-keys. */
export const splitKeyMaterial = (keyMaterialHex: string): KeyMaterial => {
    if (keyMaterialHex.length !== KEY_MATERIAL_HEX_LEN) {
        throw new Error('Invalid key material length');
    }
    const half = keyMaterialHex.length / 2;
    return {
        encKeyHex: keyMaterialHex.slice(0, half),
        macKeyHex: keyMaterialHex.slice(half),
    };
};

/**
 * Derive 64 bytes of key material (enc + MAC sub-keys) from a password and salt
 * via PBKDF2-HMAC-SHA256. Used both for the master key and for any password-based
 * key-wrapping key.
 */
export const deriveKeyMaterial = async (
    password: string,
    saltHex: string,
    iterations: number = PBKDF2_ITERATIONS,
): Promise<KeyMaterial> => {
    const material = await Aes.pbkdf2(password, saltHex, iterations, KEY_MATERIAL_BITS, 'sha256');
    return splitKeyMaterial(material);
};

/** Constant-time comparison of two equal-length strings. */
const constantTimeEqual = (a: string, b: string): boolean => {
    if (a.length !== b.length) return false;
    let mismatch = 0;
    for (let i = 0; i < a.length; i++) {
        mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return mismatch === 0;
};

/**
 * Authenticated-encrypt a UTF-8 string.
 * Output: `v2:<ivHex>:<ciphertextBase64>:<macHex>`.
 * The MAC covers version + IV + ciphertext, so no component can be swapped or
 * stripped without detection. (Base64 never contains ':' so the format parses
 * unambiguously.)
 */
export const seal = async (plaintext: string, key: KeyMaterial): Promise<string> => {
    const iv = await randomHex(IV_BYTES);
    const ciphertext = await Aes.encrypt(plaintext, key.encKeyHex, iv, 'aes-256-cbc');
    const mac = await Aes.hmac256(`${CIPHER_VERSION}:${iv}:${ciphertext}`, key.macKeyHex);
    return `${CIPHER_VERSION}:${iv}:${ciphertext}:${mac}`;
};

/**
 * Verify + decrypt a payload produced by `seal`.
 * Throws if the format is wrong, the MAC fails (wrong key or tampering), or the
 * underlying decryption fails. Never returns the input on error.
 */
export const open = async (payload: string, key: KeyMaterial): Promise<string> => {
    const parts = payload.split(':');
    if (parts.length !== 4 || parts[0] !== CIPHER_VERSION) {
        throw new Error('Unrecognized ciphertext format');
    }
    const [version, iv, ciphertext, mac] = parts;
    const expectedMac = await Aes.hmac256(`${version}:${iv}:${ciphertext}`, key.macKeyHex);
    if (!constantTimeEqual(mac, expectedMac)) {
        throw new Error('Integrity check failed: wrong key or tampered data');
    }
    return Aes.decrypt(ciphertext, key.encKeyHex, iv, 'aes-256-cbc');
};

/** True if `value` is in the current authenticated (`v2`) format. */
export const isSealed = (value: unknown): value is string =>
    typeof value === 'string' &&
    value.startsWith(`${CIPHER_VERSION}:`) &&
    value.split(':').length === 4;
