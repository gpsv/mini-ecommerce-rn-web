import { useCallback } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShoppingCart } from 'lucide-react-native';
import { getCategoryLabel } from '@core/catalog/categoryLabels';
import type { CatalogProduct } from '@core/catalog/product.schema';
import { AppText } from '../../../shared/components/atoms/AppText';
import { Badge } from '../../../shared/components/atoms/Badge';
import { Button } from '../../../shared/components/atoms/Button';
import { Price } from '../../../shared/components/atoms/Price';
import { ProductImage } from '../../../shared/components/atoms/ProductImage';
import { Spinner } from '../../../shared/components/atoms/Spinner';
import { AppHeader } from '../../../shared/components/molecules/AppHeader';
import { EmptyState } from '../../../shared/components/molecules/EmptyState';
import { ErrorState } from '../../../shared/components/molecules/ErrorState';
import { Snackbar } from '../../../shared/components/molecules/Snackbar';
import type { RootStackScreenProps } from '../../../shared/navigation/types';
import { getLegacyShadowStyle } from '../../../shared/platform/shadows';
import { CartHeaderButton } from '../../cart';
import { useAddToCart } from '../hooks/useAddToCart';
import { useAddToCartFeedback } from '../hooks/useAddToCartFeedback';
import { useProductDetail } from '../hooks/useProductDetail';

/** 15-Specs: bottom bar 80 (min-h-bottom-bar) · snackbar 12 above it. */
const BOTTOM_BAR_HEIGHT = 80;
const SNACKBAR_GAP = 12;

interface ProductDetailContentProps {
  product: CatalogProduct;
}

function ProductDetailContent({ product }: ProductDetailContentProps) {
  return (
    <>
      <ProductImage
        uri={product.image}
        accessibilityLabel={product.title}
        variant="detail"
        className="h-[300px] border-b border-border/40"
      />
      <View className="p-4 gap-2">
        <Badge variant="category" label={getCategoryLabel(product.category)} />
        <AppText variant="title" accessibilityRole="header">
          {product.title}
        </AppText>
        <Price cents={product.priceInCents} size="lg" />
        <View className="h-px my-2 bg-border/60" />
        <AppText variant="subtitle">Descripción</AppText>
        <AppText className="leading-[22px]">{product.description}</AppText>
      </View>
    </>
  );
}

export function ProductDetailScreen({
  navigation,
  route,
}: RootStackScreenProps<'ProductDetail'>) {
  const insets = useSafeAreaInsets();
  const { status, product, retry } = useProductDetail(route.params.productId);
  const addToCart = useAddToCart();
  const { isAdded, isSnackbarVisible, showFeedback, hideSnackbar } = useAddToCartFeedback();

  const handleAddToCart = useCallback(() => {
    if (product) {
      addToCart(product);
      showFeedback();
    }
  }, [addToCart, product, showFeedback]);

  const handleViewCart = useCallback(() => {
    hideSnackbar();
    navigation.navigate('Cart');
  }, [hideSnackbar, navigation]);

  return (
    <View className="flex-1 bg-background">
      <AppHeader
        variant="back"
        title="Detalle"
        onBack={navigation.goBack}
        rightAction={<CartHeaderButton />}
      />

      {status === 'success' && product ? (
        <>
          <ScrollView className="flex-1" contentContainerClassName="pb-4">
            <ProductDetailContent product={product} />
          </ScrollView>

          <View
            pointerEvents="box-none"
            className="absolute left-4 right-4"
            style={{ bottom: insets.bottom + BOTTOM_BAR_HEIGHT + SNACKBAR_GAP }}
          >
            <Snackbar
              isVisible={isSnackbarVisible}
              message="Se agregó al carrito"
              actionLabel="Ver carrito"
              onAction={handleViewCart}
            />
          </View>

          <View
            className="bg-surface shadow-bar"
            style={[{ paddingBottom: insets.bottom }, getLegacyShadowStyle('bar')]}
          >
            <View className="min-h-bottom-bar p-4">
              <Button
                label={isAdded ? 'Agregado' : 'Agregar al carrito'}
                size="lg"
                icon={isAdded ? undefined : ShoppingCart}
                isSuccess={isAdded}
                fullWidth
                accessibilityLiveRegion="polite"
                onPress={handleAddToCart}
              />
            </View>
          </View>
        </>
      ) : null}

      {status === 'loading' ? (
        <View className="flex-1 items-center justify-center">
          <Spinner size={32} accessibilityLabel="Cargando producto" />
        </View>
      ) : null}

      {status === 'error' ? (
        <View className="flex-1 justify-center pb-24">
          <ErrorState
            title="No pudimos cargar el producto"
            onRetry={retry}
          />
        </View>
      ) : null}

      {status === 'notFound' ? (
        <View className="flex-1 justify-center pb-24">
          <EmptyState
            variant="notFound"
            title="No encontramos este producto"
            message="Puede que ya no esté disponible."
            actionLabel="Volver al catálogo"
            onAction={navigation.popToTop}
          />
        </View>
      ) : null}
    </View>
  );
}
