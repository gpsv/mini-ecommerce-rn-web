import { useCallback, useMemo, useState } from 'react';
import { filterProducts, selectCategories } from '@core/catalog/catalog.selectors';
import { useGetProductsQuery } from '@core/catalog/catalogApi';
import { getCategoryLabel } from '@core/catalog/categoryLabels';
import type { CatalogProduct } from '@core/catalog/product.schema';
import type { CategoryChipOption } from '../../../shared/components/molecules/CategoryChips';
import { useDebouncedValue } from '../../../shared/hooks/useDebouncedValue';
import { usePaginatedProducts } from './usePaginatedProducts';

export type ListingStatus = 'loading' | 'error' | 'success';

const NO_PRODUCTS: readonly CatalogProduct[] = [];

/**
 * Everything the catalog screen needs: one cached getProducts request (D17),
 * categories derived from it, client-side filter + debounced search, and pages of 8.
 */
export function useProductListing() {
  const [searchText, setSearchText] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const query = useDebouncedValue(searchText);

  const { data, isLoading, isError, refetch } = useGetProductsQuery();
  const products = data ?? NO_PRODUCTS;

  const categoryOptions = useMemo<CategoryChipOption[]>(
    () =>
      selectCategories(products).map(value => ({
        value,
        label: getCategoryLabel(value),
      })),
    [products],
  );

  const filteredProducts = useMemo(
    () => filterProducts(products, { category, query }),
    [products, category, query],
  );

  const { visibleItems, hasMore, loadMore } = usePaginatedProducts(filteredProducts);

  const clearFilters = useCallback(() => {
    setSearchText('');
    setCategory(null);
  }, []);

  const clearSearch = useCallback(() => setSearchText(''), []);

  let status: ListingStatus = 'success';
  if (isLoading) {
    status = 'loading';
  } else if (isError && data === undefined) {
    status = 'error';
  }

  return {
    status,
    retry: refetch,
    searchText,
    setSearchText,
    clearSearch,
    /** Debounced: what the list is actually filtered by. */
    query,
    category,
    setCategory,
    clearFilters,
    categoryOptions,
    totalCount: filteredProducts.length,
    visibleProducts: visibleItems,
    hasMore,
    loadMore,
  };
}
