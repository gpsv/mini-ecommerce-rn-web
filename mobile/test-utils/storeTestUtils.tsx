import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { waitFor } from '@testing-library/react-native';
import {
  CART_STORAGE_VERSION,
  type CartItem,
  type PersistedCart,
} from '@core/cart/cart.schema';
import { toCatalogProduct } from '@core/catalog/product.schema';
import type { StorageAdapter } from '@core/shared/storage.types';
import { CART_STORAGE_KEY } from '@core/store/cartPersistence';
import {
  createAppStore,
  type AppStore,
  type AppStoreOptions,
} from '@core/store/createAppStore';
import products from '@core/__tests__/fixtures/products.json';

export interface MemoryStorage extends StorageAdapter {
  setItem: jest.Mock<Promise<void>, [string, string]>;
}

/** In-memory StorageAdapter; setItem is a mock so tests can read what was saved. */
export function createMemoryStorage(initial: Record<string, string> = {}): MemoryStorage {
  const values = new Map(Object.entries(initial));
  return {
    getItem: async key => values.get(key) ?? null,
    setItem: jest.fn(async (key: string, value: string) => {
      values.set(key, value);
    }),
    removeItem: async key => {
      values.delete(key);
    },
  };
}

interface TestStoreOptions extends AppStoreOptions {
  storage?: StorageAdapter;
}

/** A fresh store per test: RTK Query cache and cart never leak between tests. */
export function createTestStore({
  storage = createMemoryStorage(),
  ...options
}: TestStoreOptions = {}): AppStore {
  return createAppStore(storage, options);
}

/** Two products from the fixture: backpack ×1 ($109.95) and bracelet ×2 ($1,390.00). */
export function createCartItems(): CartItem[] {
  const [backpack, bracelet] = products.map(toCatalogProduct);
  const toItem = ({ id, title, priceInCents, image, category }: typeof backpack, quantity: number) => ({
    id,
    title,
    priceInCents,
    image,
    category,
    quantity,
  });
  return [toItem(backpack, 1), toItem(bracelet, 2)];
}

export function createStoredCart(items: CartItem[]): Record<string, string> {
  const persistedCart: PersistedCart = { version: CART_STORAGE_VERSION, items };
  return { [CART_STORAGE_KEY]: JSON.stringify(persistedCart) };
}

/** Store whose cart is rehydrated from storage, as on app start. */
export async function createStoreWithCart(
  items: CartItem[],
  options: AppStoreOptions = {},
): Promise<{ store: AppStore; storage: MemoryStorage }> {
  const storage = createMemoryStorage(createStoredCart(items));
  const store = createTestStore({ storage, ...options });
  await waitFor(() => expect(store.getState().cart.isHydrated).toBe(true));
  return { store, storage };
}

export function createStoreWrapper(store: AppStore) {
  return function StoreWrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  };
}

export function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export type FetchMock = jest.Mock<Promise<Response>, [Request]>;

/** Replaces global fetch; every call is recorded with its Request. */
export function mockFetch(): FetchMock {
  const fetchMock: FetchMock = jest.fn();
  globalThis.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

export function getRequestedUrls(fetchMock: FetchMock): string[] {
  return fetchMock.mock.calls.map(([request]) => request.url);
}
