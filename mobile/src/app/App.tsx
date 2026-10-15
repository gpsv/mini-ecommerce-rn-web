/**
 * @format
 */

import './global.css';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { ComponentGallery } from './ComponentGallery';
import { store } from './store';

function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" />
        <ComponentGallery />
      </SafeAreaProvider>
    </Provider>
  );
}

export default App;
