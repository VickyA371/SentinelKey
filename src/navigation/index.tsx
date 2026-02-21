import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// screens
import LoginScreen from '../screens/Auth/Login';
import SignUpScreen from '../screens/Auth/Signup';
import AccountVerification from '../screens/Auth/AccountVerification';
import HomeScreen from '../screens/App/HomeScreen';
import AddListItem from '../screens/App/AddListItem';

export type AuthScreensPropTypes = {
  Home: undefined
  Login: undefined
  Signup: undefined
  Verification: undefined
  AddListItem: { item?: any } | undefined
}

const RootStack = createNativeStackNavigator<AuthScreensPropTypes>({
  screens: {
    Home: HomeScreen,
    Login: LoginScreen,
    Signup: SignUpScreen,
    Verification: AccountVerification,
    AddListItem: AddListItem,
  },
  screenOptions() {
    return {
      headerShown: false
    }
  },
});

const RootNavigation = createStaticNavigation(RootStack);

export default RootNavigation;
