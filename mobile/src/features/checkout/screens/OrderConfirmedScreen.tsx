import { useCallback, useEffect } from 'react';
import { ScrollView, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { resetCheckout, selectConfirmedOrder } from '@core/checkout/checkoutSlice';
import { AppText } from '../../../shared/components/atoms/AppText';
import { Button } from '../../../shared/components/atoms/Button';
import { Price } from '../../../shared/components/atoms/Price';
import { AppHeader } from '../../../shared/components/molecules/AppHeader';
import { useAppDispatch } from '../../../shared/hooks/useAppDispatch';
import { useAppSelector } from '../../../shared/hooks/useAppSelector';
import { useTokenColor } from '../../../shared/hooks/useTokenColor';
import type { RootStackScreenProps } from '../../../shared/navigation/types';
import { getLegacyShadowStyle } from '../../../shared/platform/shadows';
import { getFirstName } from '../getFirstName';
import { resetToCatalog } from '../navigation/checkoutRoutes';

/** 13-Checkout-Confirmado. Reads the snapshot saved before the cart was cleared (D25). */
export function OrderConfirmedScreen({ navigation }: RootStackScreenProps<'OrderConfirmed'>) {
  const dispatch = useAppDispatch();
  const order = useAppSelector(selectConfirmedOrder);
  const checkColor = useTokenColor('--color-primary-foreground');

  // Clears the order when leaving (button or back), not before: the screen
  // stays visible during the exit animation.
  useEffect(
    () => () => {
      dispatch(resetCheckout());
    },
    [dispatch],
  );

  const handleBackToCatalog = useCallback(() => resetToCatalog(navigation), [navigation]);

  return (
    <View className="flex-1 bg-background">
      <AppHeader variant="home" />
      <ScrollView
        className="flex-1"
        contentContainerClassName="grow items-center justify-center gap-3 px-6 pt-6 pb-10"
      >
        {order ? (
          <View accessibilityLiveRegion="polite" className="w-full items-center gap-3">
            <View className="size-24 mb-2 rounded-full bg-success-soft items-center justify-center">
              <View className="size-16 rounded-full bg-success items-center justify-center">
                <Check size={34} color={checkColor} strokeWidth={3} />
              </View>
            </View>
            <AppText
              accessibilityRole="header"
              className="text-center text-[22px] leading-7 font-bold"
            >
              ¡Compra confirmada!
            </AppText>
            <AppText tone="muted" className="text-center">
              {`Gracias, ${getFirstName(order.contact.name)}. Te enviamos el detalle de tu pedido a ${order.contact.email}.`}
            </AppText>
            <View
              className="w-full mt-3 px-4 py-5 gap-1 bg-surface rounded-lg shadow-card"
              style={getLegacyShadowStyle('card')}
            >
              <AppText variant="caption">Número de orden</AppText>
              <AppText className="text-[26px] leading-8 font-extrabold tracking-[0.5px]">
                {`#${order.orderNumber}`}
              </AppText>
              <View className="h-px mt-3 mb-2 bg-border/60" />
              <View className="flex-row justify-between">
                <AppText tone="muted">Productos</AppText>
                <AppText tone="muted">{order.totalItems}</AppText>
              </View>
              <View className="flex-row items-baseline justify-between mt-1">
                <AppText variant="subtitle">Total pagado</AppText>
                <Price cents={order.totalInCents} size="md" tone="total" />
              </View>
            </View>
          </View>
        ) : null}
        <Button
          label="Volver al catálogo"
          size="lg"
          fullWidth
          onPress={handleBackToCatalog}
          className="mt-4"
        />
      </ScrollView>
    </View>
  );
}
