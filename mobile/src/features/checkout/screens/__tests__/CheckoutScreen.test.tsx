import { act, fireEvent, screen } from '@testing-library/react-native';
import { clearCart } from '@core/cart/cartSlice';
import type { CheckoutContact } from '@core/checkout/checkout.schema';
import { confirmOrder } from '@core/checkout/checkoutSlice';
import { renderWithNavigation } from '../../../../../test-utils/navigationTestUtils';
import {
  createCartItems,
  createStoreWithCart,
} from '../../../../../test-utils/storeTestUtils';

const VALID_CONTACT: CheckoutContact = {
  name: 'María López',
  email: 'maria.lopez@correo.com',
  phone: '4431234567',
};

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});

async function renderCheckout() {
  const { store } = await createStoreWithCart(createCartItems());
  renderWithNavigation(store, ['Checkout']);
  return store;
}

function fillContact(contact: CheckoutContact) {
  fireEvent.changeText(screen.getByLabelText('Nombre'), contact.name);
  fireEvent.changeText(screen.getByLabelText('Correo'), contact.email);
  fireEvent.changeText(screen.getByLabelText('Teléfono'), contact.phone);
}

/** handleSubmit validates asynchronously. */
async function pressConfirm() {
  fireEvent.press(screen.getByRole('button', { name: 'Confirmar compra' }));
  await act(async () => {});
}

describe('CheckoutScreen', () => {
  it('shows the order summary from the cart', async () => {
    await renderCheckout();

    expect(screen.getByText('Resumen del pedido')).toBeOnTheScreen();
    expect(screen.getByText('$1,390.00')).toBeOnTheScreen(); // bracelet ×2 line
    expect(screen.getByText('3')).toBeOnTheScreen();
    expect(screen.getByText('$1,499.95')).toBeOnTheScreen();
  });

  it('shows every schema error when submitting an empty form', async () => {
    const store = await renderCheckout();

    await pressConfirm();

    expect(screen.getByText('Ingresa tu nombre')).toBeOnTheScreen();
    expect(screen.getByText('Ingresa un correo válido')).toBeOnTheScreen();
    expect(screen.getByText('Ingresa 10 dígitos, sin espacios ni guiones')).toBeOnTheScreen();
    expect(store.getState().checkout.status).toBe('idle');
  });

  it('rejects an invalid email and a short phone', async () => {
    const store = await renderCheckout();

    fillContact({ ...VALID_CONTACT, email: 'maria.lopez@correo', phone: '44312345' });
    await pressConfirm();

    expect(screen.queryByText('Ingresa tu nombre')).toBeNull();
    expect(screen.getByText('Ingresa un correo válido')).toBeOnTheScreen();
    expect(screen.getByText('Ingresa 10 dígitos, sin espacios ni guiones')).toBeOnTheScreen();
    expect(store.getState().checkout.status).toBe('idle');
  });

  it('clears an error once the field is fixed', async () => {
    await renderCheckout();

    fillContact({ ...VALID_CONTACT, email: 'maria.lopez@correo' });
    await pressConfirm();
    expect(screen.getByText('Ingresa un correo válido')).toBeOnTheScreen();

    fireEvent.changeText(screen.getByLabelText('Correo'), VALID_CONTACT.email);
    await act(async () => {});

    expect(screen.queryByText('Ingresa un correo válido')).toBeNull();
  });

  it('confirms a valid contact and shows the processing state', async () => {
    const store = await renderCheckout();

    fillContact(VALID_CONTACT);
    await pressConfirm();

    expect(store.getState().checkout.status).toBe('processing');
    const processingButton = screen.getByRole('button', { name: 'Procesando…' });
    expect(processingButton).toBeDisabled();
    expect(screen.getByLabelText('Nombre')).toHaveProp('editable', false);
    expect(screen.getByLabelText('Regresar')).toBeDisabled();
  });

  it('keeps the summary and "Procesando…" while the cart is cleared before navigating', async () => {
    const store = await renderCheckout();

    // The thunk's steps by hand, without its navigation: the in-between state stays visible.
    act(() => {
      store.dispatch(confirmOrder.pending('request', VALID_CONTACT));
    });
    act(() => {
      store.dispatch(clearCart());
    });
    act(() => {
      store.dispatch(
        confirmOrder.fulfilled(
          {
            orderNumber: 'MS-12345',
            contact: VALID_CONTACT,
            totalItems: 3,
            totalInCents: 149995,
          },
          'request',
          VALID_CONTACT,
        ),
      );
    });

    expect(store.getState().cart.items).toHaveLength(0);
    expect(store.getState().checkout.status).toBe('confirmed');
    expect(screen.getByText('3')).toBeOnTheScreen();
    expect(screen.getByText('$1,499.95')).toBeOnTheScreen();
    expect(screen.queryByText('$0.00')).toBeNull();
    expect(screen.getByRole('button', { name: 'Procesando…' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Confirmar compra' })).toBeNull();
  });
});
