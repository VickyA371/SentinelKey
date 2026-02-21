import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// screens
import LoginScreen from '../screens/Auth/Login';
import SignUpScreen from '../screens/Auth/Signup';
import AccountVerification from '../screens/Auth/AccountVerification';

export type AuthScreensPropTypes = {
  Login: undefined
  Signup: undefined
  Verification: undefined
}

const RootStack = createNativeStackNavigator<AuthScreensPropTypes>({
  screens: {
    Login: LoginScreen,
    Signup: SignUpScreen,
    Verification: AccountVerification,
  },
  screenOptions() {
    return{
      headerShown: false
    }
  },
});

const RootNavigation = createStaticNavigation(RootStack);

export default RootNavigation;
