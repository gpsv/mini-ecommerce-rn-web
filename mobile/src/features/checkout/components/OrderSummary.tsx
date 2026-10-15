import { Text, View } from 'react-native';
import { getLineTotalInCents } from '@core/cart/cart.rules';
import type { CartItem } from '@core/cart/cart.schema';
import { formatPrice } from '@core/shared/money';
import { AppText } from '../../../shared/components/atoms/AppText';
import { Price } from '../../../shared/components/atoms/Price';
import { getLegacyShadowStyle } from '../../../shared/platform/shadows';

export interface OrderSummaryProps {
  items: readonly CartItem[];
  totalItems: number;
  totalInCents: number;
}

/** 11-Checkout "Resumen del pedido": "qty × title" per line, products and total. */
export function OrderSummary({ items, totalItems, totalInCents }: OrderSummaryProps) {
  return (
    <View
      className="p-4 gap-2.5 bg-surface rounded-lg shadow-card"
      style={getLegacyShadowStyle('card')}
    >
      <AppText variant="subtitle" accessibilityRole="header" className="mb-0.5">
        Resumen del pedido
      </AppText>
      {items.map(item => (
        <View key={item.id} className="flex-row gap-3">
          <AppText numberOfLines={1} className="flex-1 min-w-0">
            <Text className="font-semibold">{`${item.quantity} ×`}</Text> {item.title}
          </AppText>
          <AppText className="font-semibold">
            {formatPrice(getLineTotalInCents(item))}
          </AppText>
        </View>
      ))}
      <View className="h-px my-0.5 bg-border/60" />
      <View className="flex-row justify-between">
        <AppText tone="muted">Productos</AppText>
        <AppText tone="muted">{totalItems}</AppText>
      </View>
      <View className="flex-row items-baseline justify-between">
        <AppText variant="subtitle">Total</AppText>
        <Price cents={totalInCents} size="md" tone="total" />
      </View>
    </View>
  );
}
