import {
  ProductListSchema,
  ProductSchema,
  toCatalogProduct,
} from '../catalog/product.schema';
import products from './fixtures/products.json';

const [backpack] = products;

function omitField(field: keyof typeof backpack) {
  return Object.fromEntries(
    Object.entries(backpack).filter(([key]) => key !== field),
  );
}

describe('ProductSchema', () => {
  it('accepts the real API fixture', () => {
    expect(ProductListSchema.safeParse(products).success).toBe(true);
  });

  it('rejects a price sent as string', () => {
    const result = ProductSchema.safeParse({ ...backpack, price: '109.95' });
    expect(result.success).toBe(false);
  });

  it('rejects a product without title', () => {
    expect(ProductSchema.safeParse(omitField('title')).success).toBe(false);
  });

  it('rejects a product without rating', () => {
    expect(ProductSchema.safeParse(omitField('rating')).success).toBe(false);
  });

  it('rejects an image that is not a URL', () => {
    const result = ProductSchema.safeParse({ ...backpack, image: 'not-a-url' });
    expect(result.success).toBe(false);
  });

  it('rejects a list response that is not an array', () => {
    expect(ProductListSchema.safeParse({ products }).success).toBe(false);
    expect(ProductListSchema.safeParse(null).success).toBe(false);
  });

  it('rejects the list when a single product is invalid', () => {
    const list = [...products, { ...backpack, id: 'x' }];
    expect(ProductListSchema.safeParse(list).success).toBe(false);
  });

  it('strips unknown fields', () => {
    const result = ProductSchema.parse({ ...backpack, discount: 10 });
    expect(result).not.toHaveProperty('discount');
  });
});

describe('toCatalogProduct', () => {
  it('replaces price with integer priceInCents and keeps the rest', () => {
    const catalogProducts = ProductListSchema.parse(products).map(
      toCatalogProduct,
    );
    expect(catalogProducts.map(product => product.priceInCents)).toEqual([
      10995, 69500, 99999,
    ]);
    expect(catalogProducts[0]).not.toHaveProperty('price');
    expect(catalogProducts[1]).toMatchObject({
      id: 5,
      category: 'jewelery',
      rating: { rate: 4.6, count: 400 },
    });
  });
});
