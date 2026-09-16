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

/**
 * Vault gate status — tracks UI routing, never the key itself.
 *
 *   unknown    -> still determining (fetching meta)
 *   needsSetup -> logged in, but no vault exists yet
 *   locked     -> vault exists, master password required
 *   unlocked   -> DEK is in memory; app is accessible
 */
export type VaultStatus = 'unknown' | 'needsSetup' | 'locked' | 'unlocked';
