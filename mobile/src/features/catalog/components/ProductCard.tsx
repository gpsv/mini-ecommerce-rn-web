import { memo } from 'react';
import { View } from 'react-native';
import { Plus } from 'lucide-react-native';
import { getCategoryLabel } from '@core/catalog/categoryLabels';
import type { CatalogProduct } from '@core/catalog/product.schema';
import { AppText } from '../../../shared/components/atoms/AppText';
import { Badge } from '../../../shared/components/atoms/Badge';
import { Button } from '../../../shared/components/atoms/Button';
import { Price } from '../../../shared/components/atoms/Price';
import { ProductImage } from '../../../shared/components/atoms/ProductImage';
import { getLegacyShadowStyle } from '../../../shared/platform/shadows';
import { TEXT_METRICS, getFixedScaleTextProps } from '../../../shared/theme/typography';
import { CARD_TITLE_LINES, getCardTitleHeight } from './productGridLayout';

export interface ProductCardProps {
  product: CatalogProduct;
  /** From useProductGridLayout; the height is fixed per font scale for getItemLayout. */
  width: number;
  height: number;
  /** System font scale capped at CARD_MAX_FONT_SCALE (useProductGridLayout). */
  fontScale: number;
  onPressDetail: (product: CatalogProduct) => void;
  onAddToCart: (product: CatalogProduct) => void;
}

/**
 * 15-Specs: 350 high at font scale 1 · image 132 · padding 10 · gap 6.
 * Its texts scale by `fontScale` (capped) instead of the system scale, so they
 * fit the height computed by getProductCardHeight.
 */
function ProductCardView({
  product,
  width,
  height,
  fontScale,
  onPressDetail,
  onAddToCart,
}: ProductCardProps) {
  const titleText = getFixedScaleTextProps(TEXT_METRICS.body, fontScale);

  return (
    <View
      className="bg-surface rounded-lg shadow-card overflow-hidden"
      // Dynamic size (no calc() in RN) plus the elevation fallback (D21).
      style={[{ width, height }, getLegacyShadowStyle('card')]}
    >
      <ProductImage
        uri={product.image}
        accessibilityLabel={product.title}
        className="h-[132px] border-b border-border/40"
      />
      <View className="flex-1 p-2.5 gap-1.5">
        <Badge
          variant="category"
          label={getCategoryLabel(product.category)}
          fixedFontScale={fontScale}
        />
        <AppText
          numberOfLines={CARD_TITLE_LINES}
          allowFontScaling={titleText.allowFontScaling}
          className="font-medium"
          // A 2-line slot even for 1-line titles, so every card lines up.
          style={[titleText.style, { height: getCardTitleHeight(fontScale) }]}
        >
          {product.title}
        </AppText>
        <Price
          cents={product.priceInCents}
          size="md"
          fixedFontScale={fontScale}
        />
        {/* mt-auto: any rounding slack stays above the buttons. */}
        <View className="gap-2 mt-auto pt-1">
          <Button
            label="Ver detalle"
            variant="secondary"
            size="sm"
            fullWidth
            fixedFontScale={fontScale}
            accessibilityHint={product.title}
            onPress={() => onPressDetail(product)}
          />
          <Button
            label="Agregar"
            size="sm"
            icon={Plus}
            fullWidth
            fixedFontScale={fontScale}
            accessibilityHint={`Agrega ${product.title} al carrito`}
            onPress={() => onAddToCart(product)}
          />
        </View>
      </View>
    </View>
  );
}

/** Memoized for the FlatList: the screen passes stable callbacks (useCallback). */
export const ProductCard = memo(ProductCardView);
