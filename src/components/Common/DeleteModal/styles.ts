import { StyleSheet } from "react-native";
import colors from "../../../constants/colors";

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    container: {
        width: "100%",
        backgroundColor: colors.white,
        borderRadius: 24,
        padding: 24,
        alignItems: "center",
        // Shadow
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    iconContainer: {
        marginBottom: 20,
    },
    iconBackground: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "#FFEBEB", // Light red background for the icon
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
        color: colors.deepTeal,
        marginBottom: 12,
    },
    description: {
        fontSize: 15,
        color: colors.mutedTeal,
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 24,
    },
    boldText: {
        fontWeight: "700",
        color: colors.deepTeal,
    },
    footer: {
        width: "100%",
        gap: 12,
    },
    deleteButton: {
        height: 56,
        borderRadius: 16,
        backgroundColor: colors.red,
        alignItems: "center",
        justifyContent: "center",
        // Shadow
        shadowColor: colors.red,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    deleteButtonText: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.white,
    },
    cancelButton: {
        height: 56,
        borderRadius: 16,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.iceGray,
        alignItems: "center",
        justifyContent: "center",
    },
    cancelButtonText: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.deepTeal,
    },
});

export default styles;
