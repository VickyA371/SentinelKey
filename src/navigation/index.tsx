import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// auth screens
import LoginScreen from '../screens/Auth/Login';
import SignUpScreen from '../screens/Auth/Signup';
import AccountVerification from '../screens/Auth/AccountVerification';

// app screens
import HomeScreen from '../screens/App/HomeScreen';
import AddListItem from '../screens/App/AddListItem';

// Placeholders for auth state logic
// In a real app, these would use your actual auth state (e.g. from a Context or Store)
const useIsLoggedIn = () => false;
const useIsLoggedOut = () => !useIsLoggedIn();

const RootStack = createNativeStackNavigator({
  groups: {
    Auth: {
      if: useIsLoggedOut,
      screenOptions: {
        headerShown: false,
      },
      screens: {
        Login: LoginScreen,
        Signup: SignUpScreen,
        Verification: AccountVerification,
      },
    },
    App: {
      if: useIsLoggedIn,
      screenOptions: {
        headerShown: false,
      },
      screens: {
        Home: HomeScreen,
        AddListItem: {
          screen: AddListItem,
          // You can also define specific options for screens here
        },
      },
    },
  },
});

const RootNavigation = createStaticNavigation(RootStack);

export default RootNavigation;
