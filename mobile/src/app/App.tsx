/**
 * @format
 */

import './global.css';
import {
  ActivityIndicator,
  Pressable,
  StatusBar,
  Text,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useCSSVariable } from 'uniwind';
import { getLegacyShadowStyle } from '../shared/platform/shadows';

// Temporary smoke test for design tokens (P03); replaced by the catalog screens.
function StyleSmokeTest() {
  const insets = useSafeAreaInsets();
  // D14: props that require a color string read the token from JS.
  const primaryColor = useCSSVariable('--color-primary');

  return (
    <View
      className="flex-1 bg-background px-gutter"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <View
        className="mt-4 bg-surface rounded-lg shadow-card p-4 gap-2"
        style={getLegacyShadowStyle('card')}
      >
        <Text className="text-title text-text">Mochila Fjallraven</Text>
        <Text className="text-price-md text-price">$109.95</Text>
        <Pressable className="bg-primary h-touch rounded-md items-center justify-center">
          <Text className="text-body text-primary-foreground">Agregar</Text>
        </Pressable>
        <View className="flex-row gap-4">
          <ActivityIndicator colorClassName="accent-primary" />
          <ActivityIndicator
            color={typeof primaryColor === 'string' ? primaryColor : undefined}
          />
        </View>
      </View>
    </View>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <StyleSmokeTest />
    </SafeAreaProvider>
  );
}

export default App;
