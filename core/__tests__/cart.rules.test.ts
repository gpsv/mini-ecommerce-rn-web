import {
  addItem,
  clearCart,
  decreaseQuantity,
  increaseQuantity,
  removeItem,
} from '../cart/cart.rules';
import {
  MAX_QUANTITY,
  MIN_QUANTITY,
  type CartItem,
  type CartProductSnapshot,
} from '../cart/cart.schema';

const backpack: CartProductSnapshot = {
  id: 1,
  title: 'Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops',
  priceInCents: 10995,
  image: 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_t.png',
  category: "men's clothing",
};

const bracelet: CartProductSnapshot = {
  id: 5,
  title: "John Hardy Women's Legends Naga Gold & Silver Dragon Station Chain Bracelet",
  priceInCents: 69500,
  image: 'https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_QL65_ML3_t.png',
  category: 'jewelery',
};

function withQuantity(product: CartProductSnapshot, quantity: number): CartItem {
  return { ...product, quantity };
}

describe('addItem', () => {
  it('adds a new product with quantity 1', () => {
    expect(addItem([], backpack)).toEqual([withQuantity(backpack, 1)]);
  });

  it('keeps only the snapshot fields of a full catalog product', () => {
    const catalogProduct = {
      ...backpack,
      description: 'Your perfect pack',
      rating: { rate: 3.9, count: 120 },
    };
    expect(addItem([], catalogProduct)).toEqual([withQuantity(backpack, 1)]);
  });

  it('adds 1 when the product is already in the cart', () => {
    const items = [withQuantity(backpack, 2), withQuantity(bracelet, 1)];
    expect(addItem(items, backpack)).toEqual([
      withQuantity(backpack, 3),
      withQuantity(bracelet, 1),
    ]);
  });

  it('does not go over the maximum and keeps the same array', () => {
    const items = [withQuantity(backpack, MAX_QUANTITY)];
    expect(addItem(items, backpack)).toBe(items);
  });

  it('does not mutate the original array', () => {
    const items = [withQuantity(backpack, 1)];
    const snapshot = items.map(item => ({ ...item }));
    addItem(items, backpack);
    addItem(items, bracelet);
    expect(items).toEqual(snapshot);
  });
});

describe('increaseQuantity', () => {
  it('adds 1 to the given product only', () => {
    const items = [withQuantity(backpack, 1), withQuantity(bracelet, 1)];
    expect(increaseQuantity(items, backpack.id)).toEqual([
      withQuantity(backpack, 2),
      withQuantity(bracelet, 1),
    ]);
  });

  it('stops at 99, returning the same array when already at the limit', () => {
    expect(increaseQuantity([withQuantity(backpack, 98)], backpack.id)).toEqual([
      withQuantity(backpack, 99),
    ]);
    const atLimit = [withQuantity(backpack, 99)];
    expect(increaseQuantity(atLimit, backpack.id)).toBe(atLimit);
  });

  it('returns the same array for an unknown product id', () => {
    const items = [withQuantity(backpack, 1)];
    expect(increaseQuantity(items, 999)).toBe(items);
  });
});

describe('decreaseQuantity', () => {
  it('subtracts 1', () => {
    expect(decreaseQuantity([withQuantity(backpack, 3)], backpack.id)).toEqual([
      withQuantity(backpack, 2),
    ]);
  });

  it('never goes below 1 (removing is explicit)', () => {
    expect(decreaseQuantity([withQuantity(backpack, 2)], backpack.id)).toEqual([
      withQuantity(backpack, MIN_QUANTITY),
    ]);
    const atMinimum = [withQuantity(backpack, MIN_QUANTITY)];
    expect(decreaseQuantity(atMinimum, backpack.id)).toBe(atMinimum);
  });

  it('returns the same array for an unknown product id', () => {
    const items = [withQuantity(backpack, 2)];
    expect(decreaseQuantity(items, 999)).toBe(items);
  });

  it('does not mutate the original array', () => {
    const items = [withQuantity(backpack, 3)];
    decreaseQuantity(items, backpack.id);
    expect(items).toEqual([withQuantity(backpack, 3)]);
  });
});

describe('removeItem', () => {
  it('removes the product at any quantity', () => {
    const items = [withQuantity(backpack, 7), withQuantity(bracelet, 1)];
    expect(removeItem(items, backpack.id)).toEqual([withQuantity(bracelet, 1)]);
  });

  it('returns the same array for an unknown product id', () => {
    const items = [withQuantity(backpack, 1)];
    expect(removeItem(items, 999)).toBe(items);
  });
});

describe('clearCart', () => {
  it('returns an empty cart', () => {
    expect(clearCart()).toEqual([]);
  });
});
