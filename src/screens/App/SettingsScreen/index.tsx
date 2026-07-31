import React, { useState } from 'react';
import { View, Image, TouchableOpacity, ScrollView, Share, Platform, Modal, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useDispatch, useSelector } from 'react-redux';
import {
  getAuth,
  signOut,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
} from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';

import AppText from '../../../components/Common/AppText';
import AppHeader from '../../../components/Common/AppHeader';
import AppInput from '../../../components/Common/AppInput';
import SettingsItem from '../../../components/SettingsScreen/SettingsItem';
import CommonAlert from '../../../components/Common/CommonAlert';

import styles from './styles';
import colors from '../../../constants/colors';
import { COLLECTIONS } from '../../../constants/firebase';

import { RootState, AppDispatch } from '../../../store';
import { clearData } from '../../../store/slices/authSlice';
import { clearSecuritySettings } from '../../../store/slices/securitySlice';
import { resetVault } from '../../../store/slices/vaultSlice';
import { lockVault, verifyMasterPassword } from '../../../utils/vault';
import { getVaultMeta } from '../../../utils/vaultStorage';
import { disableBiometricUnlock } from '../../../utils/biometricVault';
import { showSuccess, showError } from '../../../utils/toast';

const SettingsScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [deleteAlertVisible, setDeleteAlertVisible] = useState(false);
  const [pwModalVisible, setPwModalVisible] = useState(false);
  const [accountPassword, setAccountPassword] = useState('');
  const [masterPassword, setMasterPassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [accountError, setAccountError] = useState('');
  const [masterError, setMasterError] = useState('');

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

  const closePwModal = () => {
    setPwModalVisible(false);
    setAccountPassword('');
    setMasterPassword('');
    setAccountError('');
    setMasterError('');
    setDeleting(false);
  };

  const handleDeleteAccount = async () => {
    setAccountError('');
    setMasterError('');
    if (!accountPassword || !masterPassword) {
      if (!accountPassword) setAccountError('Password is required');
      if (!masterPassword) setMasterError('Password is required');
      return;
    }
    setDeleting(true);
    try {
      const authInstance = getAuth();
      const user = authInstance.currentUser;
      if (!user?.email) {
        setAccountError('You are not signed in.');
        setDeleting(false);
        return;
      }
      const uid = user.uid;

      // 1. Verify the master password against the stored vault meta.
      const meta = await getVaultMeta(uid);
      if (!meta) {
        setMasterError('Vault not found.');
        setDeleting(false);
        return;
      }
      const masterOk = await verifyMasterPassword(masterPassword, meta);
      if (!masterOk) {
        setMasterError('Incorrect master password.');
        setDeleting(false);
        return;
      }

      // 2. Re-authenticate with the account password — Firebase requires a
      // recent login to delete an account (also verifies the login password).
      const credential = EmailAuthProvider.credential(user.email, accountPassword);
      await reauthenticateWithCredential(user, credential);

      // 3. Delete all of the user's Firestore data while still authenticated.
      const db = firestore();
      const passwordsSnap = await db
        .collection(COLLECTIONS.PASSWORDS)
        .where('userId', '==', uid)
        .get();
      const batch = db.batch();
      passwordsSnap.forEach((doc) => batch.delete(doc.ref));
      batch.delete(db.collection(COLLECTIONS.VAULT_META).doc(uid));
      batch.delete(db.collection(COLLECTIONS.USERS).doc(uid));
      await batch.commit();

      // 3. Delete the Firebase Auth account.
      await deleteUser(user);

      // 4. Local cleanup (the auth listener also routes back to the login flow).
      lockVault();
      await disableBiometricUnlock();
      await dispatch(clearSecuritySettings());
      dispatch(resetVault());
      dispatch(clearData());

      closePwModal();
      showSuccess('Account deleted', 'Your account and all data have been permanently removed.');
    } catch (error: any) {
      const code = error?.code;
      if (
        code === 'auth/wrong-password' ||
        code === 'auth/invalid-credential' ||
        code === 'auth/invalid-login-credentials'
      ) {
        setAccountError('Incorrect account password.');
      } else if (code === 'auth/too-many-requests') {
        setAccountError('Too many attempts. Please try again later.');
      } else {
        console.error('Account deletion error:', error);
        setAccountError('Could not delete your account. Please try again.');
      }
      setDeleting(false);
    }
  };

  const shareApp = async () => {
    const url = "https://www.google.com";
    const message = `🔐 Tired of forgetting passwords?

      Sentinel Key lets you securely store and manage all your passwords with bank-level encryption — fast, simple, and safe.

      Try it now:
      https://www.google.com`;

    try {
      await Share.share(
        {
          title: "Share With",
          message: message,
          url: Platform.OS === 'ios' ? url : undefined,
        },
        {
          dialogTitle: "Share with",
          tintColor: colors.deepTeal,
        }
      );
    } catch (error) {
      console.error(error);
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

          <View style={styles.sectionHeader}>
            <AppText style={styles.sectionHeaderText}>{"APPLICATION"}</AppText>
          </View>

          <SettingsItem 
            title="Security Settings"
            subtitle="Two-Factor, Biometrics, and Keys"
            iconName="shield-checkmark-outline"
            onPress={() => navigation.navigate('SecuritySettings' as never)}
          />

          <View style={styles.divider} />

          <SettingsItem 
            title="Share"
            subtitle="Help your connections stay secure"
            iconName="share-social-outline"
            onPress={shareApp}
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

          <SettingsItem
            title="Delete Account"
            subtitle="Permanently erase your account and all data"
            iconName="trash-outline"
            iconColor={colors.red}
            iconBgColor={colors.red10}
            titleColor={colors.red}
            subtitleColor={colors.red}
            showChevron={false}
            onPress={() => setDeleteAlertVisible(true)}
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

        <CommonAlert
          visible={deleteAlertVisible}
          title="Delete Account?"
          description="This permanently deletes your account and all stored passwords. This action cannot be undone."
          confirmText="Delete Account"
          icon="warning"
          onClose={() => setDeleteAlertVisible(false)}
          onConfirm={() => {
            setDeleteAlertVisible(false);
            setPwModalVisible(true);
          }}
        />

        <Modal
          visible={pwModalVisible}
          transparent
          animationType="fade"
          onRequestClose={closePwModal}
        >
          <View style={mStyles.overlay}>
            <View style={mStyles.card}>
              <AppText style={mStyles.title}>{'Confirm Deletion'}</AppText>
              <AppText style={mStyles.message}>
                {'Enter your account password and master password to permanently delete your account.'}
              </AppText>
              <AppText style={mStyles.fieldLabel}>{'Account Password'}</AppText>
              <AppInput
                placeholder="Account password"
                placeholderTextColor={colors.mutedBlueGray}
                securedText
                autoCapitalize="none"
                value={accountPassword}
                onChangeText={setAccountPassword}
                error={accountError}
                containerStyle={mStyles.inputContainer}
                style={mStyles.input}
              />
              <AppText style={[mStyles.fieldLabel, mStyles.fieldLabelSpaced]}>{'Master Password'}</AppText>
              <AppInput
                placeholder="Master password"
                placeholderTextColor={colors.mutedBlueGray}
                securedText
                autoCapitalize="none"
                value={masterPassword}
                onChangeText={setMasterPassword}
                error={masterError}
                containerStyle={mStyles.inputContainer}
                style={mStyles.input}
              />

              <View style={mStyles.actions}>
                <TouchableOpacity style={mStyles.cancelBtn} onPress={closePwModal} disabled={deleting}>
                  <AppText style={mStyles.cancelText}>{'Cancel'}</AppText>
                </TouchableOpacity>
                <TouchableOpacity style={mStyles.deleteBtn} onPress={handleDeleteAccount} disabled={deleting}>
                  <AppText style={mStyles.deleteText}>{deleting ? 'Deleting...' : 'Delete Account'}</AppText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Meta Information */}
        <View style={styles.metaContainer}>
          <AppText style={styles.versionText}>{`Sentinel Key v2.4.1 (Stable Build)`}</AppText>
          <AppText style={styles.encryptedText}>{"ENCRYPTED BY AES-256"}</AppText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const mStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.charcoal,
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: colors.mutedTeal,
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.charcoal,
    marginBottom: 6,
  },
  fieldLabelSpaced: {
    marginTop: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.iceGray,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    backgroundColor: colors.white,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.charcoal,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    gap: 12,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.mutedTeal,
  },
  deleteBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.red,
    borderRadius: 10,
  },
  deleteText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
  },
});

export default SettingsScreen;
