import { Text } from 'react-native';
import { formatPrice } from '@core/shared/money';

export type PriceSize = 'sm' | 'md' | 'lg' | 'xl';
export type PriceTone = 'price' | 'total';

export interface PriceProps {
  cents: number;
  /** sm: cart row · md: ProductCard · lg: mobile detail · xl: web detail. */
  size?: PriceSize;
  /** total uses the text color (cart and order totals). */
  tone?: PriceTone;
  className?: string;
}

// Size and color are separate tokens: text-price-* is size, text-price is color (D22).
const SIZE_CLASS: Record<PriceSize, string> = {
  sm: 'text-price-sm',
  md: 'text-price-md',
  lg: 'text-price-lg',
  xl: 'text-price-xl',
};

const TONE_CLASS: Record<PriceTone, string> = {
  price: 'text-price',
  total: 'text-text',
};

export function Price({
  cents,
  size = 'md',
  tone = 'price',
  className = '',
}: PriceProps) {
  return (
    <Text
      className={`font-sans ${SIZE_CLASS[size]} ${TONE_CLASS[tone]} ${className}`}
    >
      {formatPrice(cents)}
    </Text>
  );
}
