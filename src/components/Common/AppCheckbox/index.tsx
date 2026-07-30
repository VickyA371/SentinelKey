import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';

import AppText from '../AppText';
import colors from '../../../constants/colors';

type AppCheckboxProps = {
  value?: boolean;
  onChange?: (next: boolean) => void;
  error?: string;
  children?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
};

const AppCheckbox = ({
  value = false,
  onChange,
  error,
  children,
  containerStyle,
}: AppCheckboxProps) => {
  return (
    <View style={containerStyle}>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.checkbox, value && styles.checkboxChecked]}
          onPress={() => onChange?.(!value)}
        >
          {value && <Ionicons name="checkmark" size={14} color={colors.white} />}
        </TouchableOpacity>
        <AppText style={styles.text}>{children}</AppText>
      </View>
      {!!error && <AppText style={styles.error}>{error}</AppText>}
    </View>
  );
};

export default AppCheckbox;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: colors.mutedTeal,
    borderRadius: 4,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.deepTeal,
    borderColor: colors.mutedBlueGray,
  },
  text: {
    flex: 1,
    fontSize: 13,
    color: colors.mutedTeal,
  },
  error: {
    color: colors.red,
    fontSize: 12,
    marginTop: 4,
  },
});
