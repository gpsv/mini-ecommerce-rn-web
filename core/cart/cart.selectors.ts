import { createSelector } from '@reduxjs/toolkit';
import { sumCents } from '../shared/money';
import { getLineTotalInCents } from './cart.rules';
import type { CartState } from './cartSlice';

/** Only the slice these selectors need, to avoid importing RootState (and a cycle). */
interface CartRootState {
  cart: CartState;
}

export const selectCartItems = (state: CartRootState) => state.cart.items;

export const selectIsCartHydrated = (state: CartRootState) =>
  state.cart.isHydrated;

export const selectTotalItems = createSelector([selectCartItems], items =>
  items.reduce((total, item) => total + item.quantity, 0),
);

export const selectTotalInCents = createSelector([selectCartItems], items =>
  sumCents(items.map(getLineTotalInCents)),
);
