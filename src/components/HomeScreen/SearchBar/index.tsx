import React from "react";
import { View, StyleSheet } from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";

// components
import AppInput from "../../Common/AppInput";

// constants
import colors from "../../../constants/colors";

interface Props {
    value: string;
    onChange: (text: string) => void;
}

const SearchBar: React.FC<Props> = ({ value, onChange }) => {
    return (
        <View style={styles.container}>
            <Ionicons name="search" size={18} color={colors.mutedBlueGray} />
            <AppInput
                placeholder="Search vault..."
                value={value}
                onChangeText={onChange}
                style={styles.input}
                placeholderTextColor={colors.mutedBlueGray}
                containerStyle={styles.inputContainer}
            />
        </View>
    );
};

export default SearchBar;

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.lightCyanBlue,
        paddingHorizontal: 16,
        paddingVertical: 4,
        borderRadius: 12,
        marginVertical: 16,
    },
    inputContainer: {
        flex: 1,
        height: 48,
    },
    input: {
        flex: 1,
        fontSize: 16,
        marginLeft: 8,
        color: colors.charcoal,
    },
});
