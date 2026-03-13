import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import Icon from '@react-native-vector-icons/feather';
import { yupResolver } from '@hookform/resolvers/yup';
import { createUserWithEmailAndPassword, getAuth } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useDispatch } from 'react-redux';
import { Alert } from 'react-native';
import { setData } from '../../../store/slices/authSlice';

// hooks
import { useForm } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';

// components
import AppText from '../../../components/Common/AppText';
import AppInput from '../../../components/Common/AppInput';
import ValidationController from '../../../components/Common/ValidationController';

// constants
import colors from '../../../constants/colors';
import { COLLECTIONS } from '../../../constants/firebase';

// types
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { type SignupFormValues } from './types';

// misc
import { signUpFormSchema } from '../../../schema/validationSchema';
import { AuthScreensPropTypes } from '../../../navigation/types';

const hookFormParams = {
  defaultValues: {
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    termsAndConditionsAccepted: false
  },
  resolver: yupResolver(signUpFormSchema)
};

const SignUpScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthScreensPropTypes>>();
  const dispatch = useDispatch();

  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<SignupFormValues>(hookFormParams)

  const onValidFormSubmission = async (validFormData: SignupFormValues) => {
    if (!agreed) {
      Alert.alert('Error', 'Please agree to the Terms of Service and Privacy Policy.');
      return;
    }

    setLoading(true);
    try {
      const { email, password, fullName, phoneNumber } = validFormData;

      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(getAuth(), email, password);
      const { uid } = userCredential.user;

      const userData = {
        uid,
        fullName,
        email,
        phoneNumber,
        createdAt: new Date().toISOString(),
        isAccountVerified: userCredential.user.emailVerified,
      };

      // 2. Save user data to Firestore
      await firestore().collection(COLLECTIONS.USERS).doc(uid).set(userData);

      const actionCodeSettings = {
        handleCodeInApp: true,
        url: 'https://sentinel-key.firebaseapp.com/verified',
        iOS: { bundleId: 'com.sentinelkey' },
        android: { packageName: 'com.sentinelkey', installApp: false },
      };
      await userCredential.user.sendEmailVerification(actionCodeSettings);

      // 3. Update Redux store
      dispatch(setData(userData));

      Alert.alert('Success', 'Account created successfully and account verification link sent to the registered email address Open the link in the email to verify—it will open this app.');
      // Navigation will likely be handled by an auth listener in the root navigator, 
      // but if not, we could navigate here.
    } catch (error: any) {
      setLoading(false);
      console.error('Signup Error:', error);
      let errorMessage = 'An error occurred during signup.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'That email address is already in use!';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'That email address is invalid!';
      }
      Alert.alert('Signup Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  }

  const onInvalidFormSubmission = (invalidFormData: unknown) => {
    console.log('invalidFormData :: ', invalidFormData)
  }

  const goToLoginScreen = () => {
    if (navigation.canGoBack()) {
      navigation.goBack()
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={goToLoginScreen}
            style={styles.backBtn}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={colors.deepTeal}
            />
          </Pressable>
          <AppText style={styles.headerTitle}>{"Sentinel Key"}</AppText>
        </View>

        {/* Icon */}
        <View style={styles.iconWrapper}>
          <Ionicons name="shield-checkmark-outline" size={40} color={colors.deepTeal} />
        </View>

        {/* Title */}
        <AppText style={styles.title}>{"Secure Your Digital Life"}</AppText>
        <AppText style={styles.subtitle}>
          {"Join Sentinel Key and protect your identity."}
        </AppText>

        {/* Full Name */}
        <AppText style={styles.label}>{"Full Name"}</AppText>
        <ValidationController
          control={form.control}
          name={'fullName'}
        >
          <AppInput
            leftIcon={
              <Icon name="user" size={18} color={colors.mutedBlueGray} />
            }
            containerStyle={styles.inputContainer}
            placeholder="Enter Full Name"
            placeholderTextColor={colors.mutedBlueGray}
            style={styles.input}
            autoCapitalize="none"
          />
        </ValidationController>

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

        {/* Phone Number */}
        <AppText style={styles.label}>{"Phone Number"}</AppText>
        <ValidationController
          control={form.control}
          name={'phoneNumber'}
        >
          <AppInput
            leftIcon={
              <Icon name="mail" size={18} color={colors.mutedBlueGray} />
            }
            containerStyle={styles.inputContainer}
            placeholder="+91 1234567890"
            placeholderTextColor={colors.mutedBlueGray}
            style={styles.input}
            keyboardType="number-pad"
            autoCapitalize="none"
          />
        </ValidationController>

        {/* Password */}
        <AppText style={styles.label}>{"Password"}</AppText>
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

        {/* Confirm Password */}
        <AppText style={styles.label}>{"Confirm Password"}</AppText>
        <ValidationController
          control={form.control}
          name={'confirmPassword'}
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

        {/* Terms */}
        <View style={styles.termsContainer}>
          <TouchableOpacity
            style={[
              styles.checkbox,
              agreed && styles.checkboxChecked,
            ]}
            onPress={() => setAgreed(!agreed)}
          >
            {agreed && (
              <Ionicons name="checkmark" size={14} color={colors.white} />
            )}
          </TouchableOpacity>
          <AppText style={styles.termsText}>
            {'By creating an account, you agree to our '}
            <AppText style={styles.link}>{"Terms of Service"}</AppText>{' and '}
            <AppText style={styles.link}>{"Privacy Policy"}</AppText>.
          </AppText>
        </View>

        {/* Button */}
        <TouchableOpacity
          onPress={form.handleSubmit(onValidFormSubmission, onInvalidFormSubmission)}
          style={[styles.button, loading && { opacity: 0.7 }]}
          disabled={loading}
        >
          <AppText style={styles.buttonText}>
            {loading ? "Creating Account..." : "Create Account"}
          </AppText>
        </TouchableOpacity>

        {/* Footer */}
        <Pressable onPress={goToLoginScreen} style={styles.footer}>
          <AppText style={styles.footerText}>
            {'Already have an account? '}
            <AppText style={styles.link}>{"Log In"}</AppText>
          </AppText>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.offWhiteBlueGray,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  backBtn: {
    padding: 5,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: colors.deepTeal,
    marginRight: 24,
  },
  iconWrapper: {
    alignSelf: 'center',
    backgroundColor: colors.lightCyanBlue,
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    color: colors.charcoal,
  },
  subtitle: {
    textAlign: 'center',
    color: colors.mutedBlueGray,
    marginTop: 8,
    marginBottom: 30,
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
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 25,
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
  termsText: {
    flex: 1,
    fontSize: 13,
    color: colors.mutedTeal,
  },
  link: {
    color: colors.deepTeal,
    fontWeight: '600',
  },
  button: {
    backgroundColor: colors.deepTeal,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 10,
  },
  footerText: {
    fontSize: 14,
    color: colors.mutedTeal,
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