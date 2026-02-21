import React, { useRef } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";

// components
import AppText from "../../Common/AppText";
import CategoryPickerSheet from "../CategoryPickerSheet";
import CategorySheet from "../CategorySheet";

// constants
import colors from "../../../constants/colors";

interface Props {
    value?: string;
    onChange?: (value: string) => void;
    error?: string;
}

const CategoryField = ({ value, onChange, error }: Props) => {
    const categorySheetRef = useRef<BottomSheetModal>(null);
    const categoryPickerRef = useRef<BottomSheetModal>(null);

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
        onChange?.(selectedCategory);
    };

    const handleSaveCategory = (newCategory: { name: string; icon: string }) => {
        onChange?.(newCategory.name);
    };

    return (
        <View>
            <TouchableOpacity
                style={[styles.categoryPicker, error && styles.erroredPicker]}
                onPress={handleOpenCategoryPicker}
            >
                <AppText style={[styles.categoryValue, !value && styles.placeholderText]}>
                    {value || "Select a category"}
                </AppText>
                <Ionicons name="chevron-down" size={20} color={colors.deepTeal} />
            </TouchableOpacity>

            {error && <AppText erroredText style={styles.errorText}>{error}</AppText>}

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
        </View>
    );
};

const styles = StyleSheet.create({
    categoryPicker: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        height: 56,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.iceGray,
        paddingHorizontal: 16,
        backgroundColor: colors.white,
    },
    erroredPicker: {
        borderColor: 'red',
    },
    categoryValue: {
        fontSize: 16,
        color: colors.deepTeal,
    },
    placeholderText: {
        color: colors.mutedBlueGray,
    },
    errorText: {
        marginTop: 4,
    },
});

export default CategoryField;
