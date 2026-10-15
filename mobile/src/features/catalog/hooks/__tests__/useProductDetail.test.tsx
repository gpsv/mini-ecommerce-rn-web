import { act, renderHook, waitFor } from '@testing-library/react-native';
import { catalogApi } from '@core/catalog/catalogApi';
import products from '@core/__tests__/fixtures/products.json';
import {
  createStoreWrapper,
  createTestStore,
  getRequestedUrls,
  jsonResponse,
  mockFetch,
  type FetchMock,
} from '../../../../../test-utils/storeTestUtils';
import { useProductDetail } from '@core/catalog/hooks/useProductDetail';

let fetchMock: FetchMock;

beforeEach(() => {
  // RTK Query schedules subscription and notification timers; fake timers keep
  // them from running after the test environment is torn down.
  jest.useFakeTimers();
  fetchMock = mockFetch();
  fetchMock.mockImplementation(async request =>
    request.url.endsWith('/products')
      ? jsonResponse(products)
      : new Response('', { status: 200 }), // the API's answer for an unknown id
  );
});

afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});

async function createStoreWithCatalog() {
  const store = createTestStore();
  await store.dispatch(catalogApi.endpoints.getProducts.initiate());
  return store;
}

describe('useProductDetail', () => {
  it('reads a cached product without another request', async () => {
    const store = await createStoreWithCatalog();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const { result } = renderHook(() => useProductDetail(5), {
      wrapper: createStoreWrapper(store),
    });

    expect(result.current.status).toBe('success');
    expect(result.current.product?.title).toBe(products[1].title);

    // Let any request RTK Query might have scheduled run before counting.
    await act(() => jest.runOnlyPendingTimersAsync());
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(getRequestedUrls(fetchMock)).toEqual(['https://fakestoreapi.com/products']);
  });

  it('falls back to /products/:id only when the product is not cached', async () => {
    const store = await createStoreWithCatalog();

    const { result } = renderHook(() => useProductDetail(999), {
      wrapper: createStoreWrapper(store),
    });

    expect(result.current.status).toBe('loading');
    await waitFor(() => expect(result.current.status).toBe('notFound'));
    expect(getRequestedUrls(fetchMock)).toEqual([
      'https://fakestoreapi.com/products',
      'https://fakestoreapi.com/products/999',
    ]);
  });
});
