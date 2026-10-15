import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { selectTotalInCents, selectTotalItems } from '../cart/cart.selectors';
import { clearCart, type CartState } from '../cart/cartSlice';
import {
  CheckoutContactSchema,
  type CheckoutContact,
} from './checkout.schema';

export const DEFAULT_CHECKOUT_DELAY_MS = 1500;

export type CheckoutStatus = 'idle' | 'processing' | 'confirmed';

/** Snapshot taken before clearing the cart: the confirmation screen still shows it. */
export interface ConfirmedOrder {
  orderNumber: string;
  contact: CheckoutContact;
  totalItems: number;
  totalInCents: number;
}

export interface CheckoutState {
  status: CheckoutStatus;
  confirmedOrder: ConfirmedOrder | null;
}

/** Injected through the thunk extra argument so tests control time and order numbers. */
export interface CheckoutDependencies {
  delayMs: number;
  generateOrderNumber: () => string;
}

export interface CheckoutThunkExtra {
  checkout: CheckoutDependencies;
}

interface CheckoutRootState {
  cart: CartState;
  checkout: CheckoutState;
}

/** "MS-" plus 5 digits, as in the design (e.g. MS-48213). */
export function generateOrderNumber(random: () => number = Math.random): string {
  return `MS-${10000 + Math.floor(random() * 90000)}`;
}

function wait(delayMs: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, delayMs));
}

const initialState: CheckoutState = {
  status: 'idle',
  confirmedOrder: null,
};

const createCheckoutThunk = createAsyncThunk.withTypes<{
  state: CheckoutRootState;
  extra: CheckoutThunkExtra;
}>();

/** Simulated order confirmation: waits, generates the order number and clears the cart. */
export const confirmOrder = createCheckoutThunk(
  'checkout/confirmOrder',
  async (contact: CheckoutContact, { getState, dispatch, extra }) => {
    const validContact = CheckoutContactSchema.parse(contact);
    const state = getState();
    const totalItems = selectTotalItems(state);
    const totalInCents = selectTotalInCents(state);

    await wait(extra.checkout.delayMs);

    const order: ConfirmedOrder = {
      orderNumber: extra.checkout.generateOrderNumber(),
      contact: validContact,
      totalItems,
      totalInCents,
    };
    dispatch(clearCart());
    return order;
  },
  {
    // Avoids double submission and confirming an empty cart.
    condition: (_contact, { getState }) => {
      const { cart, checkout } = getState();
      return checkout.status !== 'processing' && cart.items.length > 0;
    },
  },
);

export const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    resetCheckout: () => initialState,
  },
  extraReducers: builder => {
    builder
      .addCase(confirmOrder.pending, state => {
        state.status = 'processing';
        state.confirmedOrder = null;
      })
      .addCase(confirmOrder.fulfilled, (state, action) => {
        state.status = 'confirmed';
        state.confirmedOrder = action.payload;
      })
      .addCase(confirmOrder.rejected, state => {
        state.status = 'idle';
      });
  },
});

export const { resetCheckout } = checkoutSlice.actions;

export const selectCheckoutStatus = (state: { checkout: CheckoutState }) =>
  state.checkout.status;

export const selectConfirmedOrder = (state: { checkout: CheckoutState }) =>
  state.checkout.confirmedOrder;
