import { useCallback } from 'react';
import { KeyboardAvoidingView, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../../shared/components/atoms/Button';
import { AppHeader } from '../../../shared/components/molecules/AppHeader';
import type { RootStackScreenProps } from '../../../shared/navigation/types';
import { getLegacyShadowStyle } from '../../../shared/platform/shadows';
import { ContactForm } from '../components/ContactForm';
import { OrderSummary } from '../components/OrderSummary';
import { useBlockBackWhileBusy } from '../hooks/useBlockBackWhileBusy';
import { useCheckoutForm } from '@core/checkout/hooks/useCheckoutForm';
import { useOrderSummary } from '@core/checkout/hooks/useOrderSummary';
import { resetToOrderConfirmed } from '../navigation/checkoutRoutes';

export function CheckoutScreen({ navigation }: RootStackScreenProps<'Checkout'>) {
  const insets = useSafeAreaInsets();
  const handleConfirmed = useCallback(() => resetToOrderConfirmed(navigation), [navigation]);
  const { control, setFocus, submit, isBusy } = useCheckoutForm({
    onConfirmed: handleConfirmed,
  });
  const summary = useOrderSummary(isBusy);
  useBlockBackWhileBusy(isBusy);

  return (
    <View className="flex-1 bg-background">
      <AppHeader
        variant="back"
        title="Checkout"
        onBack={navigation.goBack}
        isBackDisabled={isBusy}
      />
      {/* Edge-to-edge: the window is not resized, so padding keeps the button above the keyboard. */}
      <KeyboardAvoidingView behavior="padding" className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerClassName="p-4 gap-4"
          keyboardShouldPersistTaps="handled"
        >
          <ContactForm
            control={control}
            setFocus={setFocus}
            isDisabled={isBusy}
            onSubmit={submit}
          />
          <OrderSummary
            items={summary.items}
            totalItems={summary.totalItems}
            totalInCents={summary.totalInCents}
          />
        </ScrollView>

        <View
          className="bg-surface shadow-bar"
          style={[{ paddingBottom: insets.bottom }, getLegacyShadowStyle('bar')]}
        >
          <View className="min-h-bottom-bar p-4">
            <Button
              label={isBusy ? 'Procesando…' : 'Confirmar compra'}
              size="lg"
              fullWidth
              isLoading={isBusy}
              disabled={summary.totalItems === 0}
              onPress={submit}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
