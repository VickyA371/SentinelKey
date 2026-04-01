import React from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { showSuccess, showError } from "../../../utils/toast";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// components
import AppText from "../../../components/Common/AppText";
import AppHeader from "../../../components/Common/AppHeader";
import AppInput from "../../../components/Common/AppInput";
import CategoryField from "../../../components/AddListItem/CategoryField";
import ValidationController from "../../../components/Common/ValidationController";

// constants
import colors from "../../../constants/colors";
import { COLLECTIONS } from "../../../constants/firebase";
import styles from "./styles";

// types
import { AddListItemFormValues } from "./types";
import { addListItemSchema } from "../../../schema/validationSchema";
import { AppScreensPropTypes } from "../../../navigation/types";
import { encrypt, decrypt } from "../../../utils/crypto";

const AddListItem = () => {
    const navigation = useNavigation();
    const route = useRoute<RouteProp<AppScreensPropTypes, 'AddListItem'>>();
    const editItem = route.params?.item;
    const isEditing = !!editItem;

    const form = useForm<AddListItemFormValues>({
        defaultValues: {
            itemName: editItem?.title || "",
            username: editItem?.username || "",
            password: "",
            confirmPassword: "",
            category: editItem?.category || "",
        },
        resolver: yupResolver(addListItemSchema),
    });

    React.useEffect(() => {
        const loadPassword = async () => {
            const currentUser = auth().currentUser;
            if (isEditing && editItem?.password && currentUser?.uid) {
                const decrypted = await decrypt(editItem.password, currentUser.uid);
                form.setValue("password", decrypted);
                form.setValue("confirmPassword", decrypted);
            }
        };
        loadPassword();
    }, [isEditing, editItem, form]);

    const handleBack = () => {
        navigation.goBack();
    };

    const onSubmit = async (data: AddListItemFormValues) => {
        try {
            const user = auth().currentUser;
            if (!user?.uid) throw new Error("User not authenticated");

            const encryptedPassword = await encrypt(data.password, user.uid);
            const payload = {
                title: data.itemName,
                category: data.category,
                username: data.username,
                password: encryptedPassword,
                userId: user.uid, // Added for security rules
            };

            if (isEditing && editItem?.id) {
                await firestore().collection(COLLECTIONS.PASSWORDS).doc(editItem.id).update(payload);
                showSuccess('Success', 'Password item updated successfully!');
            } else {
                const docId = firestore().collection(COLLECTIONS.PASSWORDS).doc().id;
                await firestore().collection(COLLECTIONS.PASSWORDS).doc(docId).set({ id: docId, ...payload });
                showSuccess('Success', 'Password item added successfully!');
            }
            navigation.goBack();
        } catch (error) {
            console.error(isEditing ? "Error updating password item:" : "Error adding password item:", error);
            showError(
                'Error',
                isEditing ? "Failed to update password item. Please try again." : "Failed to add password item. Please try again."
            );
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <AppHeader 
                title={isEditing ? 'Edit Item' : 'Add New Item'} 
                containerStyle={styles.header} 
                titleStyle={styles.headerTitle} 
                onBackPress={handleBack}
            />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <FormField label="ITEM NAME">
                    <ValidationController control={form.control} name="itemName">
                        <AppInput
                            placeholder="e.g. Netflix, Work Email"
                            placeholderTextColor={colors.mutedBlueGray}
                            containerStyle={styles.inputContainer}
                            style={styles.input}
                        />
                    </ValidationController>
                </FormField>

                <FormField label="USERNAME / EMAIL">
                    <ValidationController control={form.control} name="username">
                        <AppInput
                            placeholder="Enter username"
                            placeholderTextColor={colors.mutedBlueGray}
                            containerStyle={styles.inputContainer}
                            style={styles.input}
                        />
                    </ValidationController>
                </FormField>

                <FormField label="PASSWORD">
                    <ValidationController control={form.control} name="password">
                        <AppInput
                            placeholder="Enter password"
                            securedText
                            placeholderTextColor={colors.mutedBlueGray}
                            containerStyle={styles.inputContainer}
                            style={styles.input}
                        />
                    </ValidationController>
                </FormField>

                <FormField label="CONFIRM PASSWORD">
                    <ValidationController control={form.control} name="confirmPassword">
                        <AppInput
                            placeholder="Re-enter password"
                            securedText
                            placeholderTextColor={colors.mutedBlueGray}
                            containerStyle={styles.inputContainer}
                            style={styles.input}
                        />
                    </ValidationController>
                </FormField>

                <FormField label="CATEGORY">
                    <ValidationController
                        control={form.control}
                        name="category"
                        changeHandlerKey="onChange"
                    >
                        <CategoryField />
                    </ValidationController>
                </FormField>

                <FormField label="2FA RECOVERY CODES (OPTIONAL)">
                    <TouchableOpacity style={styles.uploadButton}>
                        <Ionicons name="cloud-upload-outline" size={20} color={colors.deepTeal} style={{ marginRight: 8 }} />
                        <AppText style={styles.uploadButtonText}>Upload Recovery File</AppText>
                    </TouchableOpacity>
                </FormField>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.addItemButton}
                    activeOpacity={0.8}
                    onPress={form.handleSubmit(onSubmit)}
                >
                    <Ionicons name={isEditing ? "checkmark" : "add"} size={24} color={colors.white} style={{ marginRight: 8 }} />
                    <AppText style={styles.addItemButtonText}>{isEditing ? 'Save Changes' : 'Add Item'}</AppText>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const FormField = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <View style={styles.fieldContainer}>
        <AppText style={styles.label}>{label}</AppText>
        {children}
    </View>
);

export default AddListItem;
