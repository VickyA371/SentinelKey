import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useSelector, useDispatch } from 'react-redux';

import AppText from '../../../components/Common/AppText';
import AppHeader from '../../../components/Common/AppHeader';
import MasterPasswordPrompt from '../../../components/Common/MasterPasswordPrompt';

import colors from '../../../constants/colors';
import styles from './styles';

import { RootState, AppDispatch } from '../../../store';
import {
  setEnhancedPrivacy,
  persistEnhancedPrivacy,
} from '../../../store/slices/securitySlice';
import { isBiometricAvailable } from '../../../utils/biometrics';
import { isVaultUnlocked } from '../../../utils/vault';
import {
  isBiometricUnlockEnabled,
  enableBiometricUnlock,
  disableBiometricUnlock,
} from '../../../utils/biometricVault';
import { showError, showSuccess } from '../../../utils/toast';

const SecuritySettingsScreen = () => {
  const dispatch = useDispatch<AppDispatch>();

  const enhancedPrivacyEnabled = useSelector(
    (state: RootState) => state.security.enhancedPrivacyEnabled,
  );
  const [biometricVaultEnabled, setBiometricVaultEnabled] = useState(false);
  const [pwPromptVisible, setPwPromptVisible] = useState(false);
  // The Enhanced Privacy value to apply once the master password is verified.
  const pendingPrivacyValueRef = useRef<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    isBiometricUnlockEnabled().then((enabled) => {
      if (mounted) setBiometricVaultEnabled(enabled);
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Toggling Enhanced Privacy (either direction) requires the master password:
  // turning it OFF must be protected, or the restriction is trivially bypassed.
  const handlePrivacyToggle = useCallback((newValue: boolean) => {
    pendingPrivacyValueRef.current = newValue;
    setPwPromptVisible(true);
  }, []);

  const applyPrivacyChange = useCallback(async () => {
    setPwPromptVisible(false);
    const newValue = pendingPrivacyValueRef.current;
    pendingPrivacyValueRef.current = null;
    if (newValue === null) return;
    dispatch(setEnhancedPrivacy(newValue));
    await persistEnhancedPrivacy(newValue);
    showSuccess(
      newValue ? 'Enhanced Privacy on' : 'Enhanced Privacy off',
      newValue
        ? 'Your master password is now required to view or copy passwords.'
        : 'Passwords can now be viewed and copied without extra confirmation.',
    );
  }, [dispatch]);

  const cancelPrivacyChange = useCallback(() => {
    setPwPromptVisible(false);
    pendingPrivacyValueRef.current = null;
  }, []);

  const handleBiometricVaultToggle = useCallback(async (newValue: boolean) => {
    if (newValue) {
      const available = await isBiometricAvailable();
      if (!available) {
        showError('Unavailable', 'No biometric authentication is set up on this device.');
        return;
      }
      // Enrollment stores the in-memory DEK; the vault must be unlocked (it is,
      // since we're inside the app past the gate).
      if (!isVaultUnlocked()) {
        showError('Vault locked', 'Please unlock your vault before enabling biometric unlock.');
        return;
      }
      try {
        await enableBiometricUnlock();
        setBiometricVaultEnabled(true);
        showSuccess('Enabled', 'You can now unlock your vault with biometrics.');
      } catch (error) {
        showError('Error', 'Could not enable biometric unlock. Please try again.');
      }
      return;
    }
    await disableBiometricUnlock();
    setBiometricVaultEnabled(false);
    showSuccess('Disabled', 'Biometric unlock removed from this device.');
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <AppHeader
        title="Security Settings"
        containerStyle={styles.header}
        titleStyle={styles.headerTitle}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.iconWrapper}>
            <Ionicons name="shield-checkmark" size={48} color={colors.deepTeal} />
          </View>
          <AppText style={styles.heroTitle}>{"Ultra Secure Protection"}</AppText>
          <AppText style={styles.heroSubtitle}>{"Sentinel Key is shielding your data"}</AppText>
        </View>

        {/* Security Features List */}
        <View style={styles.sectionContainer}>
          <AppText style={styles.sectionTitle}>{"Security Features"}</AppText>

          <View style={styles.featuresList}>
            {/* Privacy Card */}
            <View style={styles.featureCard}>
              <View style={styles.featureLeft}>
                <View style={styles.featureIconContainer}>
                  <Ionicons name="shield-half" size={24} color={colors.deepTeal} />
                </View>
                <View style={styles.featureTextContainer}>
                  <AppText style={styles.featureTitle}>{"Enhanced Privacy"}</AppText>
                  <AppText style={styles.featureSubtitle}>{"Require your master password to view or copy passwords"}</AppText>
                </View>
              </View>
              <Switch
                value={enhancedPrivacyEnabled}
                onValueChange={handlePrivacyToggle}
                trackColor={{ false: colors.iceGray, true: colors.deepTeal }}
                thumbColor={colors.white}
              />
            </View>

            {/* Biometric Vault Unlock Card */}
            <View style={styles.featureCard}>
              <View style={styles.featureLeft}>
                <View style={styles.featureIconContainer}>
                  <Ionicons name="finger-print" size={24} color={colors.deepTeal} />
                </View>
                <View style={styles.featureTextContainer}>
                  <AppText style={styles.featureTitle}>{"Biometric Unlock"}</AppText>
                  <AppText style={styles.featureSubtitle}>{"Unlock your vault with biometrics instead of your master password"}</AppText>
                </View>
              </View>
              <Switch
                value={biometricVaultEnabled}
                onValueChange={handleBiometricVaultToggle}
                trackColor={{ false: colors.iceGray, true: colors.deepTeal }}
                thumbColor={colors.white}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <MasterPasswordPrompt
        visible={pwPromptVisible}
        title="Confirm Master Password"
        message="Enter your master password to change this setting."
        onCancel={cancelPrivacyChange}
        onSuccess={applyPrivacyChange}
      />
    </SafeAreaView>
  );
};

export default SecuritySettingsScreen;
