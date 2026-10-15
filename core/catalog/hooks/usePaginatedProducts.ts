import { useCallback, useMemo, useState } from 'react';

export const PAGE_SIZE = 8;

export interface PaginatedItems<T> {
  visibleItems: T[];
  hasMore: boolean;
  /** For FlatList onEndReached (mobile) or an IntersectionObserver (web); does nothing once every item is visible. */
  loadMore: () => void;
}

interface PaginationState<T> {
  source: readonly T[];
  pageCount: number;
}

/**
 * Client-side pagination over the cached catalog (D07): the API returns every
 * product at once. Goes back to page 1 whenever `items` changes identity, so a
 * new filter or search (a new useMemo result) starts from the top.
 * Swapping to server pagination only changes this hook and useProductListing.
 */
export function usePaginatedProducts<T>(
  items: readonly T[],
  pageSize: number = PAGE_SIZE,
): PaginatedItems<T> {
  const [pagination, setPagination] = useState<PaginationState<T>>({
    source: items,
    pageCount: 1,
  });

  // Reset while rendering (no effect): React re-renders before painting the stale page.
  let { pageCount } = pagination;
  if (pagination.source !== items) {
    pageCount = 1;
    setPagination({ source: items, pageCount });
  }

  const visibleCount = Math.min(items.length, pageCount * pageSize);
  const visibleItems = useMemo(() => items.slice(0, visibleCount), [items, visibleCount]);

  const loadMore = useCallback(() => {
    setPagination(current =>
      current.pageCount * pageSize >= current.source.length
        ? current
        : { ...current, pageCount: current.pageCount + 1 },
    );
  }, [pageSize]);

  return { visibleItems, hasMore: visibleCount < items.length, loadMore };
}
