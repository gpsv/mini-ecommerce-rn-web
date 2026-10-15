import { memo } from 'react'
import { Check, ShoppingCart } from 'lucide-react'
import { useAddToCartFeedback } from '@core/catalog/hooks/useAddToCartFeedback'
import { getCategoryLabel } from '@core/catalog/categoryLabels'
import type { CatalogProduct } from '@core/catalog/product.schema'
import { Badge } from '../../../shared/components/atoms/Badge'
import { Button } from '../../../shared/components/atoms/Button'
import { ButtonLink } from '../../../shared/components/atoms/ButtonLink'
import { Price } from '../../../shared/components/atoms/Price'
import { ProductImage } from '../../../shared/components/atoms/ProductImage'
import { getProductPath } from '../../../shared/navigation/routes'
import { FROM_CATALOG_STATE } from '../catalogNavigation'

export interface ProductCardProps {
  product: CatalogProduct
  onAddToCart: (product: CatalogProduct) => void
}

/** 17-Web-Listado card. Memoized: onAddToCart is stable (useAddToCart). */
export const ProductCard = memo(function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const { isAdded, showFeedback } = useAddToCartFeedback()

  const handleAddToCart = () => {
    onAddToCart(product)
    showFeedback()
  }

  return (
    <article className="@container flex flex-col overflow-hidden rounded-lg bg-surface shadow-card transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-card-hover motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <div className="flex h-[220px] items-center justify-center border-b border-border/40 p-5">
        <ProductImage src={product.image} alt={product.title} width={180} height={180} />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Badge label={getCategoryLabel(product.category)} />
        <h2 className="line-clamp-2 h-11 text-[16px] leading-[22px] font-medium" title={product.title}>
          {product.title}
        </h2>
        <Price cents={product.priceInCents} size="md" className="text-[24px] leading-[30px]" />
        <div className="mt-1 flex flex-col gap-2 @min-[272px]:flex-row">
          <ButtonLink
            to={getProductPath(product.id)}
            state={FROM_CATALOG_STATE}
            label="Ver detalle"
            variant="secondary"
            className="@min-[272px]:flex-1"
            aria-label={`Ver detalle de ${product.title}`}
          />
          <Button
            label={isAdded ? 'Agregado' : 'Agregar'}
            icon={isAdded ? Check : ShoppingCart}
            variant={isAdded ? 'success' : 'primary'}
            className="@min-[272px]:flex-1"
            aria-label={isAdded ? `${product.title} agregado al carrito` : `Agregar ${product.title} al carrito`}
            onClick={handleAddToCart}
          />
        </div>
      </div>
    </article>
  )
})
