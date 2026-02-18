import { ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native"
import AppText from "../AppText"
import colors from "../../../constants/colors"

type FullWidthButtonPropTypes = {
    buttonText: string
    onPress: () => unknown
    disabled?: boolean
    loading?: boolean
}

const FullWidthButton = (props: FullWidthButtonPropTypes) => {
    const {
        buttonText,
        onPress,
        disabled,
        loading
    } = props;

    return (
        <TouchableOpacity
            disabled={disabled}
            onPress={onPress}
            style={styles.loginButton}
        >
            {
                loading ? (
                    <ActivityIndicator size={'small'} color={colors.white} />
                ) : (
                    <AppText style={styles.loginText}>{buttonText}</AppText>
                )
            }
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    loginButton: {
        backgroundColor: colors.deepTeal,
        height: 55,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    loginText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
})

export default FullWidthButton;
