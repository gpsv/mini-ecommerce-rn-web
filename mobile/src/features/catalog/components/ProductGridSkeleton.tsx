import { View } from 'react-native';
import { ProductCardSkeleton } from '../../../shared/components/molecules/ProductCardSkeleton';

export interface ProductGridSkeletonProps {
  cardWidth: number;
  /** Same height as ProductCard, so the grid does not jump when it loads. */
  cardHeight: number;
}

const SKELETON_ROWS = 2;

/** 02-Listado-Cargando: two rows of placeholder cards with the grid gaps. */
export function ProductGridSkeleton({ cardWidth, cardHeight }: ProductGridSkeletonProps) {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel="Cargando productos"
      className="px-gutter gap-3"
    >
      {Array.from({ length: SKELETON_ROWS }, (_, row) => (
        <View key={row} className="flex-row gap-3">
          <View style={{ width: cardWidth, height: cardHeight }}>
            <ProductCardSkeleton className="flex-1" />
          </View>
          <View style={{ width: cardWidth, height: cardHeight }}>
            <ProductCardSkeleton className="flex-1" />
          </View>
        </View>
      ))}
    </View>
  );
}
