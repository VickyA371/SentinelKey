export const KEYCHAIN = {
    SECURITY_SERVICE: 'com.sentinelkey.security-settings',
    SECURITY_USERNAME: 'security_settings',
    // Biometric-gated, device-only copy of the vault DEK for fingerprint unlock.
    // Protected by the OS secure element; invalidated if the enrolled biometrics
    // change; never synced or backed up. The master password stays the root of
    // trust and the fallback.
    BIOMETRIC_DEK_SERVICE: 'com.sentinelkey.biometric-dek',
    BIOMETRIC_DEK_USERNAME: 'biometric_dek',
} as const;
