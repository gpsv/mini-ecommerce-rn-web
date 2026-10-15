import { memo } from 'react'
import { Link } from 'react-router'
import { Trash2 } from 'lucide-react'
import { getLineTotalInCents } from '@core/cart/cart.rules'
import type { CartItem } from '@core/cart/cart.schema'
import { formatPrice } from '@core/shared/money'
import { IconButton } from '../../../shared/components/atoms/IconButton'
import { Price } from '../../../shared/components/atoms/Price'
import { ProductImage } from '../../../shared/components/atoms/ProductImage'
import { QuantityStepper } from '../../../shared/components/molecules/QuantityStepper'
import { getProductPath } from '../../../shared/navigation/routes'

export interface CartItemRowProps {
  item: CartItem
  onIncrease: (productId: number) => void
  onDecrease: (productId: number) => void
  onRemoveRequest: (item: CartItem) => void
}

/** 19-Web-Carrito row. Memoized: the callbacks are stable (useCart). */
export const CartItemRow = memo(function CartItemRow({
  item,
  onIncrease,
  onDecrease,
  onRemoveRequest,
}: CartItemRowProps) {
  const handleRemoveRequest = () => onRemoveRequest(item)

  return (
    <li className="flex flex-wrap items-center gap-4 rounded-lg bg-surface p-4 shadow-card min-[641px]:flex-nowrap">
      <div className="flex size-[72px] shrink-0 items-center justify-center rounded-md border border-border/40 bg-surface p-2 min-[641px]:size-24">
        <ProductImage src={item.image} alt="" width={80} height={80} />
      </div>
      <div className="flex min-w-0 flex-[1_1_220px] flex-col gap-1">
        <h2 className="line-clamp-2 text-[16px] leading-[22px] font-medium">
          <Link to={getProductPath(item.id)} className="focus-ring rounded-sm hover:text-primary hover:underline">
            {item.title}
          </Link>
        </h2>
        <p className="text-[13px] leading-[18px] font-medium text-text-muted">
          {`${formatPrice(item.priceInCents)} c/u`}
        </p>
      </div>
      <QuantityStepper
        quantity={item.quantity}
        itemName={item.title}
        onIncrease={() => onIncrease(item.id)}
        onDecrease={() => onDecrease(item.id)}
        onRemoveRequest={handleRemoveRequest}
      />
      <Price
        cents={getLineTotalInCents(item)}
        className="ml-auto w-[110px] text-right text-[20px] leading-[26px] font-extrabold"
      />
      <IconButton
        icon={Trash2}
        label={`Eliminar ${item.title}`}
        variant="muted"
        className="size-12"
        onClick={handleRemoveRequest}
      />
    </li>
  )
})
