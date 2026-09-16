import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import securityReducer from './slices/securitySlice';
import vaultReducer from './slices/vaultSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    security: securityReducer,
    vault: vaultReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
