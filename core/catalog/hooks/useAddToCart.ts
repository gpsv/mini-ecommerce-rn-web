import { useCallback } from 'react';
import { addItem } from '../../cart/cartSlice';
import { useAppDispatch } from '../../store/hooks';
import type { CatalogProduct } from '../product.schema';

/** Stable callback, so memoized cards do not re-render. addItem keeps only the snapshot fields. */
export function useAddToCart() {
  const dispatch = useAppDispatch();
  return useCallback(
    (product: CatalogProduct) => {
      dispatch(addItem(product));
    },
    [dispatch],
  );
}
