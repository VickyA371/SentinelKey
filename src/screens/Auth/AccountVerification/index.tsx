import React, { useCallback, useState } from 'react';
import {
    View,
    StyleSheet,
    Alert,
} from 'react-native';
import Icon from '@react-native-vector-icons/feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useDispatch } from 'react-redux';

// components
import AppText from '../../../components/Common/AppText';
import FullWidthButton from '../../../components/Common/FullWidthButton';
import TextButton from '../../../components/Common/TextButton';

// constants
import colors from '../../../constants/colors';
import { setData, clearData } from '../../../store/slices/authSlice';
import { useFocusEffect } from '@react-navigation/native';

const AccountVerification = () => {
    const dispatch = useDispatch();
    const [resendLoading, setResendLoading] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(false);

    const handleResendVerificationEmail = async () => {
        const user = auth().currentUser;
        if (!user) return;
        setResendLoading(true);
        try {
            const actionCodeSettings = {
                handleCodeInApp: true,
                url: 'https://sentinel-key.firebaseapp.com/verified',
                iOS: { bundleId: 'com.sentinelkey' },
                android: { packageName: 'com.sentinelkey', installApp: false },
            };
            await user.sendEmailVerification(actionCodeSettings);
            Alert.alert('Email sent', 'Verification email sent. Open the link in the email to verify—it will open this app.');
        } catch (error: any) {
            console.error('Resend verification error:', error);
            Alert.alert('Error', error?.message ?? 'Failed to send verification email.');
        } finally {
            setResendLoading(false);
        }
    };

    const handleCheckStatus = useCallback(async () => {
        const user = auth().currentUser;
        if (!user) return;
        setCheckingStatus(true);
        try {
            await user.reload();
            const updated = auth().currentUser;
            const emailVerified = updated?.emailVerified ?? false;
            const userDoc = await firestore().collection('users').doc(updated?.uid ?? '').get();
            if (userDoc.exists()) {
                const userData = userDoc.data() as { uid: string; fullName: string; email: string; createdAt: string, phoneNumber: string };
                dispatch(setData({
                    uid: userData.uid,
                    fullName: userData.fullName,
                    email: userData.email,
                    phoneNumber: userData.phoneNumber,
                    createdAt: userData.createdAt,
                    isAccountVerified: emailVerified,
                }));
            }
            if (emailVerified) {
                Alert.alert('Verified', 'Your email has been verified. You can now use the app.');
            } else {
                Alert.alert('Not yet', 'Email is not verified yet. Click the link in the email we sent you.');
            }
        } catch (error: any) {
            console.error('Check status error:', error);
            Alert.alert('Error', error?.message ?? 'Failed to check verification status.');
        } finally {
            setCheckingStatus(false);
        }
    }, [dispatch]);

    const handleLogout = () => {
        Alert.alert(
            'Log out',
            'Are you sure you want to log out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Log out',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await auth().signOut();
                            dispatch(clearData());
                        } catch (error) {
                            console.error('Logout error:', error);
                        }
                    },
                },
            ]
        );
    };

    useFocusEffect(useCallback(() => {
        handleCheckStatus()
    }, [handleCheckStatus]))

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.backBtn} />
                <AppText style={styles.headerTitle}>{"Sentinel Key"}</AppText>
            </View>

            {/* Content */}
            <View style={styles.content}>
                <View style={styles.iconInner}>
                    <Icon name="mail" size={36} color={colors.deepTeal} />
                </View>

                <AppText style={styles.title}>{"Verify your account"}</AppText>

                <View style={styles.statusRow}>
                    <View style={styles.dot} />
                    <AppText style={styles.statusText}>
                        {checkingStatus ? "CHECKING..." : "EMAIL NOT VERIFIED"}
                    </AppText>
                </View>

                <AppText style={styles.description}>
                    {`We've sent a verification link to your email.\nOpen the link to verify, then tap "Check status" below.`}
                </AppText>

                <View style={styles.progressBar}>
                    <View style={styles.progressFill} />
                </View>
            </View>

            <View style={styles.bottomSection}>
                <FullWidthButton
                    buttonText={"Resend Verification Email"}
                    onPress={handleResendVerificationEmail}
                    loading={resendLoading}
                    disabled={resendLoading || checkingStatus}
                />
                <TextButton
                    btnText={'Cancel / Logout'}
                    onPress={handleLogout}
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