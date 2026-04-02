import ReactNativeBiometrics from 'react-native-biometrics';
import { Alert } from 'react-native';

const rnBiometrics = new ReactNativeBiometrics({
    allowDeviceCredentials: true,
});

/**
 * Check if biometric authentication is available on the device.
 * Returns true if biometrics (Face ID / Touch ID / Fingerprint) are enrolled.
 */
export const isBiometricAvailable = async (): Promise<boolean> => {
    try {
        const { available } = await rnBiometrics.isSensorAvailable();
        return available;
    } catch (error) {
        console.error('Biometric availability check failed:', error);
        return false;
    }
};

/**
 * Show the native biometric prompt.
 * @param reason - The message shown to the user explaining why biometric is needed.
 * @returns { success: boolean } — whether authentication was successful.
 */
export const promptBiometric = async (
    reason: string = 'Authenticate to continue',
): Promise<{ success: boolean }> => {
    try {
        const isAvailable = await isBiometricAvailable();
        if (!isAvailable) {
            Alert.alert(
                'Biometrics Unavailable',
                'No biometric authentication is set up on this device. Please enable Face ID, Touch ID, or Fingerprint in your device settings.',
            );
            return { success: false };
        }

        const { success } = await rnBiometrics.simplePrompt({
            promptMessage: reason,
            cancelButtonText: 'Cancel',
            fallbackPromptMessage: 'Use passcode',
        });

        return { success };
    } catch (error) {
        console.error('Biometric prompt error:', error);
        return { success: false };
    }
};
