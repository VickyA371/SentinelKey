import React from 'react';
import { View } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';

import AppText from '../AppText';

import colors from '../../../constants/colors';
import styles from './styles';

interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({ title, subtitle }) => {
  return (
    <>
      <View style={styles.iconWrapper}>
        <Ionicons name="shield-half-outline" size={40} color={colors.deepTeal} />
      </View>

      <AppText style={styles.title}>{title}</AppText>
      <AppText style={styles.subtitle}>{subtitle}</AppText>
    </>
  );
};

export default AuthHeader;
