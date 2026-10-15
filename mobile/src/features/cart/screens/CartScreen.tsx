import { useCallback } from 'react';
import { FlatList, View, type ListRenderItem } from 'react-native';
import type { CartItem } from '@core/cart/cart.schema';
import { Spinner } from '../../../shared/components/atoms/Spinner';
import { AppHeader } from '../../../shared/components/molecules/AppHeader';
import { EmptyState } from '../../../shared/components/molecules/EmptyState';
import type { RootStackScreenProps } from '../../../shared/navigation/types';
import { CartItemRow } from '../components/CartItemRow';
import { CartSummary } from '../components/CartSummary';
import { useCart } from '../hooks/useCart';
import { useConfirmRemoveItem } from '../hooks/useConfirmRemoveItem';

const keyExtractor = (item: CartItem) => String(item.id);

export function CartScreen({ navigation }: RootStackScreenProps<'Cart'>) {
  const { items, totalItems, totalInCents, isHydrated, increase, decrease } = useCart();
  const confirmRemoveItem = useConfirmRemoveItem();

  const renderItem = useCallback<ListRenderItem<CartItem>>(
    ({ item }) => (
      <CartItemRow
        item={item}
        onIncrease={increase}
        onDecrease={decrease}
        onRemoveRequest={confirmRemoveItem}
      />
    ),
    [increase, decrease, confirmRemoveItem],
  );

  const handleCheckout = useCallback(() => navigation.navigate('Checkout'), [navigation]);

  return (
    <View className="flex-1 bg-background">
      <AppHeader variant="back" title="Mi carrito" onBack={navigation.goBack} />

      {/* The stored cart is still being read: avoids flashing the empty state. */}
      {!isHydrated ? (
        <View className="flex-1 items-center justify-center">
          <Spinner size={32} accessibilityLabel="Cargando carrito" />
        </View>
      ) : null}

      {isHydrated && items.length === 0 ? (
        <View className="flex-1 justify-center pb-18">
          <EmptyState
            variant="cart"
            title="Tu carrito está vacío"
            message="Explora el catálogo y agrega lo que te guste."
            actionLabel="Ver productos"
            onAction={navigation.popToTop}
          />
        </View>
      ) : null}

      {isHydrated && items.length > 0 ? (
        <>
          <FlatList
            data={items}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            className="flex-1"
            contentContainerClassName="gap-3 px-gutter py-3"
          />
          <CartSummary
            totalItems={totalItems}
            totalInCents={totalInCents}
            onCheckout={handleCheckout}
          />
        </>
      ) : null}
    </View>
  );
}
