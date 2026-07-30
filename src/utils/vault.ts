import {
    KeyMaterial,
    PBKDF2_ITERATIONS,
    deriveKeyMaterial,
    open,
    randomHex,
    seal,
    splitKeyMaterial,
} from './cryptoCore';

/**
 * Zero-knowledge vault key management (Bitwarden-style envelope encryption).
 *
 *   master password ──PBKDF2──▶ master key (KEK)
 *   random 64-byte DEK ──wrapped by KEK──▶ wrappedKey  (stored in Firestore)
 *   vault items ──encrypted by DEK──▶ ciphertext       (stored in Firestore)
 *
 * The server only ever sees the salt and the wrapped key; it can never derive
 * the DEK because the master password never leaves the device. The unwrapped
 * DEK lives ONLY in this module's in-memory session (never Redux, never disk),
 * so it is gone on app kill and must be re-derived by unlocking.
 */

/** Persisted, non-secret key material. Safe to store server-side. */
export interface VaultMeta {
    /** Meta schema version (independent of the ciphertext version). */
    version: number;
    /** PBKDF2 iteration count used to derive the master key. */
    kdfIterations: number;
    /** Per-user random salt (hex) for the master-key derivation. */
    saltHex: string;
    /** The DEK, sealed with the master key (a `v2:` payload). */
    wrappedKey: string;
}

const META_VERSION = 1;
const DEK_BYTES = 64; // 32-byte enc key + 32-byte MAC key

// In-memory session key. Intentionally module-scoped and never persisted.
let sessionKey: KeyMaterial | null = null;

/** Whether the vault is currently unlocked (DEK present in memory). */
export const isVaultUnlocked = (): boolean => sessionKey !== null;

/** Drop the in-memory DEK. Call on logout, lock, and session expiry. */
export const lockVault = (): void => {
    sessionKey = null;
};

const requireSessionKey = (): KeyMaterial => {
    if (!sessionKey) {
        throw new Error('Vault is locked');
    }
    return sessionKey;
};

/**
 * Create a brand-new vault protected by `masterPassword`.
 * Generates a random DEK, wraps it with the master key, unlocks the session,
 * and returns the meta to persist. Does NOT write to Firestore (see vaultStorage).
 */
export const createVault = async (masterPassword: string): Promise<VaultMeta> => {
    const saltHex = await randomHex(16);
    const dekHex = await randomHex(DEK_BYTES); // the real vault key, 128 hex chars
    const masterKey = await deriveKeyMaterial(masterPassword, saltHex);
    const wrappedKey = await seal(dekHex, masterKey);

    sessionKey = splitKeyMaterial(dekHex);

    return {
        version: META_VERSION,
        kdfIterations: PBKDF2_ITERATIONS,
        saltHex,
        wrappedKey,
    };
};

/**
 * Attempt to unlock an existing vault with `masterPassword`.
 * Returns true and populates the session on success; returns false if the
 * password is wrong (the wrapped-key MAC fails to verify). Re-throws only on
 * unexpected/malformed-meta errors.
 */
export const unlockVault = async (masterPassword: string, meta: VaultMeta): Promise<boolean> => {
    const masterKey = await deriveKeyMaterial(masterPassword, meta.saltHex, meta.kdfIterations);
    try {
        const dekHex = await open(meta.wrappedKey, masterKey);
        sessionKey = splitKeyMaterial(dekHex);
        return true;
    } catch {
        // MAC / decrypt failure == wrong master password. Fail closed.
        sessionKey = null;
        return false;
    }
};

/** Encrypt a vault field with the in-memory DEK. Throws if the vault is locked. */
export const encryptField = async (plaintext: string): Promise<string> => {
    if (!plaintext) return '';
    return seal(plaintext, requireSessionKey());
};

/** Decrypt a vault field with the in-memory DEK. Throws if locked or tampered. */
export const decryptField = async (payload: string): Promise<string> => {
    if (!payload) return '';
    return open(payload, requireSessionKey());
};
