import { StyleSheet } from "react-native";
import colors from "../../../constants/colors";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
        backgroundColor: colors.white
    },
    listContent: {
        paddingBottom: 100, // accommodate FAB
    }
})

export default styles;
