import React from 'react';
import {
    View,
    StyleSheet,
    Pressable,
} from 'react-native';
import Icon from '@react-native-vector-icons/feather';
import Ionicons from '@react-native-vector-icons/ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';

// components
import AppText from '../../../components/Common/AppText';
import FullWidthButton from '../../../components/Common/FullWidthButton';
import TextButton from '../../../components/Common/TextButton';

// constants
import colors from '../../../constants/colors';

const AccountVerification = () => {
    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable
                    onPress={() => { }}
                    style={styles.backBtn}
                >
                    <Ionicons
                        name="arrow-back"
                        size={24}
                        color={colors.deepTeal}
                    />
                </Pressable>
                <AppText style={styles.headerTitle}>{"Sentinel Key"}</AppText>
            </View>

            {/* Content */}
            <View style={styles.content}>
                {/* Icon Circle */}
                <View style={styles.iconInner}>
                    <Icon name="mail" size={36} color={colors.deepTeal} />
                </View>

                {/* Title */}
                <AppText style={styles.title}>{"Verifying your account"}</AppText>

                {/* Status */}
                <View style={styles.statusRow}>
                    <View style={styles.dot} />
                    <AppText style={styles.statusText}>
                        {"CHECKING VERIFICATION STATUS..."}
                    </AppText>
                </View>

                {/* Description */}
                <AppText style={styles.description}>
                    {`We're checking if your email address has been verified.\nThis will only take a moment.`}
                </AppText>

                {/* Progress Bar */}
                <View style={styles.progressBar}>
                    <View style={styles.progressFill} />
                </View>
            </View>

            {/* Bottom Section */}
            <View style={styles.bottomSection}>
                <FullWidthButton
                    buttonText={"Resend Verification Email"}
                    onPress={() => { }}
                    loading={false}
                    disabled={false}
                />
                <TextButton
                    btnText={'Cancel / Logout'}
                    onPress={() => { }}
                    textStyle={styles.cancelText}
                />
            </View>
        </SafeAreaView>
    );
};

export default AccountVerification;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: colors.offWhiteBlueGray,
    },
    backBtn: {
        padding: 5,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '600',
        color: colors.deepTeal,
        marginRight: 24,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingTop: 40,
    },
    iconInner: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: colors.lightCoolGray,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.deepTeal,
        marginTop: 32,
        textAlign: 'center',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 18,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.mutedTeal,
        marginRight: 8,
    },
    statusText: {
        fontSize: 13,
        letterSpacing: 1,
        fontWeight: '600',
        color: colors.mutedTeal,
    },
    description: {
        fontSize: 15,
        color: colors.mutedTeal,
        textAlign: 'center',
        marginTop: 16,
        lineHeight: 22,
    },
    progressBar: {
        width: '100%',
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.lightCoolGray,
        marginTop: 24,
        overflow: 'hidden',
    },
    progressFill: {
        width: '65%',
        height: '100%',
        backgroundColor: colors.deepTeal,
        borderRadius: 3,
    },
    bottomSection: {
        paddingHorizontal: 20,
        paddingBottom: 30,
    },
    cancelText: {
        marginTop: 18,
        textAlign: 'center',
        fontSize: 15,
        fontWeight: '500',
        color: colors.deepTeal,
    },
});