import React, { useCallback } from "react";
import { View, TouchableOpacity } from "react-native";
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
}

export const CATEGORIES = [
    { id: "1", name: "Social", icon: "share-social-outline" },
    { id: "2", name: "Finance", icon: "card-outline" },
    { id: "3", name: "Work", icon: "briefcase-outline" },
    { id: "4", name: "Personal", icon: "person-outline" },
    { id: "5", name: "Entertainment", icon: "game-controller-outline" },
    { id: "6", name: "Other", icon: "ellipsis-horizontal" },
];

export const categoriesMap = CATEGORIES.reduce((acc: Record<string, string>, currCategory) => {
    acc[currCategory.name.toLowerCase()] = currCategory.name
    return acc
}, {})

const CategoryPickerSheet = React.forwardRef<BottomSheetModal, Props>(({ onClose, onSelect }, ref) => {
    const safeAreaInsets = useSafeAreaInsets();
    
    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                {...props}
                // Dynamic-sized sheet rests at index 0; appear at 0 (not the
                // default 1) so the backdrop doesn't flicker on open/close.
                appearsOnIndex={0}
                disappearsOnIndex={-1}
                pressBehavior="close"
            />
        ),
        []
    );

    const handleSelect = (item: typeof CATEGORIES[0]) => {
        onSelect(item.name.toLowerCase());
        onClose();
    };

    return (
        <BottomSheetModal
            ref={ref}
            enableDynamicSizing
            enableDismissOnClose
            backdropComponent={renderBackdrop}
            handleIndicatorStyle={styles.indicator}
            backgroundStyle={styles.background}
        >
            <BottomSheetView style={[styles.container, { paddingBottom: 12 + safeAreaInsets.bottom }]}>
                <View style={styles.header}>
                    <AppText style={styles.title}>Select Category</AppText>
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="close" size={24} color={colors.mutedBlueGray} />
                    </TouchableOpacity>
                </View>

                {CATEGORIES.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        style={styles.categoryItem}
                        onPress={() => handleSelect(item)}
                    >
                        <View style={styles.iconWrapper}>
                            <Ionicons name={item.icon as any} size={20} color={colors.deepTeal} />
                        </View>
                        <AppText style={styles.categoryName}>{item.name}</AppText>
                        <Ionicons name="chevron-forward" size={16} color={colors.iceGray} />
                    </TouchableOpacity>
                ))}
            </BottomSheetView>
        </BottomSheetModal>
    );
});

export default CategoryPickerSheet;
