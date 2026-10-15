import { View } from 'react-native';
import { AppText } from '../../../shared/components/atoms/AppText';
import { AppHeader } from '../../../shared/components/molecules/AppHeader';
import type { RootStackScreenProps } from '../../../shared/navigation/types';

// Temporary (P07): the real checkout screen is built in P08.
export function CheckoutScreen({ navigation }: RootStackScreenProps<'Checkout'>) {
  return (
    <View className="flex-1 bg-background">
      <AppHeader variant="back" title="Checkout" onBack={navigation.goBack} />
      <View className="flex-1 items-center justify-center px-8">
        <AppText tone="muted">Próximamente (P08)</AppText>
      </View>
    </View>
  );
}
