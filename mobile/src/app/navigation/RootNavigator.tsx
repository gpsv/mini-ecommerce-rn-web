import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CartScreen } from '../../features/cart';
import { ProductDetailScreen, ProductListScreen } from '../../features/catalog';
import { CheckoutScreen } from '../../features/checkout';
import type { RootStackParamList } from '../../shared/navigation/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/** Each screen draws its own AppHeader (design), so the native header is hidden. */
export function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="ProductList" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProductList" component={ProductListScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
    </Stack.Navigator>
  );
}
