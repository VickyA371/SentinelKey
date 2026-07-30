import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { getVaultMeta } from '../../utils/vaultStorage';
import { isVaultUnlocked, type VaultMeta } from '../../utils/vault';

/**
 * Tracks the vault GATE status only — never the key itself. The unwrapped DEK
 * lives exclusively in the in-memory session inside utils/vault.ts.
 *
 *   unknown    -> still determining (fetching meta)
 *   needsSetup -> logged in, but no vault exists yet (first-time master-password setup)
 *   locked     -> vault exists, master password required to unlock this session
 *   unlocked   -> DEK is in memory; app is accessible
 */
export type VaultStatus = 'unknown' | 'needsSetup' | 'locked' | 'unlocked';

interface VaultState {
    status: VaultStatus;
    meta: VaultMeta | null; // salt + wrapped key (non-secret); used by the unlock screen
}

const initialState: VaultState = {
    status: 'unknown',
    meta: null,
};

/** Decide the gate status for a freshly-logged-in user. */
export const refreshVaultStatus = createAsyncThunk(
    'vault/refresh',
    async (uid: string): Promise<{ status: VaultStatus; meta: VaultMeta | null }> => {
        // Already unlocked in this session (e.g. right after setup) — keep it.
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
        // Redux-only reset. The DEK is cleared separately via lockVault().
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
            // Couldn't reach Firestore. Stay out of the vault; the gate shows a spinner.
            state.status = 'unknown';
        });
    },
});

export const { setVaultStatus, resetVault } = vaultSlice.actions;
export default vaultSlice.reducer;
