import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from '@sentinelkey/shared';
import type { VaultMeta } from '@sentinelkey/shared';

/** Read the vault meta for a user, or null if none exists yet. */
export const getVaultMeta = async (uid: string): Promise<VaultMeta | null> => {
  const snap = await getDoc(doc(db, COLLECTIONS.VAULT_META, uid));
  if (!snap.exists()) return null;
  const data = snap.data() as Partial<VaultMeta> | undefined;
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

/** Persist vault meta. Only write once at vault creation. */
export const saveVaultMeta = async (uid: string, meta: VaultMeta): Promise<void> => {
  await setDoc(doc(db, COLLECTIONS.VAULT_META, uid), meta);
};
