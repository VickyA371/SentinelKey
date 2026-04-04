import { StyleSheet, View } from "react-native";
import AppText from "../../Common/AppText";
import colors from "../../../constants/colors";

type EmptyListPropTypes = {
    loading: boolean
}

const EmptyList = ({
    loading
}: EmptyListPropTypes) => (
    <View style={styles.container}>
        <AppText style={{ color: colors.mutedBlueGray }}>
            {loading ? "Loading your vault..." : "No items found"}
        </AppText>
    </View>
)

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100
    }
})

export default EmptyList;
