import { PersistedCartSchema, type CartItem } from '../cart/cart.schema';

const item: CartItem = {
  id: 1,
  title: 'Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops',
  priceInCents: 10995,
  image: 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_t.png',
  category: "men's clothing",
  quantity: 2,
};

function parseCart(items: unknown[], version: unknown = 1) {
  return PersistedCartSchema.safeParse({ version, items });
}

function parseCartWithoutVersion(items: unknown[]) {
  return PersistedCartSchema.safeParse({ items });
}

describe('PersistedCartSchema', () => {
  it('accepts a valid persisted cart, including an empty one', () => {
    expect(parseCart([item]).success).toBe(true);
    expect(parseCart([]).success).toBe(true);
  });

  it('accepts the quantity limits 1 and 99', () => {
    expect(parseCart([{ ...item, quantity: 1 }]).success).toBe(true);
    expect(parseCart([{ ...item, quantity: 99 }]).success).toBe(true);
  });

  it.each([
    ['quantity 0', { ...item, quantity: 0 }],
    ['quantity 100', { ...item, quantity: 100 }],
    ['decimal quantity', { ...item, quantity: 1.5 }],
    ['decimal priceInCents', { ...item, priceInCents: 109.95 }],
    ['missing image', { ...item, image: undefined }],
  ])('rejects %s', (_case, invalidItem) => {
    expect(parseCart([invalidItem]).success).toBe(false);
  });

  it('rejects another storage version', () => {
    expect(parseCart([item], 2).success).toBe(false);
    expect(parseCartWithoutVersion([item]).success).toBe(false);
  });

  it('rejects duplicated product ids', () => {
    expect(parseCart([item, { ...item, quantity: 1 }]).success).toBe(false);
  });
});
