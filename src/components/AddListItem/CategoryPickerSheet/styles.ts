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
        alignItems: "center",
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        color: colors.charcoal,
    },
    listContent: {
        paddingBottom: 20,
    },
    categoryItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.offWhiteBlueGray,
    },
    iconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: colors.offWhiteBlueGray,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
    },
    categoryName: {
        flex: 1,
        fontSize: 16,
        color: colors.charcoal,
        fontWeight: "500",
    },
    addNewButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: 56,
        borderRadius: 16,
        backgroundColor: colors.lightCyanBlue,
        marginTop: "auto",
    },
    addNewText: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.deepTeal,
    },
});

export default styles;
