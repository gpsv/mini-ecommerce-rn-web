import { Text } from 'react-native';
import { formatPrice } from '@core/shared/money';
import { TEXT_METRICS, getFixedScaleTextProps, type TextMetrics } from '../../theme/typography';

export type PriceSize = 'sm' | 'md' | 'lg' | 'xl';
export type PriceTone = 'price' | 'total';

export interface PriceProps {
  cents: number;
  /** sm: cart row · md: ProductCard · lg: mobile detail · xl: web detail. */
  size?: PriceSize;
  /** total uses the text color (cart and order totals). */
  tone?: PriceTone;
  className?: string;
  /**
   * Scales the text by this factor instead of the system font scale, where the
   * layout computes its height in JS (ProductCard).
   */
  fixedFontScale?: number;
}

// Size and color are separate tokens: text-price-* is size, text-price is color (D22).
const SIZE_CLASS: Record<PriceSize, string> = {
  sm: 'text-price-sm',
  md: 'text-price-md',
  lg: 'text-price-lg',
  xl: 'text-price-xl',
};

const SIZE_METRICS: Record<PriceSize, TextMetrics> = {
  sm: TEXT_METRICS.priceSm,
  md: TEXT_METRICS.priceMd,
  lg: TEXT_METRICS.priceLg,
  xl: TEXT_METRICS.priceXl,
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
  fixedFontScale,
}: PriceProps) {
  return (
    <Text
      {...(fixedFontScale === undefined
        ? undefined
        : getFixedScaleTextProps(SIZE_METRICS[size], fixedFontScale))}
      className={`font-sans ${SIZE_CLASS[size]} ${TONE_CLASS[tone]} ${className}`}
    >
      {formatPrice(cents)}
    </Text>
  );
}
