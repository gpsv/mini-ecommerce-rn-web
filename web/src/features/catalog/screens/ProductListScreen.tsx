import { useAddToCart } from '@core/catalog/hooks/useAddToCart'
import { useProductListing } from '@core/catalog/hooks/useProductListing'
import { Button } from '../../../shared/components/atoms/Button'
import { CategoryChips } from '../../../shared/components/molecules/CategoryChips'
import { EmptyState } from '../../../shared/components/molecules/EmptyState'
import { ErrorState } from '../../../shared/components/molecules/ErrorState'
import { SearchBar } from '../../../shared/components/molecules/SearchBar'
import { useListingFiltersInUrl } from '../hooks/useListingFiltersInUrl'
import { LoadMoreSentinel } from '../components/LoadMoreSentinel'
import { ProductCard } from '../components/ProductCard'
import { ProductGridSkeleton } from '../components/ProductGridSkeleton'
import { PRODUCT_GRID_CLASS } from '../components/productGrid'

function getProductCountLabel(count: number): string {
  return `${count} ${count === 1 ? 'producto' : 'productos'}`
}

/** 17-Web-Listado. One cached getProducts request for the whole session (D17). */
export function ProductListScreen() {
  const listing = useProductListing(useListingFiltersInUrl())
  const handleAddToCart = useAddToCart()

  return (
    <div className="page-container pt-8 pb-12">
      <title>Catálogo · MiniShop</title>
      <div className="flex flex-wrap items-baseline gap-3">
        <h1 className="text-[28px] leading-9 font-bold">Catálogo</h1>
        {listing.status === 'success' ? (
          <span aria-live="polite" className="text-body text-text-muted">
            {getProductCountLabel(listing.totalCount)}
          </span>
        ) : null}
      </div>

      <div className="mt-5 mb-7 flex flex-wrap items-center gap-4">
        <SearchBar
          value={listing.searchText}
          onChange={listing.setSearchText}
          onClear={listing.clearSearch}
          className="flex-[1_1_100%] min-[1025px]:flex-[0_1_480px]"
        />
        <CategoryChips
          options={listing.categoryOptions}
          selectedValue={listing.category}
          onSelect={listing.setCategory}
        />
      </div>

      {listing.status === 'loading' ? <ProductGridSkeleton /> : null}

      {listing.status === 'error' ? <ErrorState onRetry={listing.retry} /> : null}

      {listing.status === 'success' && listing.totalCount === 0 ? (
        <EmptyState
          variant="search"
          title={listing.query ? `Sin resultados para “${listing.query}”` : 'No hay productos disponibles'}
          message="Prueba con otra palabra o revisa la categoría seleccionada."
          action={<Button label="Limpiar búsqueda" variant="secondary" size="lg" onClick={listing.clearFilters} />}
        />
      ) : null}

      {listing.status === 'success' && listing.totalCount > 0 ? (
        <>
          <div className={PRODUCT_GRID_CLASS}>
            {listing.visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
            ))}
          </div>
          {listing.hasMore ? (
            <LoadMoreSentinel
              onLoadMore={listing.loadMore}
              visibleCount={listing.visibleProducts.length}
            />
          ) : null}
        </>
      ) : null}
    </div>
  )
}
