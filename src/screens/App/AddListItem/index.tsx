import React from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";

// components
import AppText from "../../../components/Common/AppText";
import AppInput from "../../../components/Common/AppInput";
import CategoryField from "../../../components/AddListItem/CategoryField";
import ValidationController from "../../../components/Common/ValidationController";

// constants
import colors from "../../../constants/colors";
import styles from "./styles";

// types
import { AddListItemFormValues } from "./types";
import { addListItemSchema } from "../../../schema/validationSchema";
import { AppScreensPropTypes } from "../../../navigation/types";

const AddListItem = () => {
    const navigation = useNavigation();
    const route = useRoute<RouteProp<AppScreensPropTypes, 'AddListItem'>>();
    const editItem = route.params?.item;
    const isEditing = !!editItem;

    const form = useForm<AddListItemFormValues>({
        defaultValues: {
            itemName: editItem?.title || "",
            username: editItem?.username || (isEditing ? "streaming_fan@email.com" : ""),
            password: editItem?.password || (isEditing ? "••••••••••••" : ""),
            confirmPassword: editItem?.password || (isEditing ? "••••••••••••" : ""),
            category: editItem?.category || "",
        },
        resolver: yupResolver(addListItemSchema)
    });

    const handleBack = () => {
        navigation.goBack();
    };

    const onSubmit = (data: AddListItemFormValues) => {
        console.log("Form Data:", data);
        // Here you would typically save or update the item
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.deepTeal} />
                </TouchableOpacity>
                <AppText style={styles.headerTitle}>{isEditing ? 'Edit Item' : 'Add New Item'}</AppText>
            </View>

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
