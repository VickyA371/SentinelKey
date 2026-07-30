import React, { useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@react-native-vector-icons/feather';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch } from 'react-redux';
import auth from '@react-native-firebase/auth';

import AppText from '../../../components/Common/AppText';
import AppInput from '../../../components/Common/AppInput';
import AuthHeader from '../../../components/Common/AuthHeader';
import FullWidthButton from '../../../components/Common/FullWidthButton';
import ValidationController from '../../../components/Common/ValidationController';

import colors from '../../../constants/colors';
import { showError, showSuccess } from '../../../utils/toast';
import { createVault, lockVault } from '../../../utils/vault';
import { saveVaultMeta } from '../../../utils/vaultStorage';
import { setVaultStatus } from '../../../store/slices/vaultSlice';
import { createMasterPasswordSchema } from '../../../schema/validationSchema';

interface FormValues {
  masterPassword: string;
  confirmMasterPassword: string;
}

const VaultSetupScreen = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    defaultValues: { masterPassword: '', confirmMasterPassword: '' },
    resolver: yupResolver(createMasterPasswordSchema),
  });

  const onSubmit = async (data: FormValues) => {
    const uid = auth().currentUser?.uid;
    if (!uid) {
      showError('Error', 'You are not signed in. Please log in again.');
      return;
    }
    setLoading(true);
    try {
      // createVault also unlocks the in-memory session on success.
      const meta = await createVault(data.masterPassword);
      await saveVaultMeta(uid, meta);
      dispatch(setVaultStatus('unlocked'));
      showSuccess('Vault ready', 'Your master password protects your vault.');
    } catch (error) {
      // If persistence failed, drop the session so we don't hold a DEK whose
      // wrapped copy was never stored (which would orphan future data).
      lockVault();
      showError('Error', 'Could not create your vault. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <AuthHeader
        title="Create Master Password"
        subtitle="This password encrypts your vault. It is never sent to our servers."
      />

      <View style={styles.warning}>
        <Icon name="alert-triangle" size={16} color={colors.deepTeal} />
        <AppText style={styles.warningText}>
          If you forget this password, your vault cannot be recovered. There is no reset.
        </AppText>
      </View>

      <AppText style={styles.label}>{'Master Password'}</AppText>
      <ValidationController control={form.control} name={'masterPassword'}>
        <AppInput
          leftIcon={<Icon name="lock" size={18} color={colors.mutedBlueGray} />}
          containerStyle={styles.inputContainer}
          placeholder="At least 10 characters"
          placeholderTextColor={colors.mutedBlueGray}
          style={styles.input}
          securedText
        />
      </ValidationController>

      <AppText style={styles.label}>{'Confirm Master Password'}</AppText>
      <ValidationController control={form.control} name={'confirmMasterPassword'}>
        <AppInput
          leftIcon={<Icon name="lock" size={18} color={colors.mutedBlueGray} />}
          containerStyle={styles.inputContainer}
          placeholder="Re-enter master password"
          placeholderTextColor={colors.mutedBlueGray}
          style={styles.input}
          securedText
        />
      </ValidationController>

      <FullWidthButton
        buttonText={loading ? 'Creating Vault...' : 'Create Vault'}
        onPress={form.handleSubmit(onSubmit)}
        loading={loading}
        disabled={loading}
      />
    </SafeAreaView>
  );
};

export default VaultSetupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.offWhiteBlueGray,
    paddingHorizontal: 20,
  },
  warning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: colors.transparentTeal01,
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: colors.charcoal,
    lineHeight: 18,
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
});
