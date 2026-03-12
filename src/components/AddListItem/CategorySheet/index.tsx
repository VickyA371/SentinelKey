import React, { useMemo, useCallback, useState } from "react";
import { View, TouchableOpacity, TextInput } from "react-native";
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import Ionicons from "@react-native-vector-icons/ionicons";

// components
import AppText from "../../Common/AppText";

// constants
import colors from "../../../constants/colors";
import styles from "./styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
    onClose: () => void;
    onSave: (category: { name: string; icon: string }) => void;
}

const ICONS = [
    { id: "folder", name: "folder" },
    { id: "star", name: "star" },
    { id: "airplane", name: "airplane" },
    { id: "wallet", name: "wallet" },
    { id: "ellipsis-horizontal", name: "ellipsis-horizontal" },
];

const CategorySheet = React.forwardRef<BottomSheetModal, Props>(({ onClose, onSave }, ref) => {
    const [categoryName, setCategoryName] = useState("");
    const [selectedIcon, setSelectedIcon] = useState("folder");

    const safeAreaInsets = useSafeAreaInsets();

    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
            />
        ),
        []
    );

    const handleSave = () => {
        if (categoryName.trim()) {
            onSave({ name: categoryName, icon: selectedIcon });
            setCategoryName("");
            onClose();
        }
    };

    return (
        <BottomSheetModal
            ref={ref}
            enableDynamicSizing
            enableDismissOnClose
            backdropComponent={renderBackdrop}
            onDismiss={onClose}
            handleIndicatorStyle={styles.indicator}
            backgroundStyle={styles.background}
        >
            <BottomSheetView style={[styles.container, { paddingBottom: 24 + safeAreaInsets.bottom }]}>
                <View style={styles.header}>
                    <View style={styles.headerTextContainer}>
                        <AppText style={styles.title}>Add Custom Category</AppText>
                        <AppText style={styles.description}>
                            Create a new organizational folder for your passwords.
                        </AppText>
                    </View>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color={colors.deepTeal} />
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    <View style={styles.fieldContainer}>
                        <AppText style={styles.label}>CATEGORY NAME</AppText>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., Personal, Travel, Shopping"
                                placeholderTextColor={colors.mutedBlueGray}
                                value={categoryName}
                                onChangeText={setCategoryName}
                            />
                            <Ionicons name="pricetag-outline" size={20} color={colors.mutedBlueGray} />
                        </View>
                    </View>

                    <View style={styles.fieldContainer}>
                        <AppText style={styles.label}>SELECT STYLE</AppText>
                        <View style={styles.iconContainer}>
                            {ICONS.map((icon) => {
                                const isSelected = selectedIcon === icon.id;
                                return (
                                    <TouchableOpacity
                                        key={icon.id}
                                        style={[
                                            styles.iconWrapper,
                                            isSelected && styles.selectedIconWrapper,
                                        ]}
                                        onPress={() => setSelectedIcon(icon.id)}
                                    >
                                        <Ionicons
                                            name={icon.name as any}
                                            size={24}
                                            color={isSelected ? colors.white : colors.deepTeal}
                                        />
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                        <Ionicons name="save-outline" size={20} color={colors.white} style={{ marginRight: 8 }} />
                        <AppText style={styles.saveButtonText}>Save Category</AppText>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                        <AppText style={styles.cancelButtonText}>Cancel</AppText>
                    </TouchableOpacity>
                </View>
            </BottomSheetView>
        </BottomSheetModal>
    );
});

export default CategorySheet;
