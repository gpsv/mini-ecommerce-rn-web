import { getLineTotalInCents } from '@core/cart/cart.rules'
import type { OrderSummaryData } from '@core/checkout/hooks/useOrderSummary'
import { formatPrice } from '@core/shared/money'
import { Button } from '../../../shared/components/atoms/Button'
import { Price } from '../../../shared/components/atoms/Price'
import { ProductImage } from '../../../shared/components/atoms/ProductImage'

export interface OrderSummaryProps {
  summary: OrderSummaryData
  formId: string
  isBusy: boolean
}

/** 20-Web-Checkout "Resumen del pedido", with the submit button of the contact form. */
export function OrderSummary({ summary, formId, isBusy }: OrderSummaryProps) {
  return (
    <aside
      aria-labelledby="order-summary-title"
      className="flex flex-col gap-3.5 rounded-lg bg-surface p-6 shadow-card min-[1025px]:sticky min-[1025px]:top-24"
    >
      <h2 id="order-summary-title" className="text-[18px] leading-6 font-semibold">
        Resumen del pedido
      </h2>
      <ul className="flex flex-col gap-3.5">
        {summary.items.map((item) => (
          <li key={item.id} className="flex items-center gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-sm border border-border/40 p-1">
              <ProductImage src={item.image} alt="" width={40} height={40} />
            </span>
            <span className="min-w-0 flex-1 truncate text-body" title={item.title}>
              <span className="font-semibold">{`${item.quantity} ×`}</span> {item.title}
            </span>
            <span className="text-body font-semibold">{formatPrice(getLineTotalInCents(item))}</span>
          </li>
        ))}
      </ul>
      <hr className="my-0.5 border-border/60" />
      <div className="flex justify-between text-[15px] leading-[22px] text-text-muted">
        <span>Productos</span>
        <span>{summary.totalItems}</span>
      </div>
      <div className="flex items-baseline justify-between">
        <span className="text-[18px] leading-6 font-semibold">Total</span>
        <Price cents={summary.totalInCents} size="lg" tone="total" />
      </div>
      <Button
        type="submit"
        form={formId}
        label={isBusy ? 'Procesando…' : 'Confirmar compra'}
        size="lg"
        fullWidth
        disabled={isBusy}
        aria-busy={isBusy}
        className="mt-1.5"
      />
    </aside>
  )
}
