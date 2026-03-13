import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";

// components
import AppText from "../../Common/AppText";

// constants
import colors from "../../../constants/colors";

interface Props {
    title: string;
    category: string;
    icon: string;
    iconBg: string;
    onPress?: () => void;
}

const ListItem: React.FC<Props> = ({ title, category, icon, iconBg, onPress }) => {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
                <Ionicons name={icon as any} size={24} color={colors.white} />
            </View>
            <View style={styles.content}>
                <AppText style={styles.title}>{title}</AppText>
                <AppText style={styles.subtitle}>{category}</AppText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.iceGray} />
        </TouchableOpacity>
    );
};

export default ListItem;

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.white,
        padding: 16,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 12,
        // Basic shadow for card effect
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 17,
        fontWeight: "600",
        color: colors.charcoal,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: colors.mutedBlueGray,
    },
    dot: {
        fontSize: 12,
        color: colors.iceGray,
    },
});
