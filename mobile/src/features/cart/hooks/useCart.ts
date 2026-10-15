import { useCallback } from 'react';
import {
  selectCartItems,
  selectIsCartHydrated,
  selectTotalInCents,
  selectTotalItems,
} from '@core/cart/cart.selectors';
import { decreaseQuantity, increaseQuantity } from '@core/cart/cartSlice';
import { useAppDispatch } from '../../../shared/hooks/useAppDispatch';
import { useAppSelector } from '../../../shared/hooks/useAppSelector';

/** Cart data from core/ selectors (cents) plus stable quantity callbacks for memoized rows. */
export function useCart() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const totalItems = useAppSelector(selectTotalItems);
  const totalInCents = useAppSelector(selectTotalInCents);
  const isHydrated = useAppSelector(selectIsCartHydrated);

  const increase = useCallback(
    (productId: number) => dispatch(increaseQuantity(productId)),
    [dispatch],
  );
  const decrease = useCallback(
    (productId: number) => dispatch(decreaseQuantity(productId)),
    [dispatch],
  );

  return { items, totalItems, totalInCents, isHydrated, increase, decrease };
}
