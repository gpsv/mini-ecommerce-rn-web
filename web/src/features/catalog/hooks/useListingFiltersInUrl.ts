import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import type {
  ControlledListingFilters,
  ListingFilters,
} from '@core/catalog/hooks/useProductListing'

export const SEARCH_PARAM = 'q'
export const CATEGORY_PARAM = 'categoria'

/**
 * Keeps the catalog filters in the URL (?q=&categoria=), so they survive
 * going back from the detail, a reload and a shared link. Every change uses
 * replace: typing does not add one history entry per key. Empty filters are
 * removed and any other parameter is kept.
 */
export function useListingFiltersInUrl(): ControlledListingFilters {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchText = searchParams.get(SEARCH_PARAM) ?? ''
  const category = searchParams.get(CATEGORY_PARAM) || null

  const filters = useMemo<ListingFilters>(() => ({ searchText, category }), [searchText, category])

  const setFilters = useCallback(
    (next: ListingFilters) => {
      setSearchParams(
        (current) => {
          const params = new URLSearchParams(current)
          if (next.searchText) {
            params.set(SEARCH_PARAM, next.searchText)
          } else {
            params.delete(SEARCH_PARAM)
          }
          if (next.category) {
            params.set(CATEGORY_PARAM, next.category)
          } else {
            params.delete(CATEGORY_PARAM)
          }
          return params
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  return { filters, setFilters }
}
