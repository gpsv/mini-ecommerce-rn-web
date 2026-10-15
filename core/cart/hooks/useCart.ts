import { useCallback } from 'react';
import {
  selectCartItems,
  selectIsCartHydrated,
  selectTotalInCents,
  selectTotalItems,
} from '../cart.selectors';
import { decreaseQuantity, increaseQuantity } from '../cartSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';

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
