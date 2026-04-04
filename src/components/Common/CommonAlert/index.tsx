import React from "react";
import { Modal, View, TouchableOpacity, TouchableWithoutFeedback } from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";

// components
import AppText from "../AppText";

// constants
import colors from "../../../constants/colors";
import styles from "./styles";

interface Props {
    visible: boolean;
    title: string;
    description: React.ReactNode;
    confirmText: string;
    onClose: () => void;
    onConfirm: () => void;
    icon?: string;
    iconColor?: string;
    confirmColor?: string;
}

const CommonAlert = ({
    visible,
    title,
    description,
    confirmText,
    onClose,
    onConfirm,
    icon = "warning",
    iconColor = colors.red,
    confirmColor = colors.red,
}: Props) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.container}>
                            <View style={styles.iconContainer}>
                                <View style={[styles.iconBackground, { backgroundColor: `${iconColor}15` }]}>
                                    <Ionicons name={icon as any} size={32} color={iconColor} />
                                </View>
                            </View>

                            <AppText style={styles.title}>{title}</AppText>
                            <AppText style={styles.description}>
                                {description}
                            </AppText>

                            <View style={styles.footer}>
                                <TouchableOpacity
                                    style={[styles.confirmButton, { backgroundColor: confirmColor, shadowColor: confirmColor }]}
                                    onPress={onConfirm}
                                >
                                    <AppText style={styles.confirmButtonText}>{confirmText}</AppText>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                                    <AppText style={styles.cancelButtonText}>{"Cancel"}</AppText>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

export default CommonAlert;
