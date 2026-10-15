import { Minus, Plus, Trash2 } from 'lucide-react'
import { MAX_QUANTITY, MIN_QUANTITY } from '@core/cart/cart.schema'
import { IconButton } from '../atoms/IconButton'

export interface QuantityStepperProps {
  quantity: number
  onIncrease: () => void
  onDecrease: () => void
  /**
   * At quantity 1 the − becomes "Eliminar producto", which calls this; the
   * screen asks for confirmation (D08). Without it, − is just disabled.
   */
  onRemoveRequest?: () => void
  /** For the group label: "Cantidad de <title>". */
  itemName?: string
  className?: string
}

/** 19-Web-Carrito: 44 px square buttons inside a bordered group. */
export function QuantityStepper({
  quantity,
  onIncrease,
  onDecrease,
  onRemoveRequest,
  itemName,
  className = '',
}: QuantityStepperProps) {
  const isAtMin = quantity <= MIN_QUANTITY
  const canIncrease = quantity < MAX_QUANTITY
  const showsRemove = isAtMin && onRemoveRequest !== undefined

  return (
    <div
      role="group"
      aria-label={itemName ? `Cantidad de ${itemName}` : 'Cantidad'}
      className={`flex shrink-0 items-center self-center overflow-hidden rounded-md border border-border bg-surface ${className}`}
    >
      {showsRemove ? (
        <IconButton
          icon={Trash2}
          label="Eliminar producto"
          variant="danger"
          shape="square"
          iconSize={18}
          className="size-11"
          onClick={onRemoveRequest}
        />
      ) : (
        <IconButton
          icon={Minus}
          label="Quitar uno"
          shape="square"
          iconSize={18}
          className="size-11"
          disabled={isAtMin}
          onClick={onDecrease}
        />
      )}
      <span aria-live="polite" className="min-w-10 text-center text-[16px] font-semibold">
        <span className="sr-only">Cantidad: </span>
        {quantity}
      </span>
      <IconButton
        icon={Plus}
        label="Agregar uno"
        shape="square"
        iconSize={18}
        className="size-11"
        disabled={!canIncrease}
        onClick={onIncrease}
      />
    </div>
  )
}
