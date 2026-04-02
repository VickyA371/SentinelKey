import React, { useCallback } from 'react';
import { View, ScrollView, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useSelector, useDispatch } from 'react-redux';

import AppText from '../../../components/Common/AppText';
import AppHeader from '../../../components/Common/AppHeader';

import colors from '../../../constants/colors';
import styles from './styles';

import { RootState, AppDispatch } from '../../../store';
import {
  setFingerprintAccess,
  setEnhancedPrivacy,
  persistSecuritySetting,
} from '../../../store/slices/securitySlice';
import { isBiometricAvailable, promptBiometric } from '../../../utils/biometrics';
import { showError } from '../../../utils/toast';

const SecuritySettingsScreen = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { fingerprintAccessEnabled, enhancedPrivacyEnabled } = useSelector(
    (state: RootState) => state.security,
  );

  const handleFingerprintToggle = useCallback(async (newValue: boolean) => {
    if (newValue) {
      // Enabling — verify biometrics first
      const available = await isBiometricAvailable();
      if (!available) {
        showError('Unavailable', 'No biometric authentication is set up on this device.');
        return;
      }

      const { success } = await promptBiometric('Authenticate to enable Fingerprint Access');
      if (!success) {
        return; // cancelled or failed
      }
    }

    dispatch(setFingerprintAccess(newValue));
    await persistSecuritySetting('fingerprint', newValue);
  }, [dispatch]);

  const handlePrivacyToggle = useCallback(async (newValue: boolean) => {
    if (newValue) {
      // Enabling — verify biometrics first
      const available = await isBiometricAvailable();
      if (!available) {
        showError('Unavailable', 'No biometric authentication is set up on this device.');
        return;
      }

      const { success } = await promptBiometric('Authenticate to enable Enhanced Privacy');
      if (!success) {
        return; // cancelled or failed
      }
    }

    dispatch(setEnhancedPrivacy(newValue));
    await persistSecuritySetting('privacy', newValue);
  }, [dispatch]);

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
            {/* Fingerprint Card */}
            <View style={styles.featureCard}>
              <View style={styles.featureLeft}>
                <View style={styles.featureIconContainer}>
                  <Ionicons name="finger-print" size={24} color={colors.deepTeal} />
                </View>
                <View style={styles.featureTextContainer}>
                  <AppText style={styles.featureTitle}>{"Fingerprint Access"}</AppText>
                  <AppText style={styles.featureSubtitle}>{"Require biometric authentication to open the app"}</AppText>
                </View>
              </View>
              <Switch
                value={fingerprintAccessEnabled}
                onValueChange={handleFingerprintToggle}
                trackColor={{ false: colors.iceGray, true: colors.deepTeal }}
                thumbColor={colors.white}
              />
            </View>

            {/* Privacy Card */}
            <View style={styles.featureCard}>
              <View style={styles.featureLeft}>
                <View style={styles.featureIconContainer}>
                  <Ionicons name="shield-half" size={24} color={colors.deepTeal} />
                </View>
                <View style={styles.featureTextContainer}>
                  <AppText style={styles.featureTitle}>{"Enhanced Privacy"}</AppText>
                  <AppText style={styles.featureSubtitle}>{"Require biometric to view or copy passwords"}</AppText>
                </View>
              </View>
              <Switch
                value={enhancedPrivacyEnabled}
                onValueChange={handlePrivacyToggle}
                trackColor={{ false: colors.iceGray, true: colors.deepTeal }}
                thumbColor={colors.white}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SecuritySettingsScreen;
