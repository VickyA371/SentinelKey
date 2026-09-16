import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import securityReducer from './slices/securitySlice'
import vaultReducer from './slices/vaultSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    security: securityReducer,
    vault: vaultReducer,
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch

