import { memo } from 'react';
import { View } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { getLineTotalInCents } from '@core/cart/cart.rules';
import type { CartItem } from '@core/cart/cart.schema';
import { formatPrice } from '@core/shared/money';
import { AppText } from '../../../shared/components/atoms/AppText';
import { IconButton } from '../../../shared/components/atoms/IconButton';
import { Price } from '../../../shared/components/atoms/Price';
import { ProductImage } from '../../../shared/components/atoms/ProductImage';
import { QuantityStepper } from '../../../shared/components/molecules/QuantityStepper';
import { getLegacyShadowStyle } from '../../../shared/platform/shadows';

export interface CartItemRowProps {
  item: CartItem;
  onIncrease: (productId: number) => void;
  onDecrease: (productId: number) => void;
  /** Asks for confirmation before removing (D08). */
  onRemoveRequest: (item: CartItem) => void;
}

/** 08-Carrito: thumb 72 · padding 12/4/12/12 · gap 12 · subtotal price-sm. */
function CartItemRowView({
  item,
  onIncrease,
  onDecrease,
  onRemoveRequest,
}: CartItemRowProps) {
  const handleRemoveRequest = () => onRemoveRequest(item);

  return (
    <View
      className="flex-row gap-3 py-3 pl-3 pr-1 bg-surface rounded-lg shadow-card"
      style={getLegacyShadowStyle('card')}
    >
      <ProductImage
        uri={item.image}
        accessibilityLabel={item.title}
        variant="thumb"
        className="size-[72px] rounded-md border border-border/40"
      />
      <View className="flex-1 min-w-0 gap-1">
        <View className="flex-row items-start gap-1">
          <AppText numberOfLines={2} className="flex-1 font-medium">
            {item.title}
          </AppText>
          <IconButton
            icon={Trash2}
            accessibilityLabel={`Eliminar ${item.title}`}
            iconSize={20}
            className="-mt-3 -mb-2"
            onPress={handleRemoveRequest}
          />
        </View>
        <AppText variant="caption">{`${formatPrice(item.priceInCents)} c/u`}</AppText>
        <View className="flex-row items-center justify-between gap-2 mt-1 pr-2">
          <QuantityStepper
            quantity={item.quantity}
            onIncrease={() => onIncrease(item.id)}
            onDecrease={() => onDecrease(item.id)}
            onRemoveRequest={handleRemoveRequest}
          />
          <Price cents={getLineTotalInCents(item)} size="sm" />
        </View>
      </View>
    </View>
  );
}

/** Memoized: rules return the same item object when it does not change (D28). */
export const CartItemRow = memo(CartItemRowView);
