import type { CatalogProduct } from './product.schema';

export interface ProductFilters {
  /** null or undefined means every category. */
  category?: string | null;
  query?: string;
}

const DIACRITICS = /[̀-ͯ]/g;

/** Lowercase, trimmed and without accents: "  Electrónica " → "electronica". */
function normalizeText(text: string): string {
  return text.normalize('NFD').replace(DIACRITICS, '').toLowerCase().trim();
}

/** Categories derived from the loaded products (no /products/categories call), in order of appearance. */
export function selectCategories(products: readonly CatalogProduct[]): string[] {
  return [...new Set(products.map(product => product.category))];
}

/** Client-side filter by category and title search, ignoring case and accents. */
export function filterProducts(
  products: readonly CatalogProduct[],
  { category, query = '' }: ProductFilters,
): CatalogProduct[] {
  const normalizedQuery = normalizeText(query);
  return products.filter(
    product =>
      (category == null || product.category === category) &&
      (normalizedQuery === '' ||
        normalizeText(product.title).includes(normalizedQuery)),
  );
}
