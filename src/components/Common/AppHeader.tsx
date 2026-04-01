import React from 'react';
import { View, TouchableOpacity, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';

import AppText from './AppText';

import colors from '../../constants/colors';

interface AppHeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  backIconColor?: string;
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  showBackButton = true,
  onBackPress,
  backIconColor = colors.deepTeal,
  leftContent,
  rightContent,
  containerStyle,
  titleStyle,
}) => {
  const navigation = useNavigation();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {leftContent ? (
        leftContent
      ) : showBackButton ? (
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={backIconColor} />
        </TouchableOpacity>
      ) : (
        <View style={styles.spacer} />
      )}

      {title ? (
        <AppText style={[styles.title, titleStyle]}>{title}</AppText>
      ) : null}

      {rightContent ? (
        rightContent
      ) : title ? (
        <View style={styles.spacer} />
      ) : null}
    </View>
  );
};

export default AppHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
    marginLeft: -8, // To align actual icon with edge if parent has padding
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.deepTeal,
    flex: 1,
    textAlign: 'center',
  },
  spacer: {
    width: 40, // Rough size of back button to keep title centered
  }
});
