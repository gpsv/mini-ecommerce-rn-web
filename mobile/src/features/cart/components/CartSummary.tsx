import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../../../shared/components/atoms/AppText';
import { Button } from '../../../shared/components/atoms/Button';
import { Price } from '../../../shared/components/atoms/Price';
import { getLegacyShadowStyle } from '../../../shared/platform/shadows';

export interface CartSummaryProps {
  totalItems: number;
  totalInCents: number;
  onCheckout: () => void;
}

/** 08-Carrito bottom bar: products, total and the checkout button. */
export function CartSummary({ totalItems, totalInCents, onCheckout }: CartSummaryProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-surface shadow-bar"
      style={[{ paddingBottom: insets.bottom }, getLegacyShadowStyle('bar')]}
    >
      <View className="p-4 gap-1">
        <AppText tone="muted">{`Productos: ${totalItems}`}</AppText>
        <View className="flex-row items-baseline justify-between">
          <AppText className="text-[18px] leading-6 font-semibold">Total:</AppText>
          <Price cents={totalInCents} size="md" tone="total" />
        </View>
        <Button
          label="Ir a checkout"
          size="lg"
          fullWidth
          disabled={totalItems === 0}
          onPress={onCheckout}
          className="mt-3"
        />
      </View>
    </View>
  );
}
