import type { CartItem } from '../cart/cart.schema';
import { selectCartItems, selectIsCartHydrated } from '../cart/cart.selectors';
import { addItem, decreaseQuantity, increaseQuantity } from '../cart/cartSlice';
import { resetCheckout } from '../checkout/checkoutSlice';
import type { StorageAdapter } from '../shared/storage.types';
import { CART_STORAGE_KEY } from '../store/cartPersistence';
import { createAppStore, type AppStore } from '../store/createAppStore';

const backpack: CartItem = {
  id: 1,
  title: 'Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops',
  priceInCents: 10995,
  image: 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_t.png',
  category: "men's clothing",
  quantity: 2,
};

function createMemoryStorage(initialValue: string | null = null) {
  const values = new Map<string, string>();
  if (initialValue !== null) {
    values.set(CART_STORAGE_KEY, initialValue);
  }
  const storage = {
    getItem: jest.fn(async (key: string) => values.get(key) ?? null),
    setItem: jest.fn(async (key: string, value: string) => {
      values.set(key, value);
    }),
    removeItem: jest.fn(async (key: string) => {
      values.delete(key);
    }),
  } satisfies StorageAdapter;
  return { storage, values };
}

function waitForHydration(store: AppStore): Promise<void> {
  return new Promise(resolve => {
    if (selectIsCartHydrated(store.getState())) {
      resolve();
      return;
    }
    const unsubscribe = store.subscribe(() => {
      if (selectIsCartHydrated(store.getState())) {
        unsubscribe();
        resolve();
      }
    });
  });
}

/** Lets the async listener effects (storage writes) finish. */
function flushEffects(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0));
}

let warnSpy: jest.SpyInstance;

beforeEach(() => {
  warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  warnSpy.mockRestore();
});

describe('cart rehydration', () => {
  it('restores a valid stored cart', async () => {
    const { storage } = createMemoryStorage(
      JSON.stringify({ version: 1, items: [backpack] }),
    );
    const store = createAppStore(storage, { isDevelopment: true });
    expect(selectIsCartHydrated(store.getState())).toBe(false);

    await waitForHydration(store);

    expect(selectCartItems(store.getState())).toEqual([backpack]);
    expect(storage.removeItem).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('starts empty when nothing is stored', async () => {
    const { storage } = createMemoryStorage();
    const store = createAppStore(storage, { isDevelopment: true });
    await waitForHydration(store);

    expect(selectCartItems(store.getState())).toEqual([]);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it.each([
    ['broken JSON', '{"version":1,"items":['],
    ['an invalid shape', JSON.stringify({ version: 1, items: [{ id: 1 }] })],
    ['a quantity over 99', JSON.stringify({ version: 1, items: [{ ...backpack, quantity: 100 }] })],
    ['another version', JSON.stringify({ version: 2, items: [backpack] })],
    ['a value that is not an object', '"cart"'],
  ])('discards %s, removes the key and warns in development', async (_case, stored) => {
    const { storage, values } = createMemoryStorage(stored);
    const store = createAppStore(storage, { isDevelopment: true });
    await waitForHydration(store);
    await flushEffects();

    expect(selectCartItems(store.getState())).toEqual([]);
    expect(storage.removeItem).toHaveBeenCalledWith(CART_STORAGE_KEY);
    expect(values.has(CART_STORAGE_KEY)).toBe(false);
    expect(warnSpy).toHaveBeenCalledWith(
      '[cartPersistence] Discarding invalid stored cart.',
      expect.anything(),
    );
  });

  it('does not warn outside development', async () => {
    const { storage } = createMemoryStorage('not json');
    const store = createAppStore(storage, { isDevelopment: false });
    await waitForHydration(store);

    expect(selectCartItems(store.getState())).toEqual([]);
    expect(storage.removeItem).toHaveBeenCalledWith(CART_STORAGE_KEY);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('starts empty when reading the storage fails', async () => {
    const { storage } = createMemoryStorage();
    storage.getItem.mockRejectedValueOnce(new Error('disk error'));
    const store = createAppStore(storage, { isDevelopment: true });
    await waitForHydration(store);

    expect(selectCartItems(store.getState())).toEqual([]);
    expect(warnSpy).toHaveBeenCalledWith(
      '[cartPersistence] Could not read the stored cart.',
      expect.any(Error),
    );
  });
});

describe('cart saving', () => {
  it('saves the versioned cart whenever its items change', async () => {
    const { storage, values } = createMemoryStorage();
    const store = createAppStore(storage);
    await waitForHydration(store);

    store.dispatch(addItem(backpack));
    store.dispatch(increaseQuantity(backpack.id));
    await flushEffects();

    expect(storage.setItem).toHaveBeenCalledTimes(2);
    expect(JSON.parse(values.get(CART_STORAGE_KEY) ?? 'null')).toEqual({
      version: 1,
      items: [{ ...backpack, quantity: 2 }],
    });
  });

  it('does not save after hydration or when an action leaves the cart unchanged', async () => {
    const { storage } = createMemoryStorage(
      JSON.stringify({ version: 1, items: [backpack] }),
    );
    const store = createAppStore(storage);
    await waitForHydration(store);

    store.dispatch(resetCheckout());
    store.dispatch(increaseQuantity(999));
    store.dispatch(increaseQuantity(backpack.id));
    store.dispatch(decreaseQuantity(backpack.id));
    store.dispatch(decreaseQuantity(backpack.id));
    store.dispatch(decreaseQuantity(backpack.id));
    await flushEffects();
    // 2 → 3 → 2 → 1 saves three times; the extra decrease at 1 changes nothing.
    expect(storage.setItem).toHaveBeenCalledTimes(3);
    storage.setItem.mockClear();
    store.dispatch(decreaseQuantity(backpack.id));
    await flushEffects();

    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it('does not save before the stored cart has been read', async () => {
    const { storage } = createMemoryStorage(
      JSON.stringify({ version: 1, items: [backpack] }),
    );
    let finishReading: (value: string | null) => void = () => {};
    storage.getItem.mockImplementationOnce(
      () => new Promise(resolve => (finishReading = resolve)),
    );
    const store = createAppStore(storage);

    store.dispatch(addItem(backpack));
    await flushEffects();
    expect(storage.setItem).not.toHaveBeenCalled();

    finishReading(JSON.stringify({ version: 1, items: [backpack] }));
    await waitForHydration(store);
    await flushEffects();

    expect(selectCartItems(store.getState())).toEqual([backpack]);
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it('keeps working when saving fails', async () => {
    const { storage } = createMemoryStorage();
    storage.setItem.mockRejectedValueOnce(new Error('quota exceeded'));
    const store = createAppStore(storage, { isDevelopment: true });
    await waitForHydration(store);

    store.dispatch(addItem(backpack));
    await flushEffects();

    expect(selectCartItems(store.getState())).toEqual([
      { ...backpack, quantity: 1 },
    ]);
    expect(warnSpy).toHaveBeenCalledWith(
      '[cartPersistence] Could not save the cart.',
      expect.any(Error),
    );
  });
});
