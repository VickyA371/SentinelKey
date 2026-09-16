import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface SecurityState {
  enhancedPrivacyEnabled: boolean;
  isLoaded: boolean;
}

const STORAGE_KEY = 'sentinelkey_security_settings';

const loadFromStorage = (): boolean => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      return data.enhancedPrivacyEnabled ?? false;
    }
  } catch { /* ignore */ }
  return false;
};

const initialState: SecurityState = {
  enhancedPrivacyEnabled: loadFromStorage(),
  isLoaded: true,
};

export const persistEnhancedPrivacy = (value: boolean) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ enhancedPrivacyEnabled: value }));
  } catch { /* ignore */ }
};

export const clearSecurityStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch { /* ignore */ }
};

export const securitySlice = createSlice({
  name: 'security',
  initialState,
  reducers: {
    setEnhancedPrivacy: (state, action: PayloadAction<boolean>) => {
      state.enhancedPrivacyEnabled = action.payload;
      persistEnhancedPrivacy(action.payload);
    },
    clearSecuritySettings: (state) => {
      state.enhancedPrivacyEnabled = false;
      state.isLoaded = false;
      clearSecurityStorage();
    },
  },
});

export const { setEnhancedPrivacy, clearSecuritySettings } = securitySlice.actions;
export default securitySlice.reducer;
