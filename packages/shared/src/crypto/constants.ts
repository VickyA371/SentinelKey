/**
 * Crypto format constants shared between mobile (react-native-aes-crypto)
 * and web (Web Crypto API). Both platforms MUST use these exact values to
 * ensure cross-platform interoperability of encrypted vault data.
 */

/** Versioned payload prefix so the scheme can evolve. */
export const CIPHER_VERSION = 'v2';

/**
 * PBKDF2 work factor for deriving a key from the master password.
 * OWASP (2023) minimum for PBKDF2-HMAC-SHA256 is 600,000 iterations.
 */
export const PBKDF2_ITERATIONS = 600_000;

/** AES block size in bytes. */
export const IV_BYTES = 16;

/** Each sub-key is 32 bytes (256 bits). */
export const SUBKEY_BITS = 256;

/** Total key material: enc sub-key + MAC sub-key = 512 bits = 64 bytes. */
export const KEY_MATERIAL_BITS = SUBKEY_BITS * 2;

/** Hex-encoded length of the full key material (128 hex chars). */
export const KEY_MATERIAL_HEX_LEN = KEY_MATERIAL_BITS / 4;

/** Byte length of a freshly generated DEK (64 bytes = 128 hex chars). */
export const DEK_BYTES = 64;

/** Meta schema version for VaultMeta documents. */
export const META_VERSION = 1;
