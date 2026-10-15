import { ProductCardSkeleton } from '../../../shared/components/molecules/ProductCardSkeleton'
import { PRODUCT_GRID_CLASS } from './productGrid'

const SKELETON_COUNT = 8

export function ProductGridSkeleton() {
  return (
    <div role="status">
      <span className="sr-only">Cargando productos</span>
      <div className={PRODUCT_GRID_CLASS}>
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    </div>
  )
}
