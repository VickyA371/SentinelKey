import { useEffect } from "react";
import { StatusBar, StyleSheet, useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { hideSplash } from "react-native-splash-view";

// navigation
import AppContent from "./src/navigation";

// redux
import { Provider } from 'react-redux'
import { store } from "./src/store";

import Toast from 'react-native-toast-message';

const styles = StyleSheet.create({
  root: {
    flex: 1,
  }
})

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    setTimeout(() => {
      hideSplash();
    }, 2000)
  }, []);

  return (
    <Provider store={store}>
      <GestureHandlerRootView style={styles.root}>
        <BottomSheetModalProvider>
          <SafeAreaProvider>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            <AppContent />
          </SafeAreaProvider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
      <Toast />
    </Provider>
  );
}

export default App;
