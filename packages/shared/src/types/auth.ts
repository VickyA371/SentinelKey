export interface AuthState {
    uid: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    createdAt: string;
    isAccountVerified?: boolean;
}
