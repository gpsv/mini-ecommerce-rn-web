import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ShoppingCart } from 'lucide-react-native';
import { selectTotalItems } from '@core/cart/cart.selectors';
import { Badge } from '../../../shared/components/atoms/Badge';
import { IconButton } from '../../../shared/components/atoms/IconButton';
import { useAppSelector } from '@core/store/hooks';

function getCartLabel(totalItems: number): string {
  return `Carrito, ${totalItems} ${totalItems === 1 ? 'producto' : 'productos'}`;
}

/** Header cart icon with CartBadge (selectTotalItems); opens the cart. */
export function CartHeaderButton() {
  const navigation = useNavigation();
  const totalItems = useAppSelector(selectTotalItems);

  return (
    <View>
      <IconButton
        icon={ShoppingCart}
        accessibilityLabel={getCartLabel(totalItems)}
        variant="onPrimary"
        onPress={() => navigation.navigate('Cart')}
      />
      <View pointerEvents="none" className="absolute top-1 right-0.5">
        <Badge variant="count" count={totalItems} className="border-2 border-primary" />
      </View>
    </View>
  );
}
