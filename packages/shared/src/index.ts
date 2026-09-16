// Constants
export { colors } from './constants/colors';
export type { AppColors } from './constants/colors';
export { COLLECTIONS } from './constants/firebase';

// Types
export type { AuthState } from './types/auth';
export type { VaultMeta, VaultStatus } from './types/vault';

// Crypto constants
export {
    CIPHER_VERSION,
    PBKDF2_ITERATIONS,
    IV_BYTES,
    SUBKEY_BITS,
    KEY_MATERIAL_BITS,
    KEY_MATERIAL_HEX_LEN,
    DEK_BYTES,
    META_VERSION,
} from './crypto/constants';

// Validation schemas
export {
    loginFormSchema,
    forgotPasswordSchema,
    signUpFormSchema,
    addListItemSchema,
    createMasterPasswordSchema,
    unlockVaultSchema,
    profileDetailsSchema,
} from './schema/validationSchema';

// Utils
export {
    getCategoryIcon,
    getDynamicColor,
    CATEGORIES,
} from './utils/mapping';
export type { Category } from './utils/mapping';
