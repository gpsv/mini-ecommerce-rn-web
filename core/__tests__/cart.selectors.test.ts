import {
  selectCartItems,
  selectIsCartHydrated,
  selectTotalInCents,
  selectTotalItems,
} from '../cart/cart.selectors';
import type { CartItem } from '../cart/cart.schema';
import type { CartState } from '../cart/cartSlice';

const backpack: CartItem = {
  id: 1,
  title: 'Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops',
  priceInCents: 10995,
  image: 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_t.png',
  category: "men's clothing",
  quantity: 2,
};

const ring: CartItem = {
  id: 7,
  title: 'White Gold Plated Princess',
  priceInCents: 999,
  image: 'https://fakestoreapi.com/img/71YAIFU48IL._AC_UL640_QL65_ML3_t.png',
  category: 'jewelery',
  quantity: 3,
};

function createState(items: CartItem[], isHydrated = true): { cart: CartState } {
  return { cart: { items, isHydrated } };
}

describe('cart selectors', () => {
  it('returns zero totals for an empty cart', () => {
    const state = createState([]);
    expect(selectCartItems(state)).toEqual([]);
    expect(selectTotalItems(state)).toBe(0);
    expect(selectTotalInCents(state)).toBe(0);
  });

  it('sums quantities and line totals in cents', () => {
    const state = createState([backpack, ring]);
    expect(selectTotalItems(state)).toBe(5);
    // 2 × 10995 + 3 × 999
    expect(selectTotalInCents(state)).toBe(24987);
  });

  it('exposes the hydration flag', () => {
    expect(selectIsCartHydrated(createState([], false))).toBe(false);
    expect(selectIsCartHydrated(createState([]))).toBe(true);
  });

  it('memoizes totals while the items array does not change', () => {
    const items = [backpack, ring];
    const first = createState(items);
    const second = createState(items);
    selectTotalInCents.resetRecomputations();
    selectTotalInCents(first);
    selectTotalInCents(second);
    expect(selectTotalInCents.recomputations()).toBe(1);

    selectTotalInCents(createState([backpack]));
    expect(selectTotalInCents.recomputations()).toBe(2);
  });
});
