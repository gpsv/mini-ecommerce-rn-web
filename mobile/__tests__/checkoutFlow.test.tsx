import { BackHandler } from 'react-native';
import { act, fireEvent, screen } from '@testing-library/react-native';
import products from '@core/__tests__/fixtures/products.json';
import { CART_STORAGE_KEY } from '@core/store/cartPersistence';
import type { AppStore } from '@core/store/createAppStore';
import { renderWithNavigation } from '../test-utils/navigationTestUtils';
import {
  createCartItems,
  createStoreWithCart,
  jsonResponse,
  mockFetch,
  type MemoryStorage,
} from '../test-utils/storeTestUtils';

type BackPressHandler = Parameters<typeof BackHandler.addEventListener>[1];

const BACK_PRESS_EVENT = { type: 'hardwareBackPress', timeStamp: 0 };

let backHandlers: BackPressHandler[];
let generateOrderNumber: jest.Mock<string, []>;

beforeEach(() => {
  jest.useFakeTimers();
  mockFetch().mockResolvedValue(jsonResponse(products));
  generateOrderNumber = jest.fn(() => 'MS-12345');

  // Jest runs as iOS, where BackHandler does nothing: emulate Android's
  // dispatch (newest listener first, stop at the first that returns true).
  backHandlers = [];
  jest.spyOn(BackHandler, 'addEventListener').mockImplementation((_event, handler) => {
    backHandlers.push(handler);
    return {
      remove: () => {
        backHandlers = backHandlers.filter(candidate => candidate !== handler);
      },
    };
  });
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.clearAllTimers();
  jest.useRealTimers();
});

function pressHardwareBack() {
  act(() => {
    [...backHandlers].reverse().some(handler => handler(BACK_PRESS_EVENT) === true);
  });
}

async function renderAtCheckout(): Promise<{ store: AppStore; storage: MemoryStorage }> {
  const result = await createStoreWithCart(createCartItems(), {
    checkout: { generateOrderNumber },
  });
  renderWithNavigation(result.store, ['ProductList', 'Cart', 'Checkout']);
  await act(() => jest.runOnlyPendingTimersAsync());
  return result;
}

async function submitValidContact() {
  fireEvent.changeText(screen.getByLabelText('Nombre'), 'María López');
  fireEvent.changeText(screen.getByLabelText('Correo'), 'maria.lopez@correo.com');
  fireEvent.changeText(screen.getByLabelText('Teléfono'), '4431234567');
  fireEvent.press(screen.getByRole('button', { name: 'Confirmar compra' }));
  await act(async () => {});
}

function getStoredItems(storage: MemoryStorage): unknown {
  const [key, value] = storage.setItem.mock.lastCall ?? [];
  expect(key).toBe(CART_STORAGE_KEY);
  return JSON.parse(value ?? 'null').items;
}

describe('checkout flow', () => {
  it('confirms once, blocks back while processing and ends with an empty persisted cart', async () => {
    const { store, storage } = await renderAtCheckout();

    await submitValidContact();

    // Processing: button busy, second submit (keyboard "done") ignored, back blocked.
    expect(screen.getByRole('button', { name: 'Procesando…' })).toBeDisabled();
    fireEvent(screen.getByLabelText('Teléfono'), 'submitEditing');
    await act(async () => {});
    pressHardwareBack();
    expect(screen.getByText('Datos de contacto')).toBeOnTheScreen();
    expect(store.getState().cart.items).toHaveLength(2);

    await act(() => jest.advanceTimersByTimeAsync(1500));

    expect(generateOrderNumber).toHaveBeenCalledTimes(1);
    expect(screen.getByText('¡Compra confirmada!')).toBeOnTheScreen();
    expect(screen.getByText('#MS-12345')).toBeOnTheScreen();
    expect(
      screen.getByText(
        'Gracias, María. Te enviamos el detalle de tu pedido a maria.lopez@correo.com.',
      ),
    ).toBeOnTheScreen();
    expect(screen.getByText('3')).toBeOnTheScreen();
    expect(screen.getByText('$1,499.95')).toBeOnTheScreen();
    expect(screen.queryByText('Datos de contacto')).toBeNull();

    expect(store.getState().cart.items).toEqual([]);
    expect(getStoredItems(storage)).toEqual([]);
  });

  it('goes back from the confirmation to the catalog, never to checkout', async () => {
    const { store } = await renderAtCheckout();
    await submitValidContact();
    await act(() => jest.advanceTimersByTimeAsync(1500));

    pressHardwareBack();
    await act(() => jest.runOnlyPendingTimersAsync());

    expect(screen.queryByText('¡Compra confirmada!')).toBeNull();
    expect(screen.queryByText('Datos de contacto')).toBeNull();
    expect(screen.queryByText('Mi carrito')).toBeNull();
    expect(screen.getByText('Mi Surtido')).toBeOnTheScreen();
    expect(store.getState().checkout).toEqual({ status: 'idle', confirmedOrder: null });
  });

  it('"Volver al catálogo" resets the stack to the catalog', async () => {
    const { store } = await renderAtCheckout();
    await submitValidContact();
    await act(() => jest.advanceTimersByTimeAsync(1500));

    fireEvent.press(screen.getByRole('button', { name: 'Volver al catálogo' }));
    await act(() => jest.runOnlyPendingTimersAsync());

    expect(screen.queryByText('¡Compra confirmada!')).toBeNull();
    expect(screen.getByText('Mi Surtido')).toBeOnTheScreen();
    expect(store.getState().checkout.confirmedOrder).toBeNull();

    // Nothing left to go back to: the navigator does not handle the press.
    const isHandled = backHandlers.some(handler => handler(BACK_PRESS_EVENT) === true);
    expect(isHandled).toBe(false);
  });
});
