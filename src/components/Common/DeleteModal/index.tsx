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
    itemName: string;
    onClose: () => void;
    onDelete: () => void;
}

const DeleteModal = ({ visible, itemName, onClose, onDelete }: Props) => {
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
                                <View style={styles.iconBackground}>
                                    <Ionicons name="warning" size={32} color={colors.red} />
                                </View>
                            </View>

                            <AppText style={styles.title}>Delete Password?</AppText>
                            <AppText style={styles.description}>
                                Are you sure you want to delete your{" "}
                                <AppText style={styles.boldText}>{itemName}</AppText>
                                {" "}credentials? This action is permanent and cannot be undone.
                            </AppText>

                            <View style={styles.footer}>
                                <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
                                    <AppText style={styles.deleteButtonText}>Delete Item</AppText>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                                    <AppText style={styles.cancelButtonText}>Cancel</AppText>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

export default DeleteModal;
