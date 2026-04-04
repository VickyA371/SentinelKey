import React, { useState } from 'react';
import { View, Image, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { getAuth, signOut } from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';

import AppText from '../../../components/Common/AppText';
import AppHeader from '../../../components/Common/AppHeader';
import SettingsItem from '../../../components/SettingsScreen/SettingsItem';
import CommonAlert from '../../../components/Common/CommonAlert';

import styles from './styles';
import colors from '../../../constants/colors';

import { RootState, AppDispatch } from '../../../store';
import { clearData } from '../../../store/slices/authSlice';
import { clearSecuritySettings } from '../../../store/slices/securitySlice';

const SettingsScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const { fullName, email } = useSelector((state: RootState) => state.auth);

  const handleLogout = async () => {
    try {
      await dispatch(clearSecuritySettings());
      await signOut(getAuth());
      dispatch(clearData());
    } catch (err: any) {
      console.log('err :: ', err)
      dispatch(clearData());
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header with back button */}
        <AppHeader containerStyle={styles.header} />

        {/* User Profile Quick View */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpCkjpSUNh8OW6aaGkGZnHWQ7bUf8K9zgn5dm253D4mdx0F5L_PiJTl4VoQgkY3qbnjU4Xi9xIaMpQLAm6Z2X85SfW4rugSkPy5y7OUtGIiAKSlw6bvwG_xCM-omR_7NdTPAA6gibVM7ZeZIBmFrLr1ieqfjuA3RHeQf5eF3tEmWA1MBVLvfSNZshs3fEod3g8whrTSOBeR4iWFMKmf1jBCoiLPu8ZhuTW6uAhYfct6dhUApk8bbRuP0NyWwzTfInyk9NEhHXsBjCy' }} 
              style={styles.avatar} 
            />
          </View>
          <AppText style={styles.name}>{fullName || 'User'}</AppText>
          <AppText style={styles.email}>{email || 'user@example.com'}</AppText>
          <View style={styles.badgeContainer}>
            <Ionicons name="checkmark-circle" size={16} color={colors.deepTeal} />
            <AppText style={styles.badgeText}>{"Pro Account"}</AppText>
          </View>
        </View>

        {/* Settings List Container */}
        <View style={styles.settingsContainer}>
          <View style={styles.sectionHeader}>
            <AppText style={styles.sectionHeaderText}>{"ACCOUNT SETTINGS"}</AppText>
          </View>

          <SettingsItem 
            title="Profile Details"
            subtitle="View and manage your personal account information"
            iconName="settings-outline"
            onPress={() => navigation.navigate('ProfileDetails' as never)}
          />

          <View style={styles.divider} />

          <SettingsItem 
            title="Security Settings"
            subtitle="Two-Factor, Biometrics, and Keys"
            iconName="shield-checkmark-outline"
            onPress={() => navigation.navigate('SecuritySettings' as never)}
          />

          <View style={styles.sectionHeader}>
            <AppText style={styles.sectionHeaderText}>{"SESSION"}</AppText>
          </View>

          <SettingsItem 
            title="Logout"
            subtitle="Securely sign out of this device"
            iconName="log-out-outline"
            iconColor={colors.red}
            iconBgColor={colors.red10}
            titleColor={colors.red}
            subtitleColor={colors.red}
            showChevron={false}
            onPress={() => setLogoutModalVisible(true)}
          />
        </View>

        <CommonAlert
          visible={logoutModalVisible}
          title="Logout?"
          description="Are you sure you want to logout? You will need to sign in again to access your passwords."
          confirmText="Logout"
          icon="log-out-outline"
          onClose={() => setLogoutModalVisible(false)}
          onConfirm={() => {
            setLogoutModalVisible(false);
            handleLogout();
          }}
        />

        {/* Meta Information */}
        <View style={styles.metaContainer}>
          <AppText style={styles.versionText}>{`Sentinel Key v2.4.1 (Stable Build)`}</AppText>
          <AppText style={styles.encryptedText}>{"ENCRYPTED BY AES-256"}</AppText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;
