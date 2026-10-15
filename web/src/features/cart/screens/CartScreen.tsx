import { useRef } from 'react'
import { useCart } from '@core/cart/hooks/useCart'
import { ButtonLink } from '../../../shared/components/atoms/ButtonLink'
import { ProductImage } from '../../../shared/components/atoms/ProductImage'
import { ConfirmDialog } from '../../../shared/components/molecules/ConfirmDialog'
import { EmptyState } from '../../../shared/components/molecules/EmptyState'
import { LoadingState } from '../../../shared/components/molecules/LoadingState'
import { ROUTES } from '../../../shared/navigation/routes'
import { CartItemRow } from '../components/CartItemRow'
import { CartSummary } from '../components/CartSummary'
import { useConfirmRemoveItem } from '../hooks/useConfirmRemoveItem'

function getProductCountLabel(count: number): string {
  return `(${count} ${count === 1 ? 'producto' : 'productos'})`
}

/** 19-Web-Carrito, with 09-Carrito-Confirmar as ConfirmDialog. */
export function CartScreen() {
  const { items, totalItems, totalInCents, isHydrated, increase, decrease } = useCart()
  const { pendingItem, requestRemove, cancelRemove, confirmRemove } = useConfirmRemoveItem()
  // Focus target after removing a row (its buttons no longer exist); also
  // set on the empty state's heading when the last item is removed.
  const headingRef = useRef<HTMLHeadingElement>(null)

  if (!isHydrated) {
    return <LoadingState label="Cargando carrito" />
  }

  if (items.length === 0) {
    return (
      <div className="page-container pt-8 pb-16">
        <title>Carrito · MiniShop</title>
        <EmptyState
          variant="cart"
          headingLevel="h1"
          headingRef={headingRef}
          title="Tu carrito está vacío"
          message="Explora el catálogo y agrega lo que te guste."
          action={<ButtonLink to={ROUTES.catalog} label="Ver productos" size="lg" />}
        />
      </div>
    )
  }

  return (
    <div className="page-container pt-8 pb-16">
      <title>Carrito · MiniShop</title>
      <h1 ref={headingRef} tabIndex={-1} className="mb-6 text-[28px] leading-9 font-bold outline-none">
        Mi carrito{' '}
        <span className="text-[16px] font-medium text-text-muted">{getProductCountLabel(totalItems)}</span>
      </h1>
      <div className="grid grid-cols-1 items-start gap-8 min-[1025px]:grid-cols-[minmax(0,1fr)_360px]">
        <ul className="flex flex-col gap-4">
          {items.map((item) => (
            <CartItemRow
              key={item.id}
              item={item}
              onIncrease={increase}
              onDecrease={decrease}
              onRemoveRequest={requestRemove}
            />
          ))}
        </ul>
        <CartSummary totalItems={totalItems} totalInCents={totalInCents} />
      </div>

      <ConfirmDialog
        isOpen={pendingItem !== null}
        title="¿Eliminar este producto del carrito?"
        description={
          pendingItem ? (
            <div className="flex items-center gap-3 rounded-md border border-border/60 p-3">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-sm border border-border/40 bg-surface p-1">
                <ProductImage src={pendingItem.image} alt="" width={40} height={40} />
              </span>
              <span className="text-[14px] leading-5 font-medium">{pendingItem.title}</span>
            </div>
          ) : null
        }
        confirmLabel="Eliminar"
        onConfirm={confirmRemove}
        onCancel={cancelRemove}
        fallbackFocusRef={headingRef}
      />
    </div>
  )
}
