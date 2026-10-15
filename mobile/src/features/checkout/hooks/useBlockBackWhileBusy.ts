import { useCallback, useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { RootStackScreenProps } from '../../../shared/navigation/types';

type CheckoutNavigation = RootStackScreenProps<'Checkout'>['navigation'];

/**
 * Blocks leaving checkout while the order is being confirmed (CLAUDE.md §9):
 * Android back button through BackHandler and the iOS swipe through
 * gestureEnabled. usePreventRemove is not used because its state updates in
 * a later effect and could also block the reset that follows confirmation.
 */
export function useBlockBackWhileBusy(isBusy: boolean) {
  const navigation = useNavigation<CheckoutNavigation>();

  useEffect(() => {
    navigation.setOptions({ gestureEnabled: !isBusy });
  }, [navigation, isBusy]);

  useFocusEffect(
    useCallback(() => {
      if (!isBusy) {
        return undefined;
      }
      // Registered after the navigator's listener, so it runs first and consumes the press.
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
      return () => subscription.remove();
    }, [isBusy]),
  );
}
