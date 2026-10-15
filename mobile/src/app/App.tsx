/**
 * @format
 */

import './global.css';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { RootNavigator } from './navigation/RootNavigator';
import { store } from './store';

function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        {/* Every screen has the primary AppHeader under the status bar. */}
        <StatusBar barStyle="light-content" />
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
}

export default App;
