import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// screens
import LoginScreen from '../screens/Auth/Login';

const RootStack = createNativeStackNavigator({
  screens: {
    Login: LoginScreen,
  },
  screenOptions() {
    return{
      headerShown: false
    }
  },
});

const RootNavigation = createStaticNavigation(RootStack);

export default RootNavigation;
