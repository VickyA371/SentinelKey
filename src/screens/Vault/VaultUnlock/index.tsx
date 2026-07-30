import React, { useState } from 'react';
import { View, StyleSheet, StatusBar, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@react-native-vector-icons/feather';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch, useSelector } from 'react-redux';
import { getAuth, signOut } from '@react-native-firebase/auth';

import AppText from '../../../components/Common/AppText';
import AppInput from '../../../components/Common/AppInput';
import AuthHeader from '../../../components/Common/AuthHeader';
import FullWidthButton from '../../../components/Common/FullWidthButton';
import ValidationController from '../../../components/Common/ValidationController';

import colors from '../../../constants/colors';
import { showError } from '../../../utils/toast';
import { unlockVault } from '../../../utils/vault';
import { RootState } from '../../../store';
import { setVaultStatus } from '../../../store/slices/vaultSlice';
import { unlockVaultSchema } from '../../../schema/validationSchema';

interface FormValues {
  masterPassword: string;
}

const VaultUnlockScreen = () => {
  const dispatch = useDispatch();
  const meta = useSelector((state: RootState) => state.vault.meta);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    defaultValues: { masterPassword: '' },
    resolver: yupResolver(unlockVaultSchema),
  });

  const onSubmit = async (data: FormValues) => {
    if (!meta) {
      showError('Error', 'Vault key not found. Please log in again.');
      return;
    }
    setLoading(true);
    try {
      const ok = await unlockVault(data.masterPassword, meta);
      if (ok) {
        dispatch(setVaultStatus('unlocked'));
      } else {
        showError('Incorrect password', 'The master password you entered is incorrect.');
        form.reset({ masterPassword: '' });
      }
    } catch (error) {
      showError('Error', 'Could not unlock your vault. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(getAuth());
    } catch (error) {
      // Auth listener will still reset state on the next tick.
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.iconWrapper}>
        <Icon name="lock" size={40} color={colors.deepTeal} />
      </View>
      <AuthHeader
        title="Unlock Your Vault"
        subtitle="Enter your master password to decrypt your vault on this device."
      />

      <AppText style={styles.label}>{'Master Password'}</AppText>
      <ValidationController control={form.control} name={'masterPassword'}>
        <AppInput
          leftIcon={<Icon name="lock" size={18} color={colors.mutedBlueGray} />}
          containerStyle={styles.inputContainer}
          placeholder="Enter master password"
          placeholderTextColor={colors.mutedBlueGray}
          style={styles.input}
          securedText
        />
      </ValidationController>

      <FullWidthButton
        buttonText={loading ? 'Unlocking...' : 'Unlock'}
        onPress={form.handleSubmit(onSubmit)}
        loading={loading}
        disabled={loading}
      />

      <Pressable onPress={handleLogout} style={styles.footer}>
        <AppText style={styles.footerText}>{'Log out'}</AppText>
      </Pressable>
    </SafeAreaView>
  );
};

export default VaultUnlockScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.offWhiteBlueGray,
    paddingHorizontal: 20,
  },
  iconWrapper: {
    alignSelf: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.transparentTeal01,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: colors.charcoal,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: colors.charcoal,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.iceGray,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    marginBottom: 15,
    backgroundColor: colors.white,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: colors.deepTeal,
    fontWeight: '600',
  },
});
