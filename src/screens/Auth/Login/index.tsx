import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@react-native-vector-icons/feather';

// components
import AppText from '../../../components/Common/AppText';
import AppInput from '../../../components/Common/AppInput';
import TextButton from '../../../components/Common/TextButton';
import FullWidthButton from '../../../components/Common/FullWidthButton';

// constants
import colors from '../../../constants/colors';
import styles from './styles';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [secureText, setSecureText] = useState<boolean>(true);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Logo Section */}
      <View style={styles.logoContainer}>
        <View style={styles.logoIcon}>
          <Icon name="key" size={24} color={colors.white} />
        </View>
        <AppText style={styles.appTitle}>{"Sentinel Key"}</AppText>
      </View>

      {/* Welcome Card */}
      <View style={styles.card}>
        <Icon name="lock" size={50} color={colors.mutedBlueGray} />
        <AppText style={styles.welcomeText}>{"Welcome Back"}</AppText>
        <AppText style={styles.subtitle}>
          {"Access your encrypted vault securely"}
        </AppText>
      </View>

      {/* Email */}
      <AppText style={styles.label}>{"Email Address"}</AppText>
      <AppInput
        leftIcon={
          <Icon name="mail" size={18} color={colors.mutedBlueGray} />
        }
        containerStyle={styles.inputContainer}
        placeholder="name@example.com"
        placeholderTextColor={colors.mutedBlueGray}
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Password */}
      <View style={styles.passwordHeader}>
        <AppText style={styles.label}>{"Master Password"}</AppText>
        <TextButton
          textStyle={styles.forgot}
          btnText='Forgot Password?'
          onPress={() => {}}
        />
      </View>

      <AppInput
        leftIcon={
          <Icon name="lock" size={18} color={colors.mutedBlueGray} />
        }
        rightIcon={
          <TouchableOpacity
            testID='password-toggle'
            onPress={() => setSecureText(!secureText)}>
            <Icon
              name={secureText ? 'eye' : 'eye-off'}
              size={18}
              color={colors.mutedBlueGray}
            />
          </TouchableOpacity>
        }
        containerStyle={styles.inputContainer}
        placeholder="••••••••••"
        placeholderTextColor={colors.mutedBlueGray}
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry={secureText}
      />

      {/* Login Button */}
      <FullWidthButton
        buttonText="Login"
        onPress={() => {}}
        loading={false}
        disabled={false}
      />

      {/* Footer */}
      <View style={styles.footer}>
        <AppText style={styles.footerText}>
          {`Don't have an account? `}
          <AppText style={styles.createAccount}>{"Create Account"}</AppText>
        </AppText>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;
