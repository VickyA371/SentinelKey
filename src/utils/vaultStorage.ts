import firestore from '@react-native-firebase/firestore';
import { COLLECTIONS } from '../constants/firebase';
import type { VaultMeta } from './vault';

/**
 * Firestore persistence for a user's vault key metadata.
 * Stored at `vaultMeta/{uid}`. The stored fields (salt + wrapped DEK) are not
 * secret on their own, but Firestore rules must restrict the document to its
 * owner (added in the rules step).
 */

/** Read the vault meta for a user, or null if none exists yet. */
export const getVaultMeta = async (uid: string): Promise<VaultMeta | null> => {
    const doc = await firestore().collection(COLLECTIONS.VAULT_META).doc(uid).get();
    if (!doc.exists()) return null;
    const data = doc.data() as Partial<VaultMeta> | undefined;
    if (!data?.wrappedKey || !data?.saltHex || !data?.kdfIterations || data?.version == null) {
        return null;
    }
    return {
        version: data.version,
        kdfIterations: data.kdfIterations,
        saltHex: data.saltHex,
        wrappedKey: data.wrappedKey,
    };
};

/**
 * Persist vault meta. Uses `create`-like semantics via set; callers should only
 * write once at vault creation (overwriting it would orphan all encrypted data).
 */
export const saveVaultMeta = async (uid: string, meta: VaultMeta): Promise<void> => {
    await firestore().collection(COLLECTIONS.VAULT_META).doc(uid).set(meta);
};
