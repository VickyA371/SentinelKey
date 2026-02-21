import { StyleSheet } from "react-native";
import colors from "../../../constants/colors";

const styles = StyleSheet.create({
    background: {
        backgroundColor: colors.white,
        borderRadius: 32,
    },
    indicator: {
        backgroundColor: colors.iceGray,
        width: 48,
    },
    container: {
        flex: 1,
        padding: 24,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 24,
    },
    headerTextContainer: {
        flex: 1,
        paddingRight: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        color: colors.charcoal,
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: colors.mutedTeal,
        lineHeight: 20,
    },
    closeButton: {
        padding: 4,
    },
    content: {
        flex: 1,
    },
    fieldContainer: {
        marginBottom: 24,
    },
    label: {
        fontSize: 12,
        fontWeight: "700",
        color: colors.deepTeal,
        marginBottom: 12,
        letterSpacing: 0.5,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        height: 56,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.iceGray,
        backgroundColor: colors.offWhiteBlueGray,
        paddingHorizontal: 16,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: colors.charcoal,
    },
    iconContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    iconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.offWhiteBlueGray,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    selectedIconWrapper: {
        backgroundColor: colors.deepTeal,
        borderWidth: 4,
        borderColor: colors.lightCyanBlue, // Subtle ring effect like in design
    },
    footer: {
        marginTop: "auto",
        gap: 12,
    },
    saveButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: 56,
        borderRadius: 16,
        backgroundColor: colors.deepTeal,
        // Shadow
        shadowColor: colors.deepTeal,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    saveButtonText: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.white,
    },
    cancelButton: {
        height: 56,
        borderRadius: 16,
        backgroundColor: colors.offWhiteBlueGray,
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
