import {
  CIPHER_VERSION,
  PBKDF2_ITERATIONS,
  IV_BYTES,
  KEY_MATERIAL_HEX_LEN,
} from '@sentinelkey/shared';

/**
 * Web Crypto API implementation of SentinelKey's authenticated encryption.
 *
 * Produces wire-format-identical output to the mobile react-native-aes-crypto
 * implementation: `v2:<ivHex>:<ciphertextBase64>:<macHex>`
 *
 * Uses the standard Encrypt-then-MAC construction:
 *   • AES-256-CBC (PKCS7 via Web Crypto)  -> confidentiality
 *   • HMAC-SHA256                          -> integrity/authenticity
 */

export interface KeyMaterial {
  /** 32-byte AES-256 encryption key, hex-encoded. */
  encKeyHex: string;
  /** 32-byte HMAC-SHA256 key, hex-encoded. */
  macKeyHex: string;
}

// ─── Hex / Buffer helpers ────────────────────────────────────────────────────

const hexToBytes = (hex: string): Uint8Array => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
};

const bytesToHex = (bytes: Uint8Array): string =>
  Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

const bytesToBase64 = (bytes: Uint8Array): string => {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const base64ToBytes = (b64: string): Uint8Array => {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const textToBytes = (text: string): Uint8Array => new TextEncoder().encode(text);
const bytesToText = (bytes: Uint8Array): string => new TextDecoder().decode(bytes);

// ─── Core functions ──────────────────────────────────────────────────────────

/** Generate `byteCount` cryptographically-random bytes as a hex string. */
export const randomHex = (byteCount: number): string => {
  const bytes = new Uint8Array(byteCount);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
};

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
 * via PBKDF2-HMAC-SHA256.
 */
export const deriveKeyMaterial = async (
  password: string,
  saltHex: string,
  iterations: number = PBKDF2_ITERATIONS,
): Promise<KeyMaterial> => {
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    textToBytes(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      // CRITICAL: react-native-aes-crypto's pbkdf2 takes the salt as a String,
      // and natively converts it using getBytes("UTF-8"). It does NOT decode
      // the hex string into bytes. To match its key derivation exactly, we
      // must also use the literal UTF-8 bytes of the hex string characters.
      salt: textToBytes(saltHex),
      iterations,
      hash: 'SHA-256',
    },
    passwordKey,
    512, // 64 bytes = enc key + mac key
  );

  const materialHex = bytesToHex(new Uint8Array(derivedBits));
  return splitKeyMaterial(materialHex);
};

/** Constant-time comparison of two equal-length hex strings. */
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
 * Output: `v2:<ivHex>:<ciphertextBase64>:<macHex>`
 */
export const seal = async (plaintext: string, key: KeyMaterial): Promise<string> => {
  const ivBytes = hexToBytes(randomHex(IV_BYTES));
  const ivHex = bytesToHex(ivBytes);

  // Import AES key
  const aesKey = await crypto.subtle.importKey(
    'raw',
    hexToBytes(key.encKeyHex),
    { name: 'AES-CBC' },
    false,
    ['encrypt'],
  );

  // Encrypt
  const ciphertextBuffer = await crypto.subtle.encrypt(
    { name: 'AES-CBC', iv: ivBytes },
    aesKey,
    textToBytes(plaintext),
  );
  const ciphertextBase64 = bytesToBase64(new Uint8Array(ciphertextBuffer));

  // HMAC over version:iv:ciphertext
  const hmacKey = await crypto.subtle.importKey(
    'raw',
    hexToBytes(key.macKeyHex),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const macBuffer = await crypto.subtle.sign(
    'HMAC',
    hmacKey,
    textToBytes(`${CIPHER_VERSION}:${ivHex}:${ciphertextBase64}`),
  );
  const macHex = bytesToHex(new Uint8Array(macBuffer));

  return `${CIPHER_VERSION}:${ivHex}:${ciphertextBase64}:${macHex}`;
};

/**
 * Verify + decrypt a payload produced by `seal`.
 * Throws if the format is wrong, the MAC fails, or decryption fails.
 */
export const open = async (payload: string, key: KeyMaterial): Promise<string> => {
  const parts = payload.split(':');
  if (parts.length !== 4 || parts[0] !== CIPHER_VERSION) {
    throw new Error('Unrecognized ciphertext format');
  }
  const [version, iv, ciphertext, mac] = parts;

  // Verify HMAC
  const hmacKey = await crypto.subtle.importKey(
    'raw',
    hexToBytes(key.macKeyHex),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const expectedMacBuffer = await crypto.subtle.sign(
    'HMAC',
    hmacKey,
    textToBytes(`${version}:${iv}:${ciphertext}`),
  );
  const expectedMac = bytesToHex(new Uint8Array(expectedMacBuffer));

  if (!constantTimeEqual(mac, expectedMac)) {
    throw new Error('Integrity check failed: wrong key or tampered data');
  }

  // Decrypt
  const aesKey = await crypto.subtle.importKey(
    'raw',
    hexToBytes(key.encKeyHex),
    { name: 'AES-CBC' },
    false,
    ['decrypt'],
  );
  const plaintextBuffer = await crypto.subtle.decrypt(
    { name: 'AES-CBC', iv: hexToBytes(iv) },
    aesKey,
    base64ToBytes(ciphertext),
  );

  return bytesToText(new Uint8Array(plaintextBuffer));
};

/** True if `value` is in the current authenticated (`v2`) format. */
export const isSealed = (value: unknown): value is string =>
  typeof value === 'string' &&
  value.startsWith(`${CIPHER_VERSION}:`) &&
  value.split(':').length === 4;
