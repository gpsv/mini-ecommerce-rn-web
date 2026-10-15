import { catalogApi } from '../catalog/catalogApi';
import type { StorageAdapter } from '../shared/storage.types';
import { API_ERROR_CODES } from '../store/baseApi';
import { createAppStore } from '../store/createAppStore';
import products from './fixtures/products.json';

const storage: StorageAdapter = {
  getItem: async () => null,
  setItem: async () => {},
  removeItem: async () => {},
};

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

let fetchMock: jest.Mock<Promise<Response>, [Request]>;
let errorSpy: jest.SpyInstance;

beforeEach(() => {
  // RTK Query syncs subscriptions on a 500 ms timer and notifies on the next
  // animation frame (a timer in the React Native Jest preset). Fake timers keep
  // those callbacks from firing after the test environment is torn down.
  jest.useFakeTimers();
  fetchMock = jest.fn();
  globalThis.fetch = fetchMock as unknown as typeof fetch;
  errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  errorSpy.mockRestore();
  jest.clearAllTimers();
  jest.useRealTimers();
});

describe('getProducts', () => {
  it('validates the response and converts prices to cents', async () => {
    fetchMock.mockResolvedValue(jsonResponse(products));
    const store = createAppStore(storage);

    const result = await store.dispatch(catalogApi.endpoints.getProducts.initiate());

    expect(fetchMock.mock.calls[0][0].url).toBe('https://fakestoreapi.com/products');
    expect(result.data?.map(product => product.priceInCents)).toEqual([
      10995, 69500, 99999,
    ]);
    expect(result.data?.[0]).not.toHaveProperty('price');
  });

  it('turns an invalid response into a controlled error without unhandled logs', async () => {
    const [backpack] = products;
    fetchMock.mockResolvedValue(jsonResponse([{ ...backpack, price: '109.95' }]));
    const store = createAppStore(storage);

    const result = await store.dispatch(catalogApi.endpoints.getProducts.initiate());

    expect(result.isError).toBe(true);
    expect(result.error).toMatchObject({
      status: 'CUSTOM_ERROR',
      error: API_ERROR_CODES.invalidResponse,
    });
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('keeps HTTP errors so the UI can retry', async () => {
    fetchMock.mockResolvedValue(new Response('Server error', { status: 500 }));
    const store = createAppStore(storage);

    const result = await store.dispatch(catalogApi.endpoints.getProducts.initiate());

    expect(result.error).toMatchObject({ status: 'PARSING_ERROR', originalStatus: 500 });
  });

  it('makes a single request for several subscribers', async () => {
    fetchMock.mockImplementation(async () => jsonResponse(products));
    const store = createAppStore(storage);

    await Promise.all([
      store.dispatch(catalogApi.endpoints.getProducts.initiate()),
      store.dispatch(catalogApi.endpoints.getProducts.initiate()),
    ]);
    await store.dispatch(catalogApi.endpoints.getProducts.initiate());

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe('getProductById (fallback)', () => {
  it('returns one product in cents', async () => {
    fetchMock.mockResolvedValue(jsonResponse(products[2]));
    const store = createAppStore(storage);

    const result = await store.dispatch(
      catalogApi.endpoints.getProductById.initiate(14),
    );

    expect(fetchMock.mock.calls[0][0].url).toBe('https://fakestoreapi.com/products/14');
    expect(result.data).toMatchObject({ id: 14, priceInCents: 99999 });
  });

  it('turns the API empty 200 body for an unknown id into PRODUCT_NOT_FOUND', async () => {
    fetchMock.mockResolvedValue(new Response('', { status: 200 }));
    const store = createAppStore(storage);

    const result = await store.dispatch(
      catalogApi.endpoints.getProductById.initiate(999),
    );

    expect(result.error).toEqual({
      status: 'CUSTOM_ERROR',
      error: API_ERROR_CODES.productNotFound,
    });
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('keeps other HTTP errors as they are', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'down' }), { status: 503 }),
    );
    const store = createAppStore(storage);

    const result = await store.dispatch(
      catalogApi.endpoints.getProductById.initiate(1),
    );

    expect(result.error).toEqual({ status: 503, data: { message: 'down' } });
  });
});
