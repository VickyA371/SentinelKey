import React, { useCallback, useRef, useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { showSuccess, showError } from "../../../utils/toast";
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import Ionicons from "@react-native-vector-icons/ionicons";
import firestore from '@react-native-firebase/firestore';
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { useSelector } from 'react-redux';

// components
import AppText from "../../Common/AppText";
import CommonAlert from "../../Common/CommonAlert";
import alertStyles from "../../Common/CommonAlert/styles";
import MasterPasswordPrompt from "../../Common/MasterPasswordPrompt";
import auth from '@react-native-firebase/auth';

// constants
import colors from "../../../constants/colors";
import { COLLECTIONS } from "../../../constants/firebase";

// types
import { AppScreensPropTypes } from "../../../navigation/types";
import { RootState } from "../../../store";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { decrypt } from "../../../utils/crypto";
import Clipboard from '@react-native-clipboard/clipboard';
import { categoriesMap } from "../../AddListItem/CategoryPickerSheet";

interface Props {
    item: any;
    onClose: () => void;
}

const ItemPreviewSheet = React.forwardRef<BottomSheetModal, Props>(({ item, onClose }, ref) => {
    const safeAreaInsets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp<AppScreensPropTypes>>();

    const enhancedPrivacyEnabled = useSelector(
        (state: RootState) => state.security.enhancedPrivacyEnabled,
    );

    const [showPassword, setShowPassword] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [decryptedPassword, setDecryptedPassword] = useState("");
    const [pwPromptVisible, setPwPromptVisible] = useState(false);
    const [promptMessage, setPromptMessage] = useState("");
    // Action to run after the master password is verified.
    const pendingActionRef = useRef<(() => void) | null>(null);

    // Gate a sensitive action behind master-password verification.
    const requireMasterPassword = (action: () => void, message: string) => {
        pendingActionRef.current = action;
        setPromptMessage(message);
        setPwPromptVisible(true);
    };

    React.useEffect(() => {
        const fetchDecryptedPassword = async () => {
            const currentUser = auth().currentUser;
            if (item?.password && currentUser?.uid) {
                const decrypted = await decrypt(item.password, currentUser.uid);
                setDecryptedPassword(decrypted);
            } else {
                setDecryptedPassword("");
            }
        };
        fetchDecryptedPassword();
    }, [item?.password]);

    const handleCopy = async (textToCopy: string, label: string, isPassword: boolean = false) => {
        if (!textToCopy) return;

        const doCopy = () => {
            Clipboard.setString(textToCopy);
            showSuccess('Copied', `${label} copied to clipboard`);
        };

        // If Enhanced Privacy is enabled and this is a password field, require
        // the master password before copying.
        if (isPassword && enhancedPrivacyEnabled) {
            requireMasterPassword(doCopy, 'Enter your master password to copy this password.');
            return;
        }
        doCopy();
    };

    const handleTogglePasswordVisibility = async () => {
        // Hiding never needs verification.
        if (showPassword) {
            setShowPassword(false);
            return;
        }
        // Revealing with Enhanced Privacy on — require the master password.
        if (enhancedPrivacyEnabled) {
            requireMasterPassword(() => setShowPassword(true), 'Enter your master password to view this password.');
            return;
        }
        setShowPassword(true);
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
        // Editing is a sensitive action — always confirm identity first.
        requireMasterPassword(() => {
            onClose();
            navigation.navigate("AddListItem", { item });
        }, 'Enter your master password to edit this item.');
    };

    const handleDeletePress = () => {
        // Confirm identity before showing the delete confirmation.
        requireMasterPassword(() => {
            setDeleteModalVisible(true);
        }, 'Enter your master password to delete this item.');
    };

    const handleConfirmDelete = async () => {
        try {
            setDeleteModalVisible(false);
            if (item?.id) {
                await firestore().collection(COLLECTIONS.PASSWORDS).doc(item.id).delete();
                showSuccess('Success', 'Password item deleted successfully!');
                onClose();
            }
        } catch (error) {
            console.error("Error deleting password item:", error);
            showError('Error', 'Failed to delete password item. Please try again.');
        }
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
                        <DetailRow
                            label="USERNAME"
                            value={item.username || "No username"}
                            hasCopy
                            onCopy={() => handleCopy(item.username, "Username")}
                        />
                        <DetailRow
                            label="PASSWORD"
                            value={showPassword ? decryptedPassword : "••••••••••••"}
                            hasVisibility
                            hasCopy
                            onVisibilityToggle={handleTogglePasswordVisibility}
                            isPasswordVisible={showPassword}
                            onCopy={() => handleCopy(decryptedPassword, "Password", true)}
                        />
                        <DetailRow
                            label="CATEGORY"
                            value={categoriesMap[item.category] || "General"}
                            hasBullet
                            bulletColor={item.iconBg || colors.deepTeal}
                        />
                        <DetailRow
                            label="BACKUP CODES FILE"
                            value="No file uploaded"
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

            <CommonAlert
                visible={deleteModalVisible}
                title="Delete Password?"
                description={
                    <>Are you sure you want to delete your{" "}
                    <AppText style={alertStyles.boldText}>{item.title}</AppText>
                    {" "}credentials? This action is permanent and cannot be undone.</>
                }
                confirmText="Delete Item"
                icon="warning"
                onClose={() => setDeleteModalVisible(false)}
                onConfirm={handleConfirmDelete}
            />

            <MasterPasswordPrompt
                visible={pwPromptVisible}
                message={promptMessage}
                onCancel={handlePromptCancel}
                onSuccess={handlePromptSuccess}
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
    hasViewIcon,
    onCopy
}: any) => (
    <View style={styles.detailRow}>
        <AppText style={styles.detailLabel}>{label}</AppText>
        <View style={styles.detailValueContainer}>
            <View style={styles.valueLeft}>
                {hasBullet && <View style={[styles.bullet, { backgroundColor: bulletColor }]} />}
                <AppText style={styles.detailValue}>{value}</AppText>
            </View>
            <View style={styles.actions}>
                {hasVisibility && (
                    <TouchableOpacity onPress={onVisibilityToggle} style={styles.actionButton}>
                        <Ionicons name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} size={20} color={colors.mutedBlueGray} />
                    </TouchableOpacity>
                )}
                {hasCopy && (
                    <TouchableOpacity style={styles.actionButton} onPress={onCopy}>
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
