import { useCallback, type MouseEvent } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { ArrowLeft, Check, ShoppingCart } from 'lucide-react'
import { getCategoryLabel } from '@core/catalog/categoryLabels'
import { useAddToCart } from '@core/catalog/hooks/useAddToCart'
import { useAddToCartFeedback } from '@core/catalog/hooks/useAddToCartFeedback'
import { useProductDetail } from '@core/catalog/hooks/useProductDetail'
import type { CatalogProduct } from '@core/catalog/product.schema'
import { Badge } from '../../../shared/components/atoms/Badge'
import { Button } from '../../../shared/components/atoms/Button'
import { ButtonLink } from '../../../shared/components/atoms/ButtonLink'
import { Price } from '../../../shared/components/atoms/Price'
import { ProductImage } from '../../../shared/components/atoms/ProductImage'
import { EmptyState } from '../../../shared/components/molecules/EmptyState'
import { ErrorState } from '../../../shared/components/molecules/ErrorState'
import { LoadingState } from '../../../shared/components/molecules/LoadingState'
import { Snackbar } from '../../../shared/components/molecules/Snackbar'
import { ROUTES } from '../../../shared/navigation/routes'
import { isFromCatalogState } from '../catalogNavigation'

const PRODUCT_ID_PATTERN = /^[1-9]\d*$/

function ProductNotFound() {
  return (
    <EmptyState
      variant="notFound"
      headingLevel="h1"
      title="No encontramos este producto"
      message="Puede que ya no esté disponible."
      action={<ButtonLink to={ROUTES.catalog} label="Volver al catálogo" size="lg" />}
    />
  )
}

interface ProductDetailContentProps {
  product: CatalogProduct
}

function ProductDetailContent({ product }: ProductDetailContentProps) {
  const addToCart = useAddToCart()
  const { isAdded, isSnackbarVisible, showFeedback, hideSnackbar } = useAddToCartFeedback()

  const handleAddToCart = useCallback(() => {
    addToCart(product)
    showFeedback()
  }, [addToCart, product, showFeedback])

  return (
    <div className="mt-4 grid grid-cols-1 items-start gap-6 min-[1025px]:grid-cols-2 min-[1025px]:gap-14">
      <title>{`${product.title} · MiniShop`}</title>
      <div className="flex h-[420px] items-center justify-center rounded-lg bg-surface p-14 shadow-card min-[1025px]:aspect-square min-[1025px]:h-auto min-[1025px]:max-h-[560px]">
        {/* Eager: it is the largest element of the page (LCP). */}
        <ProductImage src={product.image} alt={product.title} width={448} height={448} loading="eager" />
      </div>
      <div className="flex flex-col gap-3 pt-2">
        <Badge label={getCategoryLabel(product.category)} size="md" />
        <h1 className="text-[30px] leading-[38px] font-bold">{product.title}</h1>
        <Price cents={product.priceInCents} size="xl" className="mt-1" />
        <hr className="my-3 border-border/60" />
        <h2 className="text-[18px] leading-6 font-semibold">Descripción</h2>
        <p className="max-w-[60ch] text-[16px] leading-[26px]">{product.description}</p>
        <Button
            label={isAdded ? 'Agregado' : 'Agregar al carrito'}
            icon={isAdded ? Check : ShoppingCart}
            variant={isAdded ? 'success' : 'primary'}
            size="lg"
            onClick={handleAddToCart}
            className="mt-5 w-full min-[641px]:w-auto min-[641px]:self-start"
          />
      </div>
      <Snackbar
        isVisible={isSnackbarVisible}
        message="Se agregó al carrito"
        action={
          <Link
            to={ROUTES.cart}
            onClick={hideSnackbar}
            className="focus-ring-inverse shrink-0 rounded-sm px-2 py-1 font-semibold text-secondary underline-offset-2 hover:underline"
          >
            Ver carrito
          </Link>
        }
      />
    </div>
  )
}

interface ProductDetailLoaderProps {
  productId: number
}

/**
 * Reads the product from the getProducts cache; only a direct URL without
 * that cache requests /products/:id (D32).
 */
function ProductDetailLoader({ productId }: ProductDetailLoaderProps) {
  const { status, product, retry } = useProductDetail(productId)

  if (status === 'success' && product) {
    return <ProductDetailContent product={product} />
  }
  if (status === 'notFound') {
    return <ProductNotFound />
  }
  if (status === 'error') {
    return <ErrorState title="No pudimos cargar el producto" onRetry={retry} />
  }
  return <LoadingState label="Cargando producto" />
}

/** 18-Web-Detalle. An id that is not a positive integer is not found, without a request. */
export function ProductDetailScreen() {
  const { productId = '' } = useParams()
  const isValidId = PRODUCT_ID_PATTERN.test(productId)
  const location = useLocation()
  const navigate = useNavigate()

  // Opened from the catalog: go back, so it keeps ?q=&categoria= and the scroll.
  // From a direct or shared link there is no catalog behind: the link goes to /.
  const handleBackToCatalog = (event: MouseEvent<HTMLAnchorElement>) => {
    if (isFromCatalogState(location.state)) {
      event.preventDefault()
      navigate(-1)
    }
  }

  return (
    <div className="page-container pt-5 pb-16">
      <Link
        to={ROUTES.catalog}
        onClick={handleBackToCatalog}
        className="focus-ring -ml-1.5 inline-flex h-11 items-center gap-1.5 rounded-md pr-3 pl-1.5 text-[14px] font-semibold text-primary hover:bg-primary-soft"
      >
        <ArrowLeft size={20} aria-hidden="true" />
        Volver al catálogo
      </Link>
      {isValidId ? <ProductDetailLoader productId={Number(productId)} /> : <ProductNotFound />}
    </div>
  )
}
