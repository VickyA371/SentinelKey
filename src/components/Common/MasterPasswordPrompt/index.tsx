import React, { useState } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from '@react-native-vector-icons/feather';
import auth from '@react-native-firebase/auth';

import AppText from '../AppText';
import AppInput from '../AppInput';
import colors from '../../../constants/colors';
import { getVaultMeta } from '../../../utils/vaultStorage';
import { verifyMasterPassword } from '../../../utils/vault';

interface Props {
  visible: boolean;
  title?: string;
  message?: string;
  onCancel: () => void;
  onSuccess: () => void;
}

/**
 * Modal that re-confirms the user's identity by verifying their master password
 * against the stored vault meta. Resolves via `onSuccess` only on a correct
 * password; never changes the vault session.
 */
const MasterPasswordPrompt = ({
  visible,
  title = 'Enter Master Password',
  message,
  onCancel,
  onSuccess,
}: Props) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const reset = () => {
    setPassword('');
    setError('');
    setLoading(false);
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  const handleConfirm = async () => {
    if (!password) {
      setError('Master password is required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const uid = auth().currentUser?.uid;
      if (!uid) {
        setError('You are not signed in.');
        setLoading(false);
        return;
      }
      const meta = await getVaultMeta(uid);
      if (!meta) {
        setError('Vault not found.');
        setLoading(false);
        return;
      }
      const ok = await verifyMasterPassword(password, meta);
      if (ok) {
        reset();
        onSuccess();
      } else {
        setError('Incorrect master password');
        setLoading(false);
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <AppText style={styles.title}>{title}</AppText>
          {!!message && <AppText style={styles.message}>{message}</AppText>}

          <AppInput
            leftIcon={<Icon name="lock" size={18} color={colors.mutedBlueGray} />}
            containerStyle={styles.inputContainer}
            placeholder="Master password"
            placeholderTextColor={colors.mutedBlueGray}
            style={styles.input}
            securedText
            value={password}
            onChangeText={setPassword}
            error={error}
            autoFocus
          />

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel} disabled={loading}>
              <AppText style={styles.cancelText}>{'Cancel'}</AppText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} disabled={loading}>
              <AppText style={styles.confirmText}>{loading ? 'Verifying...' : 'Confirm'}</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default MasterPasswordPrompt;

const styles = StyleSheet.create({
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.iceGray,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    marginTop: 8,
    backgroundColor: colors.white,
  },
  input: {
    flex: 1,
    marginLeft: 10,
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
  confirmBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.deepTeal,
    borderRadius: 10,
  },
  confirmText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
  },
});
