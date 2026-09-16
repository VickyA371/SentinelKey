import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AuthState } from '@sentinelkey/shared';

const initialState: AuthState = {
  uid: '',
  fullName: '',
  email: '',
  phoneNumber: '',
  createdAt: '',
  isAccountVerified: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setData: (state, action: PayloadAction<AuthState>) => {
      state.uid = action.payload.uid;
      state.fullName = action.payload.fullName;
      state.email = action.payload.email;
      state.phoneNumber = action.payload.phoneNumber;
      state.createdAt = action.payload.createdAt;
      state.isAccountVerified = action.payload.isAccountVerified ?? false;
    },
    clearData: (state) => {
      state.uid = '';
      state.fullName = '';
      state.email = '';
      state.createdAt = '';
      state.phoneNumber = '';
      state.isAccountVerified = false;
    },
  },
});

export const { setData, clearData } = authSlice.actions;
export default authSlice.reducer;
