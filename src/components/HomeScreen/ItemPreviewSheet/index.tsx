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

// constants
import colors from "../../../constants/colors";
import { COLLECTIONS } from "../../../constants/firebase";

// types
import { AppScreensPropTypes } from "../../../navigation/types";
import { RootState } from "../../../store";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { decryptField } from "../../../utils/vault";
import Clipboard from '@react-native-clipboard/clipboard';
import { categoriesMap } from "../../AddListItem/CategoryPickerSheet";

interface Props {
    item: any;
    onClose: () => void;
}

// How long a copied password lingers before the clipboard is auto-cleared.
const CLIPBOARD_CLEAR_MS = 60_000;

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
    // Pending clipboard-clear timer for copied passwords.
    const clipboardTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Gate a sensitive action behind master-password verification.
    const requireMasterPassword = (action: () => void, message: string) => {
        pendingActionRef.current = action;
        setPromptMessage(message);
        setPwPromptVisible(true);
    };

    React.useEffect(() => {
        const fetchDecryptedPassword = async () => {
            if (item?.password) {
                try {
                    // Decrypt with the in-memory vault DEK (vault is unlocked in-app).
                    const decrypted = await decryptField(item.password);
                    setDecryptedPassword(decrypted);
                } catch (error) {
                    console.error("Failed to decrypt item password:", error);
                    setDecryptedPassword("");
                }
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
            if (isPassword) {
                showSuccess('Copied', 'Password copied — clipboard clears in 60s');
                // Auto-clear the clipboard so the password doesn't linger for
                // other apps. Reschedule if another password is copied.
                if (clipboardTimerRef.current) clearTimeout(clipboardTimerRef.current);
                clipboardTimerRef.current = setTimeout(() => {
                    Clipboard.setString('');
                    clipboardTimerRef.current = null;
                }, CLIPBOARD_CLEAR_MS);
            } else {
                showSuccess('Copied', `${label} copied to clipboard`);
            }
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

    // Fired by the library AFTER the sheet is dismissed. Only reset transient
    // view state here — do NOT call dismiss() again (that double-dismiss breaks
    // the modal so it won't present a second time).
    const handleDismiss = useCallback(() => {
        setShowPassword(false);
        setPwPromptVisible(false);
        setDeleteModalVisible(false);
        pendingActionRef.current = null;
    }, []);

    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                {...props}
                // Dynamic-sized sheet rests at index 0, so the backdrop must
                // appear at 0 (not the default 1) or it flickers on open/close.
                appearsOnIndex={0}
                disappearsOnIndex={-1}
                pressBehavior="close"
            />
        ),
        []
    );

    const handleEdit = () => {
        onClose();
        navigation.navigate("AddListItem", { item });
    };

    const handleDeletePress = () => {
        // Show the confirmation alert first.
        setDeleteModalVisible(true);
    };

    const performDelete = async () => {
        try {
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

    const handleConfirmDelete = () => {
        // Alert confirmed → verify identity, then delete.
        setDeleteModalVisible(false);
        requireMasterPassword(performDelete, 'Enter your master password to delete this item.');
    };

    if (!item) return null;

    return (
        <>
            <BottomSheetModal
                ref={ref}
                backdropComponent={renderBackdrop}
                onDismiss={handleDismiss}
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
