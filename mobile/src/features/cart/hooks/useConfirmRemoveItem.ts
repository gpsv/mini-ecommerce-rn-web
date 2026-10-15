import { useCallback } from 'react';
import { Alert } from 'react-native';
import type { CartItem } from '@core/cart/cart.schema';
import { removeItem } from '@core/cart/cartSlice';
import { useAppDispatch } from '@core/store/hooks';

/**
 * Removing is always explicit and confirmed (D08). Mobile uses the native
 * Alert; the 09-Carrito-Confirmar dialog is the web version (D15).
 */
export function useConfirmRemoveItem() {
  const dispatch = useAppDispatch();

  return useCallback(
    (item: CartItem) => {
      Alert.alert(
        '¿Eliminar este producto del carrito?',
        item.title,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: () => dispatch(removeItem(item.id)),
          },
        ],
        { cancelable: true },
      );
    },
    [dispatch],
  );
}
