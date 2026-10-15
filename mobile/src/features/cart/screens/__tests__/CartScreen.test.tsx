import { Alert, type AlertButton } from 'react-native';
import { act, fireEvent, screen } from '@testing-library/react-native';
import products from '@core/__tests__/fixtures/products.json';
import { renderWithNavigation } from '../../../../../test-utils/navigationTestUtils';
import {
  createCartItems,
  createStoreWithCart,
  jsonResponse,
  mockFetch,
} from '../../../../../test-utils/storeTestUtils';

const [backpack, bracelet] = createCartItems();

let alertSpy: jest.SpyInstance<void, Parameters<typeof Alert.alert>>;

beforeEach(() => {
  jest.useFakeTimers();
  // "Ver productos" goes back to the catalog, which requests /products.
  mockFetch().mockResolvedValue(jsonResponse(products));
  alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
});

afterEach(() => {
  alertSpy.mockRestore();
  jest.clearAllTimers();
  jest.useRealTimers();
});

async function renderCart(items = createCartItems()) {
  const { store } = await createStoreWithCart(items);
  renderWithNavigation(store, ['Cart']);
  return store;
}

/** Presses a button of the last Alert.alert, as the user would. */
function pressAlertButton(text: string) {
  const buttons: AlertButton[] = alertSpy.mock.lastCall?.[2] ?? [];
  const button = buttons.find(candidate => candidate.text === text);
  if (!button) {
    throw new Error(`Alert button "${text}" not found`);
  }
  // A cancel button has no onPress: the native alert just closes.
  act(() => button.onPress?.());
}

describe('CartScreen', () => {
  it('shows each line with unit price, subtotal and the cart totals', async () => {
    await renderCart();

    expect(screen.getByText('Mi carrito')).toBeOnTheScreen();
    expect(screen.getByText(backpack.title)).toBeOnTheScreen();
    expect(screen.getByText('$695.00 c/u')).toBeOnTheScreen();
    expect(screen.getByText('$1,390.00')).toBeOnTheScreen(); // bracelet ×2
    expect(screen.getByText('Productos: 3')).toBeOnTheScreen();
    expect(screen.getByText('$1,499.95')).toBeOnTheScreen();
  });

  it('increases and decreases a line and updates the totals', async () => {
    const store = await renderCart();

    fireEvent.press(screen.getAllByLabelText('Agregar uno')[0]);

    expect(screen.getAllByLabelText('Cantidad: 2')).toHaveLength(2);
    expect(screen.getByText('$219.90')).toBeOnTheScreen();
    expect(screen.getByText('Productos: 4')).toBeOnTheScreen();
    expect(screen.getByText('$1,609.90')).toBeOnTheScreen();

    fireEvent.press(screen.getAllByLabelText('Quitar uno')[1]); // bracelet 2 → 1

    expect(screen.getByText('Productos: 3')).toBeOnTheScreen();
    expect(screen.getByText('$914.90')).toBeOnTheScreen();
    expect(store.getState().cart.items.map(item => item.quantity)).toEqual([2, 1]);
  });

  it('asks before removing from the stepper at quantity 1 and keeps the item on cancel', async () => {
    const store = await renderCart();

    fireEvent.press(screen.getByLabelText('Eliminar producto'));

    expect(alertSpy).toHaveBeenCalledTimes(1);
    expect(alertSpy.mock.lastCall?.[0]).toBe('¿Eliminar este producto del carrito?');
    expect(alertSpy.mock.lastCall?.[1]).toBe(backpack.title);
    expect(store.getState().cart.items).toHaveLength(2);

    pressAlertButton('Cancelar');
    expect(store.getState().cart.items).toHaveLength(2);

    fireEvent.press(screen.getByLabelText('Eliminar producto'));
    pressAlertButton('Eliminar');

    expect(screen.queryByText(backpack.title)).toBeNull();
    expect(screen.getByText('Productos: 2')).toBeOnTheScreen();
    expect(screen.getAllByText('$1,390.00')).toHaveLength(2); // line subtotal and total
  });

  it('asks before removing from the row delete button at any quantity', async () => {
    const store = await renderCart();

    fireEvent.press(screen.getByLabelText(`Eliminar ${bracelet.title}`));
    expect(alertSpy.mock.lastCall?.[1]).toBe(bracelet.title);
    expect(store.getState().cart.items).toHaveLength(2);

    pressAlertButton('Eliminar');

    expect(store.getState().cart.items.map(item => item.id)).toEqual([backpack.id]);
    expect(screen.getByText('Productos: 1')).toBeOnTheScreen();
  });

  it('shows the empty state and goes back to the catalog', async () => {
    const { store } = await createStoreWithCart([]);
    renderWithNavigation(store, ['ProductList', 'Cart']);

    expect(screen.getByText('Tu carrito está vacío')).toBeOnTheScreen();
    expect(screen.queryByText('Ir a checkout')).toBeNull();

    fireEvent.press(screen.getByRole('button', { name: 'Ver productos' }));
    await act(() => jest.runOnlyPendingTimersAsync());

    expect(screen.queryByText('Mi carrito')).toBeNull();
  });

  it('opens checkout from the summary', async () => {
    await renderCart();

    fireEvent.press(screen.getByRole('button', { name: 'Ir a checkout' }));
    await act(() => jest.runOnlyPendingTimersAsync());

    expect(screen.getByText('Datos de contacto')).toBeOnTheScreen();
  });
});
