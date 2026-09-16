import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import * as Keychain from 'react-native-keychain';
import { KEYCHAIN } from '../../constants/keychain';

export interface SecurityState {
    enhancedPrivacyEnabled: boolean;
    isLoaded: boolean; // whether settings have been hydrated from Keychain
}

const initialState: SecurityState = {
    enhancedPrivacyEnabled: false,
    isLoaded: false,
};

/**
 * Read security settings stored in Keychain.
 */
const readFromKeychain = async (): Promise<{ privacy: boolean }> => {
    try {
        const credentials = await Keychain.getGenericPassword({ service: KEYCHAIN.SECURITY_SERVICE });
        if (credentials) {
            const data = JSON.parse(credentials.password);
            return { privacy: data.enhancedPrivacyEnabled ?? false };
        }
    } catch (error) {
        console.error('Failed to read security settings from Keychain:', error);
    }
    return { privacy: false };
};

/**
 * Write security settings to Keychain.
 */
const writeToKeychain = async (privacy: boolean): Promise<void> => {
    try {
        const data = JSON.stringify({ enhancedPrivacyEnabled: privacy });
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
        const { privacy } = await readFromKeychain();
        return { enhancedPrivacyEnabled: privacy };
    },
);

/**
 * Clear all saved security settings from Keychain.
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
 * Persist the enhanced-privacy setting to Keychain.
 */
export const persistEnhancedPrivacy = async (value: boolean) => {
    await writeToKeychain(value);
};

export const securitySlice = createSlice({
    name: 'security',
    initialState,
    reducers: {
        setEnhancedPrivacy: (state, action: PayloadAction<boolean>) => {
            state.enhancedPrivacyEnabled = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(loadSecuritySettings.fulfilled, (state, action) => {
            state.enhancedPrivacyEnabled = action.payload.enhancedPrivacyEnabled;
            state.isLoaded = true;
        });
        builder.addCase(loadSecuritySettings.rejected, (state) => {
            state.isLoaded = true; // still mark loaded so the app doesn't hang
        });
        builder.addCase(clearSecuritySettings.fulfilled, (state) => {
            state.enhancedPrivacyEnabled = false;
            state.isLoaded = false;
        });
    },
});

export const { setEnhancedPrivacy } = securitySlice.actions;

export default securitySlice.reducer;
