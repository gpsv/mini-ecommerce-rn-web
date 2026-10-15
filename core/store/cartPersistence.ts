import { createAction, type TypedStartListening } from '@reduxjs/toolkit';
import {
  CART_STORAGE_VERSION,
  PersistedCartSchema,
  type CartItem,
  type PersistedCart,
} from '../cart/cart.schema';
import { cartHydrated, type CartState } from '../cart/cartSlice';
import type { StorageAdapter } from '../shared/storage.types';

export const CART_STORAGE_KEY = 'mini-ecommerce/cart';

/** Dispatched once by createAppStore, after the listeners are registered. */
export const cartRehydrationRequested = createAction('cart/rehydrationRequested');

interface CartPersistenceState {
  cart: CartState;
}

export interface CartPersistenceOptions {
  storage: StorageAdapter;
  isDevelopment: boolean;
}

/**
 * Reads the stored cart and validates it at the boundary (D04).
 * Broken JSON, an invalid shape or another version are discarded: the key is
 * removed and the cart starts empty.
 */
async function readPersistedCart(
  { storage, isDevelopment }: CartPersistenceOptions,
): Promise<CartItem[]> {
  const warn = (message: string, detail: unknown) => {
    if (isDevelopment) {
      console.warn(`[cartPersistence] ${message}`, detail);
    }
  };

  let raw: string | null;
  try {
    raw = await storage.getItem(CART_STORAGE_KEY);
  } catch (error) {
    warn('Could not read the stored cart.', error);
    return [];
  }
  if (raw === null) {
    return [];
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(raw);
  } catch (error) {
    parsedJson = error;
  }
  const result = PersistedCartSchema.safeParse(parsedJson);
  if (result.success) {
    return result.data.items;
  }

  warn('Discarding invalid stored cart.', result.error.issues);
  try {
    await storage.removeItem(CART_STORAGE_KEY);
  } catch (error) {
    warn('Could not remove the invalid stored cart.', error);
  }
  return [];
}

/**
 * Listener middleware for the cart:
 * - On cartRehydrationRequested, loads the stored cart and dispatches cartHydrated.
 * - Saves the cart whenever its items change, but only after hydration, so an
 *   empty initial cart never overwrites the stored one. cartHydrated itself is
 *   not saved back (it just came from storage).
 * Known trade-off: items added before hydration finishes are replaced by the
 * stored cart. Reading local storage finishes long before the catalog loads,
 * so the UI cannot add products that early.
 */
export function startCartPersistence(
  startListening: TypedStartListening<CartPersistenceState>,
  options: CartPersistenceOptions,
): void {
  const { storage, isDevelopment } = options;

  startListening({
    actionCreator: cartRehydrationRequested,
    effect: async (_action, listenerApi) => {
      const items = await readPersistedCart(options);
      listenerApi.dispatch(cartHydrated(items));
    },
  });

  startListening({
    predicate: (action, currentState, previousState) =>
      currentState.cart.isHydrated &&
      currentState.cart.items !== previousState.cart.items &&
      !cartHydrated.match(action),
    effect: async (_action, listenerApi) => {
      const persistedCart: PersistedCart = {
        version: CART_STORAGE_VERSION,
        items: [...listenerApi.getState().cart.items],
      };
      try {
        await storage.setItem(CART_STORAGE_KEY, JSON.stringify(persistedCart));
      } catch (error) {
        if (isDevelopment) {
          console.warn('[cartPersistence] Could not save the cart.', error);
        }
      }
    },
  });
}
