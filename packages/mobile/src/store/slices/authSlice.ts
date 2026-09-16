import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface AuthState {
    uid: string
    fullName: string
    email: string
    phoneNumber: string
    createdAt: string
    isAccountVerified?: boolean
}

const initialState: AuthState = {
    uid: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    createdAt: '',
    isAccountVerified: false,
}

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setData: (state, action: PayloadAction<AuthState>) => {
            state.uid = action.payload.uid
            state.fullName = action.payload.fullName
            state.email = action.payload.email
            state.phoneNumber = action.payload.phoneNumber
            state.createdAt = action.payload.createdAt
            state.isAccountVerified = action.payload.isAccountVerified ?? false
        },
        clearData: (state) => {
            state.uid = ''
            state.fullName = ''
            state.email = ''
            state.createdAt = ''
            state.isAccountVerified = false
        },
    },
})

// Action creators are generated for each case reducer function
export const { setData, clearData } = authSlice.actions

export default authSlice.reducer