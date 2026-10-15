import { render } from '@testing-library/react-native';
import { NavigationContainer, type NavigationState, type PartialState } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import type { AppStore } from '@core/store/createAppStore';
import { RootNavigator } from '../src/app/navigation/RootNavigator';
import type { RootStackParamList } from '../src/shared/navigation/types';

type ParamlessRoute = {
  [Name in keyof RootStackParamList]: RootStackParamList[Name] extends undefined ? Name : never;
}[keyof RootStackParamList];

// Without initial metrics the provider waits for onLayout and renders nothing.
const TEST_METRICS = {
  frame: { x: 0, y: 0, width: 360, height: 800 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

/** Renders the real navigator with the given stack, the last route on top. */
export function renderWithNavigation(store: AppStore, routes: ParamlessRoute[]) {
  const initialState: PartialState<NavigationState> = {
    index: routes.length - 1,
    routes: routes.map(name => ({ name })),
  };
  return render(
    <Provider store={store}>
      <SafeAreaProvider initialMetrics={TEST_METRICS}>
        <NavigationContainer initialState={initialState}>
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>,
  );
}
