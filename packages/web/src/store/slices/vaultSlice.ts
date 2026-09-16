import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { VaultMeta, VaultStatus } from '@sentinelkey/shared';
import { getVaultMeta } from '../../vault/vaultStorage';
import { isVaultUnlocked } from '../../vault/vault';

interface VaultState {
  status: VaultStatus;
  meta: VaultMeta | null;
}

const initialState: VaultState = {
  status: 'unknown',
  meta: null,
};

export const refreshVaultStatus = createAsyncThunk(
  'vault/refresh',
  async (uid: string): Promise<{ status: VaultStatus; meta: VaultMeta | null }> => {
    if (isVaultUnlocked()) return { status: 'unlocked', meta: null };
    const meta = await getVaultMeta(uid);
    return { status: meta ? 'locked' : 'needsSetup', meta };
  },
);

export const vaultSlice = createSlice({
  name: 'vault',
  initialState,
  reducers: {
    setVaultStatus: (state, action: PayloadAction<VaultStatus>) => {
      state.status = action.payload;
    },
    resetVault: (state) => {
      state.status = 'unknown';
      state.meta = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(refreshVaultStatus.fulfilled, (state, action) => {
      state.status = action.payload.status;
      if (action.payload.meta) state.meta = action.payload.meta;
    });
    builder.addCase(refreshVaultStatus.rejected, (state) => {
      state.status = 'unknown';
    });
  },
});

export const { setVaultStatus, resetVault } = vaultSlice.actions;
export default vaultSlice.reducer;
