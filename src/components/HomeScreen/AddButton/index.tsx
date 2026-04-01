import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// constants
import colors from "../../../constants/colors";

interface Props {
    onPress?: () => void;
}

const AddButton: React.FC<Props> = ({ onPress }) => {
    const safeAreaInsets = useSafeAreaInsets();

    return (
        <TouchableOpacity
            style={[
                styles.container,
                {
                    bottom: safeAreaInsets.bottom ? safeAreaInsets.bottom + 24 : 24,
                }
            ]}
            activeOpacity={0.8}
            onPress={onPress}
        >
            <Ionicons name="add" size={32} color={colors.white} />
        </TouchableOpacity>
    );
};

export default AddButton;

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 24,
        right: 24,
        width: 64,
        height: 64,
        borderRadius: 16,
        backgroundColor: colors.deepTeal,
        alignItems: "center",
        justifyContent: "center",
        // Premium shadow
        shadowColor: colors.deepTeal,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
});
