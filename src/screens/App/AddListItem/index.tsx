import React, { useEffect, useRef, useState } from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { showSuccess, showError } from "../../../utils/toast";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useSelector } from 'react-redux';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// components
import AppText from "../../../components/Common/AppText";
import AppHeader from "../../../components/Common/AppHeader";
import AppInput from "../../../components/Common/AppInput";
import CategoryField from "../../../components/AddListItem/CategoryField";
import ValidationController from "../../../components/Common/ValidationController";
import MasterPasswordPrompt from "../../../components/Common/MasterPasswordPrompt";

// constants
import colors from "../../../constants/colors";
import { COLLECTIONS } from "../../../constants/firebase";
import styles from "./styles";

// types
import { AddListItemFormValues } from "./types";
import { addListItemSchema } from "../../../schema/validationSchema";
import { AppScreensPropTypes } from "../../../navigation/types";
import { RootState } from "../../../store";
import { encryptField, decryptField } from "../../../utils/vault";

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

    const enhancedPrivacyEnabled = useSelector(
        (state: RootState) => state.security.enhancedPrivacyEnabled,
    );

    const [pwPromptVisible, setPwPromptVisible] = useState(false);
    const [promptMessage, setPromptMessage] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmVisible, setConfirmVisible] = useState(false);
    // Once the master password is verified to reveal, both fields (same secret)
    // stay revealable for the rest of this screen session.
    const [revealAuthorized, setRevealAuthorized] = useState(false);
    // Action to run after the master password is verified.
    const pendingActionRef = useRef<(() => void) | null>(null);
    // Ensures the edit-mode password is loaded only once.
    const didInitPasswordRef = useRef(false);

    const requireMasterPassword = (action: () => void, message: string) => {
        pendingActionRef.current = action;
        setPromptMessage(message);
        setPwPromptVisible(true);
    };

    const handlePromptSuccess = () => {
        setPwPromptVisible(false);
        const action = pendingActionRef.current;
        pendingActionRef.current = null;
        action?.();
    };

    const handlePromptCancel = () => {
        setPwPromptVisible(false);
        pendingActionRef.current = null;
    };

    // Reveal a password field. Hiding is always allowed; revealing while editing
    // with Enhanced Privacy on requires the master password first.
    const requestReveal = (currentlyVisible: boolean, setVisible: (v: boolean) => void) => {
        if (currentlyVisible) {
            setVisible(false);
            return;
        }
        // Gate the first reveal only; once verified this session, both fields
        // reveal freely (they hold the same password).
        if (isEditing && enhancedPrivacyEnabled && !revealAuthorized) {
            requireMasterPassword(() => {
                setRevealAuthorized(true);
                setVisible(true);
            }, 'Enter your master password to view the password.');
            return;
        }
        setVisible(true);
    };

    useEffect(() => {
        if (didInitPasswordRef.current) return;
        if (!isEditing || !editItem?.password) return;
        didInitPasswordRef.current = true;

        // Load the saved password into the (masked) fields so the edit can be
        // saved. It stays hidden until the user reveals it (gated above) — no
        // prompt on open.
        (async () => {
            try {
                const decrypted = await decryptField(editItem.password);
                form.setValue("password", decrypted);
                form.setValue("confirmPassword", decrypted);
            } catch (error) {
                console.error("Failed to decrypt item for editing:", error);
            }
        })();
    }, [isEditing, editItem, form]);

    const handleBack = () => {
        navigation.goBack();
    };

    const persistItem = async (data: AddListItemFormValues) => {
        try {
            const user = auth().currentUser;
            if (!user?.uid) throw new Error("User not authenticated");

            // Encrypt with the vault DEK (authenticated encryption). Fails closed:
            // if the vault is somehow locked, this throws and we do NOT persist.
            const encryptedPassword = await encryptField(data.password);
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

    const onSubmit = (data: AddListItemFormValues) => {
        // Saving an edit always requires the master password, regardless of the
        // Enhanced Privacy setting. Adding a new item does not.
        if (isEditing) {
            requireMasterPassword(() => persistItem(data), 'Enter your master password to save changes.');
            return;
        }
        persistItem(data);
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
                            secureVisible={passwordVisible}
                            onToggleSecure={() => requestReveal(passwordVisible, setPasswordVisible)}
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
                            secureVisible={confirmVisible}
                            onToggleSecure={() => requestReveal(confirmVisible, setConfirmVisible)}
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

            <MasterPasswordPrompt
                visible={pwPromptVisible}
                message={promptMessage}
                onCancel={handlePromptCancel}
                onSuccess={handlePromptSuccess}
            />
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
