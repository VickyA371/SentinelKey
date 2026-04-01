import React from 'react';
import { View, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import AppText from '../Common/AppText';
import colors from '../../constants/colors';

interface SettingsItemProps {
  title: string;
  subtitle: string;
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  iconColor?: string;
  iconBgColor?: string;
  titleColor?: string;
  subtitleColor?: string;
  showChevron?: boolean;
  onPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
}

const SettingsItem: React.FC<SettingsItemProps> = ({
  title,
  subtitle,
  iconName,
  iconColor = colors.deepTeal,
  iconBgColor = 'rgba(201, 228, 242, 0.3)',
  titleColor = colors.charcoal,
  subtitleColor = colors.deepTeal,
  showChevron = true,
  onPress,
  containerStyle,
}) => {
  return (
    <TouchableOpacity 
      style={[styles.container, containerStyle]} 
      onPress={onPress} 
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={styles.leftContainer}>
        <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
          <Ionicons name={iconName} size={24} color={iconColor} />
        </View>
        <View style={styles.textContainer}>
          <AppText style={[styles.title, { color: titleColor }]}>{title}</AppText>
          <AppText style={[styles.subtitle, { color: subtitleColor }]}>{subtitle}</AppText>
        </View>
      </View>
      {showChevron && (
        <Ionicons name="chevron-forward-outline" size={20} color={colors.mutedBlueGray} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: colors.white,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.6,
  },
});

export default SettingsItem;
