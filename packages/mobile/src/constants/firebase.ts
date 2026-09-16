export const COLLECTIONS = {
    PASSWORDS: 'passwords',
    USERS: 'users',
    // Per-user vault key metadata (salt + wrapped DEK). Non-secret, but
    // must be locked to its owner by Firestore rules.
    VAULT_META: 'vaultMeta',
} as const;
