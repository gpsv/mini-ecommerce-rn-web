import { useCallback } from 'react';
import { FlatList, Platform, View, type ListRenderItem } from 'react-native';
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
  GRID_ROW_HEIGHT,
  LIST_HEADER_HEIGHT,
  useProductCardWidth,
} from '../components/productGridLayout';
import { ProductGridSkeleton } from '../components/ProductGridSkeleton';
import { ProductListHeader } from '../components/ProductListHeader';
import { useAddToCart } from '../hooks/useAddToCart';
import { useProductListing, type ListingStatus } from '../hooks/useProductListing';

const keyExtractor = (product: CatalogProduct) => String(product.id);

// With numColumns, FlatList passes the row index.
const getItemLayout = (_data: ArrayLike<CatalogProduct> | null | undefined, index: number) => ({
  length: GRID_ROW_HEIGHT,
  offset: LIST_HEADER_HEIGHT + GRID_ROW_HEIGHT * index,
  index,
});

interface ListEmptyContentProps {
  status: ListingStatus;
  cardWidth: number;
  query: string;
  onRetry: () => void;
  onClearFilters: () => void;
}

function ListEmptyContent({
  status,
  cardWidth,
  query,
  onRetry,
  onClearFilters,
}: ListEmptyContentProps) {
  if (status === 'loading') {
    return <ProductGridSkeleton cardWidth={cardWidth} />;
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
  const cardWidth = useProductCardWidth();
  const listing = useProductListing();
  const handleAddToCart = useAddToCart();

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
        onPressDetail={handlePressDetail}
        onAddToCart={handleAddToCart}
      />
    ),
    [cardWidth, handlePressDetail, handleAddToCart],
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
            isLoading={listing.status === 'loading'}
            totalCount={listing.totalCount}
          />
        }
        ListEmptyComponent={
          <ListEmptyContent
            status={listing.status}
            cardWidth={cardWidth}
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
