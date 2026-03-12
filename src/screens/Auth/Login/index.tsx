import React from 'react';
import {
  View,
  StatusBar,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@react-native-vector-icons/feather';
import { yupResolver } from "@hookform/resolvers/yup"
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useDispatch } from 'react-redux';
import { Alert } from 'react-native';
import { setData } from '../../../store/slices/authSlice';
import { useState } from 'react';

// hooks
import { useForm } from "react-hook-form"
import { NavigationProp, useNavigation } from '@react-navigation/native';

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
import { AuthScreensPropTypes } from '../../../navigation/types';

// Misc
import { loginFormSchema } from '../../../schema/validationSchema';

const hookFormParams = {
  defaultValues: {
    email: "",
    password: "",
    isPasswordVisible: false,
  },
  resolver: yupResolver(loginFormSchema)
};

const LoginScreen = () => {
  const navigation = useNavigation<NavigationProp<AuthScreensPropTypes>>();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);

  const form = useForm<LoginFormValues>(hookFormParams)

  const onValidFormSubmission = async (validFormData: LoginFormValues) => {
    setLoading(true);
    try {
      const { email, password } = validFormData;

      // 1. Sign in with Firebase Auth
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const { uid, emailVerified } = userCredential.user;

      // 2. Fetch user data from Firestore
      const userDoc = await firestore().collection('users').doc(uid).get();

      if (userDoc.exists()) {
        const userData = userDoc.data() as any;
        // 3. Update Redux store (include email verification so navigator shows correct group)
        dispatch(setData({
          uid: userData.uid,
          fullName: userData.fullName,
          email: userData.email,
          phoneNumber: userData.phoneNumber,
          createdAt: userData.createdAt,
          isAccountVerified: emailVerified,
        }));
        if (emailVerified) {
          Alert.alert('Success', 'Logged in successfully!');
        }
      }
    } catch (error: any) {
      console.error('Login Error:', error);
      let errorMessage = 'An error occurred during login.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'That email address is invalid!';
      }
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
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
          onPress={() => { }}
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
        buttonText={loading ? "Logging in..." : "Login"}
        onPress={form.handleSubmit(onValidFormSubmission, onInvalidFormSubmission)}
        loading={loading}
        disabled={loading}
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
