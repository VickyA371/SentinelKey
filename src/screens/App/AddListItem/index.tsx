import React, { useState, useRef } from "react";
import { View, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import Ionicons from "@react-native-vector-icons/ionicons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";

// components
import AppText from "../../../components/Common/AppText";
import AppInput from "../../../components/Common/AppInput";
import CategorySheet from "../../../components/AddListItem/CategorySheet";
import CategoryPickerSheet from "../../../components/AddListItem/CategoryPickerSheet";

// constants
import colors from "../../../constants/colors";
import styles from "./styles";
import { AuthScreensPropTypes } from "../../../navigation";

const AddListItem = () => {
    const navigation = useNavigation();
    const route = useRoute<RouteProp<AuthScreensPropTypes, 'AddListItem'>>();
    const editItem = route.params?.item;
    const isEditing = !!editItem;

    const [itemName, setItemName] = useState(editItem?.title || "");
    const [username, setUsername] = useState(editItem?.username || "");
    const [password, setPassword] = useState(editItem?.password || "");
    const [category, setCategory] = useState(editItem?.category || "");

    const categorySheetRef = useRef<BottomSheetModal>(null);
    const categoryPickerRef = useRef<BottomSheetModal>(null);

    const handleBack = () => {
        navigation.goBack();
    };

    const handleOpenCategoryPicker = () => {
        categoryPickerRef.current?.present();
    };

    const handleOpenCategorySheet = () => {
        categoryPickerRef.current?.dismiss();
        setTimeout(() => {
            categorySheetRef.current?.present();
        }, 300);
    };

    const handleSelectCategory = (selectedCategory: string) => {
        setCategory(selectedCategory);
    };

    const handleSaveCategory = (newCategory: { name: string; icon: string }) => {
        setCategory(newCategory.name);
    };

    const handleSave = () => {
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
                    <AppInput
                        value={itemName}
                        onChangeText={setItemName}
                        placeholder="e.g. Netflix, Work Email"
                        placeholderTextColor={colors.mutedBlueGray}
                        containerStyle={styles.inputContainer}
                        style={styles.input}
                    />
                </FormField>

                <FormField label="USERNAME / EMAIL">
                    <AppInput
                        value={username}
                        onChangeText={setUsername}
                        placeholder="Enter username"
                        placeholderTextColor={colors.mutedBlueGray}
                        containerStyle={styles.inputContainer}
                        style={styles.input}
                    />
                </FormField>

                <FormField label="PASSWORD">
                    <AppInput
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Enter password"
                        securedText
                        placeholderTextColor={colors.mutedBlueGray}
                        containerStyle={styles.inputContainer}
                        style={styles.input}
                    />
                </FormField>

                <FormField label="CATEGORY">
                    <TouchableOpacity style={styles.categoryPicker} onPress={handleOpenCategoryPicker}>
                        <AppText style={[styles.categoryValue, !category && styles.placeholderText]}>
                            {category || "Select a category"}
                        </AppText>
                        <Ionicons name="chevron-down" size={20} color={colors.deepTeal} />
                    </TouchableOpacity>
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
                    onPress={handleSave}
                >
                    <Ionicons name={isEditing ? "checkmark" : "add"} size={24} color={colors.white} style={{ marginRight: 8 }} />
                    <AppText style={styles.addItemButtonText}>{isEditing ? 'Save Changes' : 'Add Item'}</AppText>
                </TouchableOpacity>
            </View>

            <CategoryPickerSheet
                ref={categoryPickerRef}
                onClose={() => categoryPickerRef.current?.dismiss()}
                onSelect={handleSelectCategory}
                onAddNew={handleOpenCategorySheet}
            />

            <CategorySheet
                ref={categorySheetRef}
                onClose={() => categorySheetRef.current?.dismiss()}
                onSave={handleSaveCategory}
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
