import React, { useMemo, useCallback } from "react";
import { View, TouchableOpacity, FlatList } from "react-native";
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
    onSelect: (category: string) => void;
    onAddNew: () => void;
}

const CATEGORIES = [
    { id: "1", name: "Social", icon: "share-social-outline" },
    { id: "2", name: "Finance", icon: "card-outline" },
    { id: "3", name: "Work", icon: "briefcase-outline" },
    { id: "4", name: "Personal", icon: "person-outline" },
    { id: "5", name: "Entertainment", icon: "game-controller-outline" },
];

const CategoryPickerSheet = React.forwardRef<BottomSheetModal, Props>(({ onClose, onSelect, onAddNew }, ref) => {
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

    const renderItem = ({ item }: { item: typeof CATEGORIES[0] }) => (
        <TouchableOpacity
            style={styles.categoryItem}
            onPress={() => {
                onSelect(item.name);
                onClose();
            }}
        >
            <View style={styles.iconWrapper}>
                <Ionicons name={item.icon as any} size={20} color={colors.deepTeal} />
            </View>
            <AppText style={styles.categoryName}>{item.name}</AppText>
            <Ionicons name="chevron-forward" size={16} color={colors.iceGray} />
        </TouchableOpacity>
    );

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
                    <AppText style={styles.title}>Select Category</AppText>
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="close" size={24} color={colors.mutedBlueGray} />
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={CATEGORIES}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />

                <TouchableOpacity style={styles.addNewButton} onPress={onAddNew}>
                    <Ionicons name="add-circle-outline" size={20} color={colors.deepTeal} style={{ marginRight: 8 }} />
                    <AppText style={styles.addNewText}>Add Custom Category</AppText>
                </TouchableOpacity>
            </BottomSheetView>
        </BottomSheetModal>
    );
});

export default CategoryPickerSheet;
