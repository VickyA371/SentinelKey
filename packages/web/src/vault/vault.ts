import type { VaultMeta } from '@sentinelkey/shared';
import { PBKDF2_ITERATIONS, DEK_BYTES, META_VERSION } from '@sentinelkey/shared';
import {
  KeyMaterial,
  deriveKeyMaterial,
  open,
  randomHex,
  seal,
  splitKeyMaterial,
} from '../crypto/cryptoCore';

/**
 * Zero-knowledge vault key management (Web implementation).
 *
 *   master password ──PBKDF2──▶ master key (KEK)
 *   random 64-byte DEK ──wrapped by KEK──▶ wrappedKey  (stored in Firestore)
 *   vault items ──encrypted by DEK──▶ ciphertext       (stored in Firestore)
 *
 * The unwrapped DEK lives ONLY in this module's in-memory session (never
 * Redux, never localStorage), so it's gone on page refresh.
 */

// In-memory session key. Never persisted.
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
 * Returns the meta to persist to Firestore.
 */
export const createVault = async (masterPassword: string): Promise<VaultMeta> => {
  const saltHex = randomHex(16);
  const dekHex = randomHex(DEK_BYTES);
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
 * Returns true on success; false if the password is wrong.
 */
export const unlockVault = async (
  masterPassword: string,
  meta: VaultMeta,
): Promise<boolean> => {
  const masterKey = await deriveKeyMaterial(masterPassword, meta.saltHex, meta.kdfIterations);
  try {
    const dekHex = await open(meta.wrappedKey, masterKey);
    sessionKey = splitKeyMaterial(dekHex);
    return true;
  } catch {
    sessionKey = null;
    return false;
  }
};

/**
 * Verify a master password against the stored meta WITHOUT changing the session.
 */
export const verifyMasterPassword = async (
  masterPassword: string,
  meta: VaultMeta,
): Promise<boolean> => {
  const masterKey = await deriveKeyMaterial(masterPassword, meta.saltHex, meta.kdfIterations);
  try {
    await open(meta.wrappedKey, masterKey);
    return true;
  } catch {
    return false;
  }
};

/** Encrypt a vault field with the in-memory DEK. Throws if locked. */
export const encryptField = async (plaintext: string): Promise<string> => {
  if (!plaintext) return '';
  return seal(plaintext, requireSessionKey());
};

/** Decrypt a vault field with the in-memory DEK. Throws if locked or tampered. */
export const decryptField = async (payload: string): Promise<string> => {
  if (!payload) return '';
  return open(payload, requireSessionKey());
};
