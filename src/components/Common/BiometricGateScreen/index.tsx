import React, { useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';

import AppText from '../AppText';
import colors from '../../../constants/colors';
import { promptBiometric } from '../../../utils/biometrics';

interface BiometricGateScreenProps {
    onAuthenticated: () => void;
}

const BiometricGateScreen = ({ onAuthenticated }: BiometricGateScreenProps) => {
    const handleAuthenticate = async () => {
        const { success } = await promptBiometric('Authenticate to access Sentinel Key');
        if (success) {
            onAuthenticated();
        }
    };

    // Auto-prompt on mount
    useEffect(() => {
        handleAuthenticate();
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.iconWrapper}>
                <Ionicons name="lock-closed" size={48} color={colors.deepTeal} />
            </View>
            <AppText style={styles.title}>{'Sentinel Key is Locked'}</AppText>
            <AppText style={styles.subtitle}>{'Authenticate to access your vault'}</AppText>
            <TouchableOpacity style={styles.button} onPress={handleAuthenticate}>
                <Ionicons name="finger-print" size={24} color={colors.white} />
                <AppText style={styles.buttonText}>{'Unlock'}</AppText>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.offWhiteBlueGray,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    iconWrapper: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: colors.transparentTeal01,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.charcoal,
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: colors.mutedBlueGray,
        textAlign: 'center',
        marginBottom: 40,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.deepTeal,
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.white,
    },
});

export default BiometricGateScreen;
