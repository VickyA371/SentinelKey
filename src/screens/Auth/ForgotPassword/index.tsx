import React, { useState } from 'react';
import { View, StatusBar, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@react-native-vector-icons/feather';
import Ionicons from '@react-native-vector-icons/ionicons';
import { yupResolver } from "@hookform/resolvers/yup";
import auth from '@react-native-firebase/auth';
import { useForm } from "react-hook-form";
import { NavigationProp, useNavigation } from '@react-navigation/native';

import AppText from '../../../components/Common/AppText';
import AppInput from '../../../components/Common/AppInput';
import FullWidthButton from '../../../components/Common/FullWidthButton';
import ValidationController from '../../../components/Common/ValidationController';
import AppHeader from '../../../components/Common/AppHeader';
import AuthHeader from '../../../components/Common/AuthHeader';

import styles from './styles';
import colors from '../../../constants/colors';
import { showSuccess, showError } from '../../../utils/toast';

import { ForgotPasswordFormValues } from './types';
import { AuthScreensPropTypes } from '../../../navigation/types';
import { forgotPasswordSchema } from '../../../schema/validationSchema';

const hookFormParams = {
  defaultValues: { email: "" },
  resolver: yupResolver(forgotPasswordSchema)
};

const ForgotPasswordScreen = () => {
  const navigation = useNavigation<NavigationProp<AuthScreensPropTypes>>();
  const [loading, setLoading] = useState(false);
  const form = useForm<ForgotPasswordFormValues>(hookFormParams);

  const onValidFormSubmission = async (data: ForgotPasswordFormValues) => {
    setLoading(true);
    try {
      await auth().sendPasswordResetEmail(data.email);
      showSuccess('Success', 'Password reset email sent. Please check your inbox.');
      navigation.goBack();
    } catch (error: any) {
      console.error('Password Reset Error:', error);
      let errorMessage = 'An error occurred while sending the reset email.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No user found with this email address.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'That email address is invalid!';
      }
      showError('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <AppHeader
        title="Sentinel Key"
        showBackButton={true}
        onBackPress={handleBackToLogin}
        containerStyle={{ marginBottom: 30, marginTop: 10 }}
        titleStyle={{ fontSize: 18, fontWeight: '600' }}
      />

      <View style={styles.contentContainer}>
        <AuthHeader
          title="Reset Password"
          subtitle="Enter your verified email address to receive password reset instructions"
        />

        {/* Email Input */}
        <AppText style={styles.label}>{"Email Address"}</AppText>
        <ValidationController control={form.control} name={'email'}>
          <AppInput
            leftIcon={<Icon name="mail" size={18} color={colors.mutedBlueGray} />}
            containerStyle={styles.inputContainer}
            placeholder="name@example.com"
            placeholderTextColor={colors.mutedBlueGray}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </ValidationController>

        {/* Submit Button */}
        <FullWidthButton
          buttonText={loading ? "Sending..." : "Send Reset Link"}
          onPress={form.handleSubmit(onValidFormSubmission)}
          loading={loading}
          disabled={loading}
        />

        {/* Footer */}
        <Pressable onPress={handleBackToLogin} style={styles.footer}>
          <AppText style={styles.footerText}>
            {`Remember your password? `}
            <AppText style={styles.loginText}>{"Log In"}</AppText>
          </AppText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;
