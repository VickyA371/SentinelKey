import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import Icon from '@react-native-vector-icons/feather';
import { yupResolver } from '@hookform/resolvers/yup';
import firestore from '@react-native-firebase/firestore';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useForm } from 'react-hook-form';

import { RootState } from '../../../store';
import { setData } from '../../../store/slices/authSlice';
import { showSuccess, showError } from '../../../utils/toast';

// components
import AppText from '../../../components/Common/AppText';
import AppInput from '../../../components/Common/AppInput';
import ValidationController from '../../../components/Common/ValidationController';
import AppHeader from '../../../components/Common/AppHeader';

// constants & schemas
import colors from '../../../constants/colors';
import { COLLECTIONS } from '../../../constants/firebase';
import { profileDetailsSchema } from '../../../schema/validationSchema';
import styles from './styles';

type ProfileFormValues = {
  fullName: string;
  phoneNumber: string;
};

const ProfileDetailsScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const { uid, fullName, email, phoneNumber, isAccountVerified, createdAt } = useSelector((state: RootState) => state.auth);

  const [loading, setLoading] = useState(false);

  const form = useForm<ProfileFormValues>({
    defaultValues: {
      fullName: fullName || "",
      phoneNumber: phoneNumber || "",
    },
    resolver: yupResolver(profileDetailsSchema) as any,
  });

  const onValidFormSubmission = async (validFormData: ProfileFormValues) => {
    setLoading(true);
    try {
      if (!uid) throw new Error("User not authenticated.");

      const updatedData = {
        fullName: validFormData.fullName,
        phoneNumber: validFormData.phoneNumber,
      };

      // Save to Firestore
      await firestore().collection(COLLECTIONS.USERS).doc(uid).update(updatedData);

      // Update Redux
      dispatch(setData({
        uid,
        email,
        isAccountVerified,
        createdAt,
        ...updatedData
      }));

      showSuccess('Success', 'Profile details updated successfully!');
      navigation.goBack();
    } catch (error: any) {
      console.error('Update Profile Error:', error);
      showError('Update Failed', 'An error occurred while updating profile.');
    } finally {
      setLoading(false);
    }
  };

  const onInvalidFormSubmission = (invalidFormData: unknown) => {
    console.log('invalidFormData :: ', invalidFormData);
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader 
        title="Profile Details" 
        containerStyle={styles.header} 
        titleStyle={styles.headerTitle} 
      />
      <ScrollView contentContainerStyle={styles.content}>

        {/* Icon */}
        <View style={styles.iconWrapper}>
          <Ionicons name="person-outline" size={40} color={colors.deepTeal} />
        </View>

        {/* Title */}
        <AppText style={styles.title}>{"Your Information"}</AppText>
        <AppText style={styles.subtitle}>
          {"View and manage your personal account details."}
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
            autoCapitalize="words"
          />
        </ValidationController>

        {/* Email (Read-only) */}
        <AppText style={styles.label}>{"Email Address"}</AppText>
        <View style={styles.inputContainerDisabled}>
          <Icon name="mail" size={18} color={colors.mutedBlueGray} />
          <AppInput
            value={email || ""}
            editable={false}
            containerStyle={{ flex: 1, borderWidth: 0, paddingHorizontal: 0, height: 48, backgroundColor: 'transparent' }}
            style={styles.inputDisabled}
          />
        </View>

        {/* Phone Number */}
        <AppText style={styles.label}>{"Phone Number"}</AppText>
        <ValidationController
          control={form.control}
          name={'phoneNumber'}
        >
          <AppInput
            leftIcon={
              <Icon name="phone" size={18} color={colors.mutedBlueGray} />
            }
            containerStyle={styles.inputContainer}
            placeholder="+1 234 567 8900"
            placeholderTextColor={colors.mutedBlueGray}
            style={styles.input}
            keyboardType="phone-pad"
            autoCapitalize="none"
          />
        </ValidationController>

        {/* Save Button */}
        <TouchableOpacity
          onPress={form.handleSubmit(onValidFormSubmission, onInvalidFormSubmission)}
          style={[styles.button, loading && { opacity: 0.7 }]}
          disabled={loading}
        >
          <AppText style={styles.buttonText}>
            {loading ? "Saving Changes..." : "Save Changes"}
          </AppText>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileDetailsScreen;
