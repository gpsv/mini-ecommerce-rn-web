import { Navigate } from 'react-router'
import { Check } from 'lucide-react'
import { getFirstName } from '@core/checkout/getFirstName'
import { selectConfirmedOrder } from '@core/checkout/checkoutSlice'
import { useAppSelector } from '@core/store/hooks'
import { ButtonLink } from '../../../shared/components/atoms/ButtonLink'
import { Price } from '../../../shared/components/atoms/Price'
import { ROUTES } from '../../../shared/navigation/routes'

/**
 * 13-Checkout-Confirmado adapted to web (there is no web board). The order
 * lives only in memory: after a reload there is none and it goes to the catalog.
 * useResetCheckoutOnLeave resets the checkout when the user leaves.
 */
export function OrderConfirmedScreen() {
  const order = useAppSelector(selectConfirmedOrder)

  if (!order) {
    return <Navigate to={ROUTES.catalog} replace />
  }

  return (
    <div className="page-container flex flex-col items-center pt-12 pb-16">
      <title>Compra confirmada · MiniShop</title>
      <div className="flex w-full max-w-md flex-col items-center gap-3 text-center">
        <span className="mb-2 flex size-24 items-center justify-center rounded-full bg-success-soft">
          <span className="flex size-16 items-center justify-center rounded-full bg-success text-primary-foreground">
            <Check size={34} strokeWidth={3} aria-hidden="true" />
          </span>
        </span>
        <h1 className="text-[28px] leading-9 font-bold">¡Compra confirmada!</h1>
        <p className="text-body text-text-muted">
          {`Gracias, ${getFirstName(order.contact.name)}. Te enviamos el detalle de tu pedido a ${order.contact.email}.`}
        </p>
        <dl className="mt-3 flex w-full flex-col gap-1 rounded-lg bg-surface px-4 py-5 text-left shadow-card">
          <dt className="text-caption text-text-muted">Número de orden</dt>
          <dd className="text-[26px] leading-8 font-extrabold tracking-[0.5px]">{`#${order.orderNumber}`}</dd>
          <div className="mt-3 flex justify-between border-t border-border/60 pt-2 text-body text-text-muted">
            <dt>Productos</dt>
            <dd>{order.totalItems}</dd>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <dt className="text-subtitle">Total pagado</dt>
            <dd>
              <Price cents={order.totalInCents} size="md" tone="total" />
            </dd>
          </div>
        </dl>
        <ButtonLink to={ROUTES.catalog} label="Volver al catálogo" size="lg" fullWidth className="mt-4" />
      </div>
    </div>
  )
}
