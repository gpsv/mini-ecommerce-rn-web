import { multiplyCents } from '../shared/money';
import {
  MAX_QUANTITY,
  MIN_QUANTITY,
  type CartItem,
  type CartProductSnapshot,
} from './cart.schema';

/**
 * Cart business rules as pure functions: they never mutate the input. When
 * nothing changes they return the same array, so the store, the persistence
 * listener and memoized components do not see a false change. Removing is
 * always explicit (removeItem); decreasing stops at MIN_QUANTITY (D08).
 */

function updateQuantity(
  items: readonly CartItem[],
  productId: number,
  getQuantity: (quantity: number) => number,
): readonly CartItem[] {
  let hasChanged = false;
  const updatedItems = items.map(item => {
    if (item.id !== productId) {
      return item;
    }
    const quantity = getQuantity(item.quantity);
    if (quantity === item.quantity) {
      return item;
    }
    hasChanged = true;
    return { ...item, quantity };
  });
  return hasChanged ? updatedItems : items;
}

/** Adds a product snapshot; if it is already in the cart, adds 1 (up to MAX_QUANTITY). */
export function addItem(
  items: readonly CartItem[],
  { id, title, priceInCents, image, category }: CartProductSnapshot,
): readonly CartItem[] {
  if (items.some(item => item.id === id)) {
    return increaseQuantity(items, id);
  }
  return [
    ...items,
    { id, title, priceInCents, image, category, quantity: MIN_QUANTITY },
  ];
}

export function increaseQuantity(
  items: readonly CartItem[],
  productId: number,
): readonly CartItem[] {
  return updateQuantity(items, productId, quantity =>
    Math.min(quantity + 1, MAX_QUANTITY),
  );
}

export function decreaseQuantity(
  items: readonly CartItem[],
  productId: number,
): readonly CartItem[] {
  return updateQuantity(items, productId, quantity =>
    Math.max(quantity - 1, MIN_QUANTITY),
  );
}

export function removeItem(
  items: readonly CartItem[],
  productId: number,
): readonly CartItem[] {
  return items.some(item => item.id === productId)
    ? items.filter(item => item.id !== productId)
    : items;
}

export function clearCart(): readonly CartItem[] {
  return [];
}

/** Line subtotal (unit price × quantity) in integer cents. */
export function getLineTotalInCents({
  priceInCents,
  quantity,
}: Pick<CartItem, 'priceInCents' | 'quantity'>): number {
  return multiplyCents(priceInCents, quantity);
}
