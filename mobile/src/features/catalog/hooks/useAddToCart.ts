import { useCallback } from 'react';
import { addItem } from '@core/cart/cartSlice';
import type { CatalogProduct } from '@core/catalog/product.schema';
import { useAppDispatch } from '../../../shared/hooks/useAppDispatch';

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
