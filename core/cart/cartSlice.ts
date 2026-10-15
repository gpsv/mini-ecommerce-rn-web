import { createSlice, type Draft, type PayloadAction } from '@reduxjs/toolkit';
import * as cartRules from './cart.rules';
import type { CartItem, CartProductSnapshot } from './cart.schema';

export interface CartState {
  items: readonly CartItem[];
  /** False until the persisted cart has been read, so it is not overwritten before loading. */
  isHydrated: boolean;
}

const initialState: CartState = {
  items: [],
  isHydrated: false,
};

/**
 * Keeps the same state when a rule returns the same array (no-op), so neither
 * subscribers nor the persistence listener see a change.
 */
function withItems(
  state: Draft<CartState>,
  items: readonly CartItem[],
): CartState {
  return items === state.items ? state : { ...state, items };
}

/** Reducers only delegate to the pure rules in cart.rules.ts. */
export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<CartProductSnapshot>) =>
      withItems(state, cartRules.addItem(state.items, action.payload)),
    increaseQuantity: (state, action: PayloadAction<number>) =>
      withItems(state, cartRules.increaseQuantity(state.items, action.payload)),
    decreaseQuantity: (state, action: PayloadAction<number>) =>
      withItems(state, cartRules.decreaseQuantity(state.items, action.payload)),
    removeItem: (state, action: PayloadAction<number>) =>
      withItems(state, cartRules.removeItem(state.items, action.payload)),
    clearCart: state => withItems(state, cartRules.clearCart()),
    cartHydrated: (_state, action: PayloadAction<CartItem[]>) => ({
      items: action.payload,
      isHydrated: true,
    }),
  },
});

export const {
  addItem,
  increaseQuantity,
  decreaseQuantity,
  removeItem,
  clearCart,
  cartHydrated,
} = cartSlice.actions;
