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

export interface ProductCardProps {
  product: CatalogProduct;
  /** From useProductCardWidth; the height is fixed (350) for getItemLayout. */
  width: number;
  onPressDetail: (product: CatalogProduct) => void;
  onAddToCart: (product: CatalogProduct) => void;
}

/** 15-Specs: 350 high · image 132 · padding 10 · gap 6. */
function ProductCardView({
  product,
  width,
  onPressDetail,
  onAddToCart,
}: ProductCardProps) {
  return (
    <View
      className="h-[350px] bg-surface rounded-lg shadow-card overflow-hidden"
      // Dynamic width (no calc() in RN) plus the elevation fallback (D21).
      style={[{ width }, getLegacyShadowStyle('card')]}
    >
      <ProductImage
        uri={product.image}
        accessibilityLabel={product.title}
        className="h-[132px] border-b border-border/40"
      />
      <View className="flex-1 p-2.5 gap-1.5">
        <Badge variant="category" label={getCategoryLabel(product.category)} />
        <AppText numberOfLines={2} className="h-10 font-medium">
          {product.title}
        </AppText>
        <Price cents={product.priceInCents} size="md" />
        <View className="gap-2 mt-1">
          <Button
            label="Ver detalle"
            variant="secondary"
            size="sm"
            fullWidth
            accessibilityHint={product.title}
            onPress={() => onPressDetail(product)}
          />
          <Button
            label="Agregar"
            size="sm"
            icon={Plus}
            fullWidth
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
