import * as Keychain from 'react-native-keychain';
import { KEYCHAIN } from '../constants/keychain';
import { getSessionDekHex, setVaultSession } from './vault';

/**
 * Biometric-backed vault unlock.
 *
 * Stores the vault DEK in the device's hardware-backed secure storage, gated by
 * the OS biometric access control. The DEK is released into memory only after a
 * successful Face/Touch/Fingerprint match. This does NOT change the server-side
 * zero-knowledge posture — Firestore still holds only the salt + master-password
 * wrapped key. The master password remains the root of trust and the fallback.
 *
 * SECURITY INVARIANTS (do not weaken):
 *   - `BIOMETRY_CURRENT_SET`  -> the stored DEK is invalidated if the enrolled
 *     biometrics change (a newly added fingerprint can't unlock the old vault).
 *   - `WHEN_UNLOCKED_THIS_DEVICE_ONLY` -> never leaves the device, never synced
 *     to iCloud / Android backup.
 */

const SERVICE = KEYCHAIN.BIOMETRIC_DEK_SERVICE;
const USERNAME = KEYCHAIN.BIOMETRIC_DEK_USERNAME;

/** Whether a biometric-unlock DEK is enrolled on this device (no prompt). */
export const isBiometricUnlockEnabled = async (): Promise<boolean> => {
    try {
        const services = await Keychain.getAllGenericPasswordServices();
        return services.includes(SERVICE);
    } catch {
        return false;
    }
};

/**
 * Enroll biometric unlock. Requires the vault to be unlocked (DEK in memory).
 * Writes the DEK into biometric-gated secure storage.
 */
export const enableBiometricUnlock = async (): Promise<void> => {
    const dekHex = getSessionDekHex();
    if (!dekHex) {
        throw new Error('Vault must be unlocked before enabling biometric unlock');
    }
    await Keychain.setGenericPassword(USERNAME, dekHex, {
        service: SERVICE,
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
};

/** Remove biometric unlock from this device. */
export const disableBiometricUnlock = async (): Promise<void> => {
    try {
        await Keychain.resetGenericPassword({ service: SERVICE });
    } catch (error) {
        console.error('Failed to clear biometric DEK from Keychain:', error);
    }
};

/**
 * Attempt to unlock the vault via biometrics. Triggers the native prompt; on a
 * successful match the DEK is loaded into the in-memory session. Returns false
 * on cancel, error, or if the stored key was invalidated (biometrics changed) —
 * the caller should fall back to the master password.
 */
export const unlockWithBiometrics = async (): Promise<boolean> => {
    try {
        const creds = await Keychain.getGenericPassword({
            service: SERVICE,
            authenticationPrompt: { title: 'Unlock your vault' },
        });
        if (!creds) return false;
        setVaultSession(creds.password);
        return true;
    } catch (error) {
        // Cancelled, hardware error, or invalidated key — fail closed to the
        // master-password path.
        return false;
    }
};
