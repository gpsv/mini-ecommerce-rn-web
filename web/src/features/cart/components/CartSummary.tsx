import { formatPrice } from '@core/shared/money'
import { ButtonLink } from '../../../shared/components/atoms/ButtonLink'
import { Price } from '../../../shared/components/atoms/Price'
import { ROUTES } from '../../../shared/navigation/routes'

export interface CartSummaryProps {
  totalItems: number
  totalInCents: number
}

/** 19-Web-Carrito summary: sticky beside the list on wide screens. */
export function CartSummary({ totalItems, totalInCents }: CartSummaryProps) {
  return (
    <aside
      aria-labelledby="cart-summary-title"
      className="flex flex-col gap-3 rounded-lg bg-surface p-6 shadow-card min-[1025px]:sticky min-[1025px]:top-24"
    >
      <h2 id="cart-summary-title" className="text-[18px] leading-6 font-semibold">
        Resumen
      </h2>
      <div className="flex justify-between text-[15px] leading-[22px] text-text-muted">
        <span>{`Productos: ${totalItems}`}</span>
        <span>{formatPrice(totalInCents)}</span>
      </div>
      <hr className="my-1 border-border/60" />
      <div className="flex items-baseline justify-between">
        <span className="text-[18px] leading-6 font-semibold">Total:</span>
        <Price cents={totalInCents} size="lg" tone="total" />
      </div>
      <ButtonLink to={ROUTES.checkout} label="Ir a checkout" size="lg" fullWidth className="mt-2" />
      <ButtonLink to={ROUTES.catalog} label="Seguir comprando" variant="ghost" size="lg" fullWidth className="h-12" />
    </aside>
  )
}
