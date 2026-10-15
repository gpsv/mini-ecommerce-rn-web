import { useCallback, useMemo, useState } from 'react';
import { useDebouncedValue } from '../../shared/hooks/useDebouncedValue';
import { filterProducts, selectCategories } from '../catalog.selectors';
import { useGetProductsQuery } from '../catalogApi';
import { getCategoryLabel, type CategoryOption } from '../categoryLabels';
import type { CatalogProduct } from '../product.schema';
import { usePaginatedProducts } from './usePaginatedProducts';

export type ListingStatus = 'loading' | 'error' | 'success';

/** What the user filters by. searchText is what they type; the list uses its debounced value. */
export interface ListingFilters {
  searchText: string;
  /** null means "Todas". */
  category: string | null;
}

/**
 * Lets the platform own the filters (web keeps them in the URL). Without it
 * the hook keeps them in its own state (mobile). Every change sends the full
 * filters, so two changes never overwrite each other.
 */
export interface ControlledListingFilters {
  filters: ListingFilters;
  setFilters: (filters: ListingFilters) => void;
}

const NO_PRODUCTS: readonly CatalogProduct[] = [];
const EMPTY_FILTERS: ListingFilters = { searchText: '', category: null };

/**
 * Everything the catalog screen needs: one cached getProducts request (D17),
 * categories derived from it, client-side filter + debounced search, and pages of 8.
 */
export function useProductListing(controlled?: ControlledListingFilters) {
  const [internalFilters, setInternalFilters] = useState(EMPTY_FILTERS);
  const filters = controlled?.filters ?? internalFilters;
  const setFilters = controlled?.setFilters ?? setInternalFilters;
  const { searchText, category } = filters;
  const query = useDebouncedValue(searchText);

  const { data, isLoading, isError, refetch } = useGetProductsQuery();
  const products = data ?? NO_PRODUCTS;

  const categoryOptions = useMemo<CategoryOption[]>(
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

  const setSearchText = useCallback(
    (text: string) => setFilters({ searchText: text, category }),
    [setFilters, category],
  );
  const setCategory = useCallback(
    (value: string | null) => setFilters({ searchText, category: value }),
    [setFilters, searchText],
  );
  const clearFilters = useCallback(() => setFilters(EMPTY_FILTERS), [setFilters]);
  const clearSearch = useCallback(
    () => setFilters({ searchText: '', category }),
    [setFilters, category],
  );

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
