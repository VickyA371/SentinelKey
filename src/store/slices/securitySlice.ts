import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import * as Keychain from 'react-native-keychain';
import { KEYCHAIN } from '../../constants/keychain';

export interface SecurityState {
    fingerprintAccessEnabled: boolean;
    enhancedPrivacyEnabled: boolean;
    biometricAuthenticated: boolean; // whether app-open biometric check has passed this session
    isLoaded: boolean; // whether settings have been hydrated from Keychain
}

const initialState: SecurityState = {
    fingerprintAccessEnabled: false,
    enhancedPrivacyEnabled: false,
    biometricAuthenticated: false,
    isLoaded: false,
};

/**
 * Read security settings stored in Keychain.
 */
const readFromKeychain = async (): Promise<{ fingerprint: boolean; privacy: boolean }> => {
    try {
        const credentials = await Keychain.getGenericPassword({ service: KEYCHAIN.SECURITY_SERVICE });
        if (credentials) {
            const data = JSON.parse(credentials.password);
            return {
                fingerprint: data.fingerprintAccessEnabled ?? false,
                privacy: data.enhancedPrivacyEnabled ?? false,
            };
        }
    } catch (error) {
        console.error('Failed to read security settings from Keychain:', error);
    }
    return { fingerprint: false, privacy: false };
};

/**
 * Write security settings to Keychain.
 */
const writeToKeychain = async (fingerprint: boolean, privacy: boolean): Promise<void> => {
    try {
        const data = JSON.stringify({
            fingerprintAccessEnabled: fingerprint,
            enhancedPrivacyEnabled: privacy,
        });
        await Keychain.setGenericPassword(KEYCHAIN.SECURITY_USERNAME, data, {
            service: KEYCHAIN.SECURITY_SERVICE,
            accessible: Keychain.ACCESSIBLE.AFTER_FIRST_UNLOCK,
        });
    } catch (error) {
        console.error('Failed to write security settings to Keychain:', error);
    }
};

/**
 * Hydrate security settings from Keychain on app start.
 */
export const loadSecuritySettings = createAsyncThunk(
    'security/loadSettings',
    async () => {
        const { fingerprint, privacy } = await readFromKeychain();
        return {
            fingerprintAccessEnabled: fingerprint,
            enhancedPrivacyEnabled: privacy,
        };
    },
);

/**
 * Clear all saved security / biometric settings from Keychain.
 * Should be dispatched on logout and session expiry.
 */
export const clearSecuritySettings = createAsyncThunk(
    'security/clearSettings',
    async () => {
        try {
            await Keychain.resetGenericPassword({ service: KEYCHAIN.SECURITY_SERVICE });
        } catch (error) {
            console.error('Failed to clear security settings from Keychain:', error);
        }
    },
);

/**
 * Persist a security setting change to Keychain.
 * Reads current values, merges the update, and writes back.
 */
export const persistSecuritySetting = async (
    key: 'fingerprint' | 'privacy',
    value: boolean,
) => {
    const current = await readFromKeychain();
    if (key === 'fingerprint') {
        await writeToKeychain(value, current.privacy);
    } else {
        await writeToKeychain(current.fingerprint, value);
    }
};

export const securitySlice = createSlice({
    name: 'security',
    initialState,
    reducers: {
        setFingerprintAccess: (state, action: PayloadAction<boolean>) => {
            state.fingerprintAccessEnabled = action.payload;
        },
        setEnhancedPrivacy: (state, action: PayloadAction<boolean>) => {
            state.enhancedPrivacyEnabled = action.payload;
        },
        setBiometricAuthenticated: (state, action: PayloadAction<boolean>) => {
            state.biometricAuthenticated = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(loadSecuritySettings.fulfilled, (state, action) => {
            state.fingerprintAccessEnabled = action.payload.fingerprintAccessEnabled;
            state.enhancedPrivacyEnabled = action.payload.enhancedPrivacyEnabled;
            state.isLoaded = true;
        });
        builder.addCase(loadSecuritySettings.rejected, (state) => {
            state.isLoaded = true; // still mark loaded so the app doesn't hang
        });
        builder.addCase(clearSecuritySettings.fulfilled, (state) => {
            state.fingerprintAccessEnabled = false;
            state.enhancedPrivacyEnabled = false;
            state.biometricAuthenticated = false;
            state.isLoaded = false;
        });
    },
});

export const {
    setFingerprintAccess,
    setEnhancedPrivacy,
    setBiometricAuthenticated,
} = securitySlice.actions;

export default securitySlice.reducer;
