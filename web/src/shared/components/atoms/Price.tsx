import { formatPrice } from '@core/shared/money'

export type PriceSize = 'sm' | 'md' | 'lg' | 'xl'

export interface PriceProps {
  cents: number
  size?: PriceSize
  /** price: orange product price · total: summary totals in the text color. */
  tone?: 'price' | 'total'
  className?: string
}

const SIZE_CLASS: Record<PriceSize, string> = {
  sm: 'text-price-sm',
  md: 'text-price-md',
  lg: 'text-price-lg',
  xl: 'text-price-xl',
}

export function Price({ cents, size = 'md', tone = 'price', className = '' }: PriceProps) {
  return (
    <span
      className={`${SIZE_CLASS[size]} ${tone === 'price' ? 'text-price' : 'text-text'} ${className}`}
    >
      {formatPrice(cents)}
    </span>
  )
}
