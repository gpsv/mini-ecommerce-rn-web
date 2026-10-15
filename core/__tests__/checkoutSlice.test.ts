import type { CartItem } from '../cart/cart.schema';
import {
  selectCartItems,
  selectIsCartHydrated,
  selectTotalInCents,
} from '../cart/cart.selectors';
import { addItem, increaseQuantity } from '../cart/cartSlice';
import type { CheckoutContact } from '../checkout/checkout.schema';
import {
  confirmOrder,
  DEFAULT_CHECKOUT_DELAY_MS,
  generateOrderNumber,
  resetCheckout,
  selectCheckoutStatus,
  selectConfirmedOrder,
} from '../checkout/checkoutSlice';
import type { StorageAdapter } from '../shared/storage.types';
import { CART_STORAGE_KEY } from '../store/cartPersistence';
import {
  createAppStore,
  type AppStore,
  type AppStoreOptions,
} from '../store/createAppStore';

const backpack: Omit<CartItem, 'quantity'> = {
  id: 1,
  title: 'Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops',
  priceInCents: 10995,
  image: 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_t.png',
  category: "men's clothing",
};

const contact: CheckoutContact = {
  name: 'María López',
  email: 'maria.lopez@correo.com',
  phone: '4431234567',
};

function createStorage() {
  const values = new Map<string, string>();
  const storage: StorageAdapter = {
    getItem: async key => values.get(key) ?? null,
    setItem: async (key, value) => {
      values.set(key, value);
    },
    removeItem: async key => {
      values.delete(key);
    },
  };
  return { storage, values };
}

async function createHydratedStore(options: AppStoreOptions = {}) {
  const { storage, values } = createStorage();
  const store = createAppStore(storage, {
    checkout: { generateOrderNumber: () => 'MS-12345' },
    ...options,
  });
  await new Promise<void>(resolve => {
    const unsubscribe = store.subscribe(() => {
      if (selectIsCartHydrated(store.getState())) {
        unsubscribe();
        resolve();
      }
    });
  });
  return { store, values };
}

function addBackpacks(store: AppStore, quantity: number) {
  store.dispatch(addItem(backpack));
  for (let i = 1; i < quantity; i++) {
    store.dispatch(increaseQuantity(backpack.id));
  }
}

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('confirmOrder', () => {
  it('goes idle → processing → confirmed after the delay and clears the cart', async () => {
    const { store, values } = await createHydratedStore();
    addBackpacks(store, 3);
    expect(selectCheckoutStatus(store.getState())).toBe('idle');

    const confirmation = store.dispatch(confirmOrder(contact));
    expect(selectCheckoutStatus(store.getState())).toBe('processing');

    await jest.advanceTimersByTimeAsync(DEFAULT_CHECKOUT_DELAY_MS - 1);
    expect(selectCheckoutStatus(store.getState())).toBe('processing');
    expect(selectCartItems(store.getState())).toHaveLength(1);

    await jest.advanceTimersByTimeAsync(1);
    await confirmation;

    expect(selectCheckoutStatus(store.getState())).toBe('confirmed');
    expect(selectConfirmedOrder(store.getState())).toEqual({
      orderNumber: 'MS-12345',
      contact,
      totalItems: 3,
      totalInCents: 32985,
    });
    expect(selectCartItems(store.getState())).toEqual([]);
    expect(selectTotalInCents(store.getState())).toBe(0);
    expect(JSON.parse(values.get(CART_STORAGE_KEY) ?? 'null')).toEqual({
      version: 1,
      items: [],
    });
  });

  it('uses the injected delay', async () => {
    const { store } = await createHydratedStore({ checkout: { delayMs: 10 } });
    addBackpacks(store, 1);

    const confirmation = store.dispatch(confirmOrder(contact));
    await jest.advanceTimersByTimeAsync(10);
    await confirmation;

    expect(selectCheckoutStatus(store.getState())).toBe('confirmed');
  });

  it('does not run with an empty cart', async () => {
    const { store } = await createHydratedStore();

    const result = await store.dispatch(confirmOrder(contact));

    expect(confirmOrder.rejected.match(result) && result.meta.condition).toBe(
      true,
    );
    expect(selectCheckoutStatus(store.getState())).toBe('idle');
  });

  it('ignores a second confirmation while processing', async () => {
    const { store } = await createHydratedStore();
    addBackpacks(store, 1);

    const first = store.dispatch(confirmOrder(contact));
    const second = await store.dispatch(confirmOrder(contact));
    expect(confirmOrder.rejected.match(second) && second.meta.condition).toBe(
      true,
    );

    await jest.advanceTimersByTimeAsync(DEFAULT_CHECKOUT_DELAY_MS);
    await first;
    expect(selectConfirmedOrder(store.getState())?.totalItems).toBe(1);
  });

  it('rejects an invalid contact, returns to idle and keeps the cart', async () => {
    const { store } = await createHydratedStore();
    addBackpacks(store, 2);

    const result = await store.dispatch(
      confirmOrder({ ...contact, phone: '443-123-4567' }),
    );

    expect(confirmOrder.rejected.match(result)).toBe(true);
    expect(selectCheckoutStatus(store.getState())).toBe('idle');
    expect(selectCartItems(store.getState())[0].quantity).toBe(2);
  });

  it('resetCheckout returns to idle without a confirmed order', async () => {
    const { store } = await createHydratedStore();
    addBackpacks(store, 1);
    const confirmation = store.dispatch(confirmOrder(contact));
    await jest.advanceTimersByTimeAsync(DEFAULT_CHECKOUT_DELAY_MS);
    await confirmation;

    store.dispatch(resetCheckout());

    expect(selectCheckoutStatus(store.getState())).toBe('idle');
    expect(selectConfirmedOrder(store.getState())).toBeNull();
  });
});

describe('generateOrderNumber', () => {
  it('builds "MS-" plus 5 digits', () => {
    expect(generateOrderNumber(() => 0)).toBe('MS-10000');
    expect(generateOrderNumber(() => 0.999999)).toBe('MS-99999');
    expect(generateOrderNumber()).toMatch(/^MS-\d{5}$/);
  });
});
