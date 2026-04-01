import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import AppText from '../../../components/Common/AppText';
import colors from '../../../constants/colors';
import styles from './styles';

const SecuritySettingsScreen = () => {
  const navigation = useNavigation();

  const [fingerprintEnabled, setFingerprintEnabled] = useState(true);
  const [privacyEnabled, setPrivacyEnabled] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.charcoal} />
        </TouchableOpacity>
        <AppText style={styles.headerTitle}>{"Security Settings"}</AppText>
        <View style={styles.headerSpacer} />
      </View>

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
                value={fingerprintEnabled} 
                onValueChange={setFingerprintEnabled}
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
                value={privacyEnabled} 
                onValueChange={setPrivacyEnabled}
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
