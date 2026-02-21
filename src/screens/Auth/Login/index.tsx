import React from 'react';
import {
  View,
  StatusBar,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@react-native-vector-icons/feather';
import { yupResolver } from "@hookform/resolvers/yup"

// hooks
import { useForm } from "react-hook-form"
import { useNavigation } from '@react-navigation/native';

// components
import AppText from '../../../components/Common/AppText';
import AppInput from '../../../components/Common/AppInput';
import TextButton from '../../../components/Common/TextButton';
import FullWidthButton from '../../../components/Common/FullWidthButton';
import ValidationController from '../../../components/Common/ValidationController';

// constants
import colors from '../../../constants/colors';
import styles from './styles';

// types
import { LoginFormValues } from './types';
import { AuthScreensPropTypes } from '../../../navigation';

// Misc
import { loginFormSchema } from '../../../schema/validationSchema';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const hookFormParams = {
  defaultValues: {
    email: "",
    password: "",
    isPasswordVisible: false,
  },
  resolver: yupResolver(loginFormSchema)
};

const LoginScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthScreensPropTypes>>();
  
  const form = useForm<LoginFormValues>(hookFormParams)
  
  const onValidFormSubmission = (validFormData: unknown) => {
    console.log('validFormData :: ', validFormData)
  }

  const onInvalidFormSubmission = (invalidFormData: unknown) => {
    console.log('invalidFormData :: ', invalidFormData)
  }

  const handleCreateAccount = () => {
    navigation.navigate('Signup')
  }

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
      <ValidationController
        control={form.control}
        name={'email'}
      >
        <AppInput
          leftIcon={
            <Icon name="mail" size={18} color={colors.mutedBlueGray} />
          }
          containerStyle={styles.inputContainer}
          placeholder="name@example.com"
          placeholderTextColor={colors.mutedBlueGray}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </ValidationController>

      {/* Forgot Password */}
      <View style={styles.passwordHeader}>
        <AppText style={styles.label}>{"Password"}</AppText>
        <TextButton
          textStyle={styles.forgot}
          btnText='Forgot Password?'
          onPress={() => {}}
        />
      </View>

      {/* Password */}
      <ValidationController
        control={form.control}
        name={'password'}
      >
        <AppInput
          leftIcon={
            <Icon name="lock" size={18} color={colors.mutedBlueGray} />
          }
          containerStyle={styles.inputContainer}
          placeholder="••••••••••"
          placeholderTextColor={colors.mutedBlueGray}
          style={styles.input}
          securedText
        />
      </ValidationController>

      {/* Login Button */}
      <FullWidthButton
        buttonText="Login"
        onPress={form.handleSubmit(onValidFormSubmission, onInvalidFormSubmission)}
        loading={false}
        disabled={false}
      />

      {/* Footer */}
      <Pressable onPress={handleCreateAccount} style={styles.footer}>
        <AppText style={styles.footerText}>
          {`Don't have an account? `}
          <AppText style={styles.createAccount}>{"Create Account"}</AppText>
        </AppText>
      </Pressable>
    </SafeAreaView>
  );
};

export default LoginScreen;
