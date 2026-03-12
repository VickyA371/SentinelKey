import React, { useCallback, useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import Ionicons from "@react-native-vector-icons/ionicons";
import { NavigationProp, useNavigation } from "@react-navigation/native";

// components
import AppText from "../../Common/AppText";
import DeleteModal from "../../Common/DeleteModal";

// constants
import colors from "../../../constants/colors";

// types
import { AppScreensPropTypes } from "../../../navigation/types";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
    item: any;
    onClose: () => void;
}

const ItemPreviewSheet = React.forwardRef<BottomSheetModal, Props>(({ item, onClose }, ref) => {
    const safeAreaInsets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp<AppScreensPropTypes>>();
    
    const [showPassword, setShowPassword] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
            />
        ),
        []
    );

    const handleEdit = () => {
        onClose();
        navigation.navigate("AddListItem", { item });
    };

    const handleDeletePress = () => {
        setDeleteModalVisible(true);
    };

    const handleConfirmDelete = () => {
        setDeleteModalVisible(false);
        onClose();
        // Here we would typically call a deletion service
    };

    if (!item) return null;

    return (
        <>
            <BottomSheetModal
                ref={ref}
                backdropComponent={renderBackdrop}
                onDismiss={onClose}
                handleIndicatorStyle={styles.indicator}
                backgroundStyle={styles.background}
                enableDismissOnClose
                enableDynamicSizing
            >
                <BottomSheetView style={[styles.container, { paddingBottom: 24 + safeAreaInsets.bottom }]}>
                    <View style={styles.header}>
                        <AppText style={styles.headerTitle}>{item.title}</AppText>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons
                                name="close"
                                size={24}
                                color={colors.mutedBlueGray}
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.content}>
                        <DetailRow label="ITEM NAME" value={item.title} />
                        <DetailRow
                            label="USERNAME"
                            value="streaming_fan@email.com" // Mocked as per design
                            hasCopy
                        />
                        <DetailRow
                            label="PASSWORD"
                            value="••••••••••••" // Mocked
                            hasVisibility
                            hasCopy
                            onVisibilityToggle={() => setShowPassword(!showPassword)}
                            isPasswordVisible={showPassword}
                        />
                        <DetailRow
                            label="CATEGORY"
                            value="Entertainment" // Mocked
                            hasBullet
                            bulletColor="#6366F1"
                        />
                        <DetailRow
                            label="BACKUP CODES FILE"
                            value="Google_Backup_Codes.pdf"
                            hasViewIcon
                        />
                    </View>

                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                            <Ionicons name="create-outline" size={20} color={colors.deepTeal} style={{ marginRight: 8 }} />
                            <AppText style={styles.editButtonText}>{"Edit Item"}</AppText>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePress}>
                            <Ionicons name="trash-outline" size={18} color={colors.red} style={{ marginRight: 8 }} />
                            <AppText style={styles.deleteButtonText}>{"Delete Record"}</AppText>
                        </TouchableOpacity>
                    </View>
                </BottomSheetView>
            </BottomSheetModal>

            <DeleteModal
                visible={deleteModalVisible}
                itemName={item.title}
                onClose={() => setDeleteModalVisible(false)}
                onDelete={handleConfirmDelete}
            />
        </>
    );
});

const DetailRow = ({
    label,
    value,
    hasCopy,
    hasVisibility,
    isPasswordVisible,
    onVisibilityToggle,
    hasBullet,
    bulletColor,
    hasViewIcon
}: any) => (
    <View style={styles.detailRow}>
        <AppText style={styles.detailLabel}>{label}</AppText>
        <View style={styles.detailValueContainer}>
            <View style={styles.valueLeft}>
                {hasBullet && <View style={[styles.bullet, { backgroundColor: bulletColor }]} />}
                <AppText style={styles.detailValue}>{isPasswordVisible ? "RealPassword123!" : value}</AppText>
            </View>
            <View style={styles.actions}>
                {hasVisibility && (
                    <TouchableOpacity onPress={onVisibilityToggle} style={styles.actionButton}>
                        <Ionicons name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} size={20} color={colors.mutedBlueGray} />
                    </TouchableOpacity>
                )}
                {hasCopy && (
                    <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="copy-outline" size={20} color={colors.mutedBlueGray} />
                    </TouchableOpacity>
                )}
                {hasViewIcon && (
                    <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="eye-outline" size={20} color={colors.mutedBlueGray} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    </View>
);

export default ItemPreviewSheet;

const styles = StyleSheet.create({
    indicator: {
        backgroundColor: colors.iceGray,
        width: 40,
    },
    background: {
        borderRadius: 32,
    },
    container: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 8,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
        paddingTop: 8,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: colors.deepTeal,
    },
    content: {
        flex: 1,
    },
    detailRow: {
        backgroundColor: colors.white,
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.offWhiteBlueGray,
    },
    detailLabel: {
        fontSize: 11,
        fontWeight: "700",
        color: colors.mutedTeal,
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    detailValueContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    valueLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    bullet: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    detailValue: {
        fontSize: 18,
        fontWeight: "600",
        color: colors.charcoal,
    },
    actions: {
        flexDirection: "row",
        alignItems: "center",
    },
    actionButton: {
        marginLeft: 12,
        padding: 8,
        backgroundColor: colors.lightCyanBlue,
        borderRadius: 8,
    },
    footer: {
        paddingVertical: 24,
        alignItems: "center",
    },
    editButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: 56,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.iceGray,
        marginBottom: 24,
    },
    editButtonText: {
        fontSize: 16,
        fontWeight: "700",
        color: colors.deepTeal,
    },
    deleteButton: {
        flexDirection: "row",
        alignItems: "center",
    },
    deleteButtonText: {
        fontSize: 15,
        fontWeight: "600",
        color: colors.red,
    },
});
