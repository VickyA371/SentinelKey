import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { COLLECTIONS } from '../constants/firebase';
import { RootState, AppDispatch } from '../store';
import { setData, clearData } from '../store/slices/authSlice';
import {
  loadSecuritySettings,
  clearSecuritySettings,
} from '../store/slices/securitySlice';
import { refreshVaultStatus, resetVault } from '../store/slices/vaultSlice';
import { lockVault } from '../utils/vault';
import { disableBiometricUnlock } from '../utils/biometricVault';
import { View, ActivityIndicator, Linking } from 'react-native';
import colors from '../constants/colors';
import VaultSetupScreen from '../screens/Vault/VaultSetup';
import VaultUnlockScreen from '../screens/Vault/VaultUnlock';

// auth screens
import LoginScreen from '../screens/Auth/Login';
import SignUpScreen from '../screens/Auth/Signup';
import AccountVerification from '../screens/Auth/AccountVerification';
import ForgotPasswordScreen from '../screens/Auth/ForgotPassword';

// app screens
import HomeScreen from '../screens/App/HomeScreen';
import AddListItem from '../screens/App/AddListItem';
import SettingsScreen from '../screens/App/SettingsScreen';
import SecuritySettingsScreen from '../screens/App/SecuritySettings';
import ProfileDetailsScreen from '../screens/App/ProfileDetailsScreen';

// Redux-connected hooks for navigation logic
const useIsLoggedIn = () => {
  const { uid, isAccountVerified } = useSelector((state: RootState) => state.auth);
  return !!uid && !!isAccountVerified;
};

const useNeedsVerification = () => {
  const { uid, isAccountVerified } = useSelector((state: RootState) => state.auth);
  return !!uid && !isAccountVerified;
};

const useIsLoggedOut = () => {
  const uid = useSelector((state: RootState) => state.auth.uid);
  return !uid;
};

const RootStack = createNativeStackNavigator({
  groups: {
    App: {
      if: useIsLoggedIn,
      screenOptions: {
        headerShown: false,
      },
      screens: {
        Home: HomeScreen,
        AddListItem: {
          screen: AddListItem,
        },
        Settings: SettingsScreen,
        SecuritySettings: SecuritySettingsScreen,
        ProfileDetails: ProfileDetailsScreen,
      },
    },
    PendingVerification: {
      if: useNeedsVerification,
      screenOptions: {
        headerShown: false,
      },
      screens: {
        AccountVerification: AccountVerification,
      },
    },
    Auth: {
      if: useIsLoggedOut,
      screenOptions: {
        headerShown: false,
      },
      screens: {
        Login: LoginScreen,
        Signup: SignUpScreen,
        ForgotPassword: ForgotPasswordScreen,
      },
    },
  },
});

const InternalNavigation = createStaticNavigation(RootStack);

const VERIFY_DEEP_LINK_PREFIX = 'sentinelkey://verified';

function parseOobCodeFromUrl(url: string): string | null {
  if (!url || !url.startsWith(VERIFY_DEEP_LINK_PREFIX)) return null;
  try {
    const queryStart = url.indexOf('?');
    if (queryStart === -1) return null;
    const params = new URLSearchParams(url.slice(queryStart + 1));
    return params.get('oobCode');
  } catch {
    return null;
  }
}

async function handleEmailVerificationLink(url: string, dispatch: any) {
  const oobCode = parseOobCodeFromUrl(url);
  if (!oobCode) return;
  try {
    await auth().applyActionCode(oobCode);
    const user = auth().currentUser;
    if (user) {
      await user.reload();
      const updated = auth().currentUser;
      const emailVerified = updated?.emailVerified ?? false;
      const userDoc = await firestore().collection(COLLECTIONS.USERS).doc(updated?.uid ?? '').get();
      if (userDoc.exists()) {
        const userData = userDoc.data() as { uid: string; fullName: string; email: string; createdAt: string, phoneNumber: string };
        dispatch(setData({
          uid: userData.uid,
          fullName: userData.fullName,
          email: userData.email,
          phoneNumber: userData?.phoneNumber,
          createdAt: userData.createdAt,
          isAccountVerified: emailVerified,
        }));
      }
    }
  } catch (error) {
    console.error('Email verification link handling failed:', error);
  }
}

const RootNavigation = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [initializing, setInitializing] = useState(true);

  const vaultStatus = useSelector((state: RootState) => state.vault.status);
  const uid = useSelector((state: RootState) => state.auth.uid);
  const isLoggedIn = useSelector((state: RootState) => {
    const { uid: id, isAccountVerified } = state.auth;
    return !!id && !!isAccountVerified;
  });

  // Load security settings from AsyncStorage
  useEffect(() => {
    dispatch(loadSecuritySettings());
  }, [dispatch]);

  // Determine the vault gate status once the user is logged in + verified.
  useEffect(() => {
    if (isLoggedIn && uid) {
      dispatch(refreshVaultStatus(uid));
    }
  }, [isLoggedIn, uid, dispatch]);

  useEffect(() => {
    // Handle email verification deep link (app opened from verification email with handleCodeInApp)
    const handleUrl = (event: { url: string }) => handleEmailVerificationLink(event.url, dispatch);
    Linking.getInitialURL().then((url) => {
      if (url) handleEmailVerificationLink(url, dispatch);
    });
    const subscription = Linking.addEventListener('url', handleUrl);
    return () => subscription.remove();
  }, [dispatch]);

  useEffect(() => {
    // Sync Firebase Auth server state with app (Redux). Runs on app start and on sign-in/sign-out/token change.
    const unsubscribe = auth().onAuthStateChanged(async (user: FirebaseAuthTypes.User | null) => {
      if (user) {
        try {
          const userDoc = await firestore().collection(COLLECTIONS.USERS).doc(user.uid).get();
          if (userDoc.exists()) {
            const userData = userDoc.data() as { uid: string; fullName: string; email: string; createdAt: string, phoneNumber: string };
            dispatch(setData({
              uid: userData.uid,
              fullName: userData.fullName,
              email: userData.email,
              phoneNumber: userData.phoneNumber,
              createdAt: userData.createdAt,
              isAccountVerified: user.emailVerified,
            }));
          }
        } catch (error) {
          console.error('Auth state: error fetching user data:', error);
          dispatch(clearData());
        } finally {
          setInitializing(false);
        }
      } else {
        // Signed out: drop the in-memory vault key, wipe the device-local
        // biometric DEK (it's tied to this user's vault), and reset gate state.
        lockVault();
        disableBiometricUnlock();
        dispatch(resetVault());
        dispatch(clearSecuritySettings());
        dispatch(clearData());
        setInitializing(false);
      }
    });

    return unsubscribe;
  }, [dispatch]);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.offWhiteBlueGray }}>
        <ActivityIndicator size="large" color={colors.deepTeal} />
      </View>
    );
  }

  // Vault gate: a logged-in user must set up or unlock their encrypted vault
  // before any app screen (and its decrypting Firestore listeners) mounts.
  if (isLoggedIn) {
    if (vaultStatus === 'unknown') {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.offWhiteBlueGray }}>
          <ActivityIndicator size="large" color={colors.deepTeal} />
        </View>
      );
    }
    if (vaultStatus === 'needsSetup') {
      return <VaultSetupScreen />;
    }
    if (vaultStatus === 'locked') {
      return <VaultUnlockScreen />;
    }
  }

  return <InternalNavigation />;
};

export default RootNavigation;

