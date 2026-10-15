import { fireEvent, screen } from '@testing-library/react-native';
import products from '@core/__tests__/fixtures/products.json';
import { renderWithNavigation } from '../../../../../test-utils/navigationTestUtils';
import {
  createTestStore,
  jsonResponse,
  mockFetch,
  type FetchMock,
} from '../../../../../test-utils/storeTestUtils';

let fetchMock: FetchMock;

beforeEach(() => {
  jest.useFakeTimers();
  fetchMock = mockFetch();
});

afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});

describe('ProductListScreen', () => {
  it('shows the error state and loads the catalog after "Reintentar"', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response('', { status: 500 }))
      .mockResolvedValueOnce(jsonResponse(products));
    renderWithNavigation(createTestStore(), ['ProductList']);

    expect(await screen.findByText('No pudimos cargar los productos')).toBeOnTheScreen();
    expect(screen.queryByText(products[0].title)).not.toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Reintentar' }));

    expect(await screen.findByText(products[0].title)).toBeOnTheScreen();
    expect(screen.queryByText('No pudimos cargar los productos')).not.toBeOnTheScreen();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
