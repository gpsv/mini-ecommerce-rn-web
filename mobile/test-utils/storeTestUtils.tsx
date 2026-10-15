import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import type { StorageAdapter } from '@core/shared/storage.types';
import { createAppStore, type AppStore } from '@core/store/createAppStore';

const memoryStorage: StorageAdapter = {
  getItem: async () => null,
  setItem: async () => {},
  removeItem: async () => {},
};

/** A fresh store per test: RTK Query cache and cart never leak between tests. */
export function createTestStore(): AppStore {
  return createAppStore(memoryStorage);
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
