import { useMemo, useState } from 'react';
import {
  selectCartItems,
  selectTotalInCents,
  selectTotalItems,
} from '../../cart/cart.selectors';
import type { CartItem } from '../../cart/cart.schema';
import { useAppSelector } from '../../store/hooks';

export interface OrderSummaryData {
  items: readonly CartItem[];
  totalItems: number;
  totalInCents: number;
}

/**
 * Cart summary for checkout. While isLocked (order being confirmed) it keeps
 * the values from when the lock started: confirmOrder clears the cart before
 * the screen navigates away, and the summary must not drop to $0.00.
 */
export function useOrderSummary(isLocked: boolean): OrderSummaryData {
  const items = useAppSelector(selectCartItems);
  const totalItems = useAppSelector(selectTotalItems);
  const totalInCents = useAppSelector(selectTotalInCents);
  const liveSummary = useMemo(
    () => ({ items, totalItems, totalInCents }),
    [items, totalItems, totalInCents],
  );

  // State adjusted during render (no effect): React re-renders before painting.
  const [lockedSummary, setLockedSummary] = useState<OrderSummaryData | null>(null);
  if (isLocked && lockedSummary === null) {
    setLockedSummary(liveSummary);
  }
  if (!isLocked && lockedSummary !== null) {
    setLockedSummary(null);
  }

  return (isLocked ? lockedSummary : null) ?? liveSummary;
}
