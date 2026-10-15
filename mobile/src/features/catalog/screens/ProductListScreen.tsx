import { useCallback, useState } from 'react';
import {
  FlatList,
  Platform,
  View,
  type LayoutChangeEvent,
  type ListRenderItem,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { CatalogProduct } from '@core/catalog/product.schema';
import { AppHeader } from '../../../shared/components/molecules/AppHeader';
import { EmptyState } from '../../../shared/components/molecules/EmptyState';
import { ErrorState } from '../../../shared/components/molecules/ErrorState';
import type { RootStackScreenProps } from '../../../shared/navigation/types';
import { CartHeaderButton } from '../../cart';
import { LoadMoreFooter } from '../components/LoadMoreFooter';
import { ProductCard } from '../components/ProductCard';
import {
  GRID_COLUMNS,
  LIST_HEADER_HEIGHT,
  useProductGridLayout,
} from '../components/productGridLayout';
import { ProductGridSkeleton } from '../components/ProductGridSkeleton';
import { ProductListHeader } from '../components/ProductListHeader';
import { useAddToCart } from '@core/catalog/hooks/useAddToCart';
import {
  useProductListing,
  type ListingStatus,
} from '@core/catalog/hooks/useProductListing';

const keyExtractor = (product: CatalogProduct) => String(product.id);

interface ListEmptyContentProps {
  status: ListingStatus;
  cardWidth: number;
  cardHeight: number;
  query: string;
  onRetry: () => void;
  onClearFilters: () => void;
}

function ListEmptyContent({
  status,
  cardWidth,
  cardHeight,
  query,
  onRetry,
  onClearFilters,
}: ListEmptyContentProps) {
  if (status === 'loading') {
    return <ProductGridSkeleton cardWidth={cardWidth} cardHeight={cardHeight} />;
  }
  if (status === 'error') {
    return (
      <View className="flex-1 justify-center pb-24">
        <ErrorState onRetry={onRetry} />
      </View>
    );
  }
  return (
    <View className="flex-1 justify-center pb-30">
      <EmptyState
        variant="search"
        title={query ? `Sin resultados para “${query}”` : 'No hay productos disponibles'}
        message="Prueba con otra palabra o revisa la categoría seleccionada."
        actionLabel="Limpiar búsqueda"
        onAction={onClearFilters}
      />
    </View>
  );
}

export function ProductListScreen({ navigation }: RootStackScreenProps<'ProductList'>) {
  const insets = useSafeAreaInsets();
  const { cardWidth, cardHeight, cardFontScale, rowHeight } = useProductGridLayout();
  const listing = useProductListing();
  const handleAddToCart = useAddToCart();
  // Measured, not fixed: it grows with the system font size (D34 risk, P09).
  const [headerHeight, setHeaderHeight] = useState(LIST_HEADER_HEIGHT);

  const handleHeaderLayout = useCallback((event: LayoutChangeEvent) => {
    setHeaderHeight(event.nativeEvent.layout.height);
  }, []);

  // With numColumns, FlatList passes the row index. Every row has the same
  // height for the current font scale, so the offsets stay exact.
  const getItemLayout = useCallback(
    (_data: ArrayLike<CatalogProduct> | null | undefined, index: number) => ({
      length: rowHeight,
      offset: headerHeight + rowHeight * index,
      index,
    }),
    [headerHeight, rowHeight],
  );

  const handlePressDetail = useCallback(
    (product: CatalogProduct) =>
      navigation.navigate('ProductDetail', { productId: product.id }),
    [navigation],
  );

  const renderItem = useCallback<ListRenderItem<CatalogProduct>>(
    ({ item }) => (
      <ProductCard
        product={item}
        width={cardWidth}
        height={cardHeight}
        fontScale={cardFontScale}
        onPressDetail={handlePressDetail}
        onAddToCart={handleAddToCart}
      />
    ),
    [cardWidth, cardHeight, cardFontScale, handlePressDetail, handleAddToCart],
  );

  return (
    <View className="flex-1 bg-background">
      <AppHeader variant="home" rightAction={<CartHeaderButton />} />
      <FlatList
        data={listing.visibleProducts}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        numColumns={GRID_COLUMNS}
        columnWrapperClassName="gap-3 px-gutter pb-3"
        contentContainerClassName="grow"
        // pb 16 of the grid = 12 below the last row + 4, plus the edge-to-edge inset.
        contentContainerStyle={{ paddingBottom: insets.bottom + 4 }}
        // 8 per page: render the first page, keep a few screens around.
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        windowSize={5}
        removeClippedSubviews={Platform.OS === 'android'}
        onEndReached={listing.loadMore}
        onEndReachedThreshold={0.5}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListHeaderComponent={
          <ProductListHeader
            searchText={listing.searchText}
            onChangeSearchText={listing.setSearchText}
            onClearSearch={listing.clearSearch}
            categoryOptions={listing.categoryOptions}
            selectedCategory={listing.category}
            onSelectCategory={listing.setCategory}
            // Only with data: loading and error show their own state below.
            totalCount={listing.status === 'success' ? listing.totalCount : null}
            onLayout={handleHeaderLayout}
          />
        }
        ListEmptyComponent={
          <ListEmptyContent
            status={listing.status}
            cardWidth={cardWidth}
            cardHeight={cardHeight}
            query={listing.query}
            onRetry={listing.retry}
            onClearFilters={listing.clearFilters}
          />
        }
        ListFooterComponent={listing.hasMore ? <LoadMoreFooter /> : undefined}
      />
    </View>
  );
}
