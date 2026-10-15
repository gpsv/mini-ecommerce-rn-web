import { filterProducts, selectCategories } from '../catalog/catalog.selectors';
import {
  ProductListSchema,
  toCatalogProduct,
  type CatalogProduct,
} from '../catalog/product.schema';
import products from './fixtures/products.json';

const apiProducts = ProductListSchema.parse(products).map(toCatalogProduct);
const [backpack, bracelet, monitor] = apiProducts;

// Accented titles do not exist in the API; these make the accent cases explicit.
const accentedProduct: CatalogProduct = {
  ...monitor,
  id: 101,
  title: 'Audífonos inalámbricos',
};
const catalog = [...apiProducts, accentedProduct];

describe('selectCategories', () => {
  it('derives unique categories in order of appearance', () => {
    expect(selectCategories(catalog)).toEqual([
      "men's clothing",
      'jewelery',
      'electronics',
    ]);
  });

  it('returns an empty list without products', () => {
    expect(selectCategories([])).toEqual([]);
  });
});

describe('filterProducts', () => {
  it('returns everything without filters, or with a blank query', () => {
    expect(filterProducts(catalog, {})).toEqual(catalog);
    expect(filterProducts(catalog, { category: null, query: '   ' })).toEqual(
      catalog,
    );
  });

  it('filters by category keeping the raw API value', () => {
    expect(filterProducts(catalog, { category: 'jewelery' })).toEqual([bracelet]);
    expect(filterProducts(catalog, { category: 'electronics' })).toEqual([
      monitor,
      accentedProduct,
    ]);
  });

  it('searches the title ignoring case', () => {
    expect(filterProducts(catalog, { query: 'BACKPACK' })).toEqual([backpack]);
    expect(filterProducts(catalog, { query: 'fjallRAVEN' })).toEqual([backpack]);
  });

  it('ignores accents in both the query and the title', () => {
    expect(filterProducts(catalog, { query: 'audifonos' })).toEqual([
      accentedProduct,
    ]);
    expect(filterProducts(catalog, { query: 'INALÁMBRICOS' })).toEqual([
      accentedProduct,
    ]);
    expect(filterProducts(catalog, { query: 'drágon' })).toEqual([bracelet]);
  });

  it('trims the query', () => {
    expect(filterProducts(catalog, { query: '  backpack  ' })).toEqual([
      backpack,
    ]);
  });

  it('combines category and query', () => {
    expect(
      filterProducts(catalog, { category: 'electronics', query: 'audífonos' }),
    ).toEqual([accentedProduct]);
    expect(
      filterProducts(catalog, { category: 'jewelery', query: 'audífonos' }),
    ).toEqual([]);
  });

  it('returns an empty list when nothing matches or the category has no products', () => {
    expect(filterProducts(catalog, { query: 'zapatos' })).toEqual([]);
    expect(filterProducts(catalog, { category: "women's clothing" })).toEqual([]);
  });
});
