import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';
import { cartSlice, type CartState } from '../cart/cartSlice';
import {
  checkoutSlice,
  DEFAULT_CHECKOUT_DELAY_MS,
  generateOrderNumber,
  type CheckoutDependencies,
  type CheckoutThunkExtra,
} from '../checkout/checkoutSlice';
import type { StorageAdapter } from '../shared/storage.types';
import { baseApi } from './baseApi';
import { cartRehydrationRequested, startCartPersistence } from './cartPersistence';

export interface AppStoreOptions {
  /**
   * Mobile passes __DEV__ and web import.meta.env.DEV: core/ cannot read
   * either global itself. Enables development warnings and Redux DevTools.
   */
  isDevelopment?: boolean;
  checkout?: Partial<CheckoutDependencies>;
}

/**
 * Builds the store shared by mobile and web. Platform storage comes in
 * through StorageAdapter (AsyncStorage on mobile, localStorage on web).
 */
export function createAppStore(
  storage: StorageAdapter,
  { isDevelopment = false, checkout }: AppStoreOptions = {},
) {
  const listenerMiddleware = createListenerMiddleware();
  const thunkExtra: CheckoutThunkExtra = {
    checkout: {
      delayMs: DEFAULT_CHECKOUT_DELAY_MS,
      generateOrderNumber: () => generateOrderNumber(),
      ...checkout,
    },
  };

  const store = configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      cart: cartSlice.reducer,
      checkout: checkoutSlice.reducer,
    },
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({ thunk: { extraArgument: thunkExtra } })
        .prepend(listenerMiddleware.middleware)
        .concat(baseApi.middleware),
    devTools: isDevelopment,
  });

  startCartPersistence(
    listenerMiddleware.startListening.withTypes<{ cart: CartState }>(),
    { storage, isDevelopment },
  );
  store.dispatch(cartRehydrationRequested());

  return store;
}

export type AppStore = ReturnType<typeof createAppStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
