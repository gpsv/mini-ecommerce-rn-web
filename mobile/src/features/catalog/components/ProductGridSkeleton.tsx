import { View } from 'react-native';
import { ProductCardSkeleton } from '../../../shared/components/molecules/ProductCardSkeleton';

export interface ProductGridSkeletonProps {
  cardWidth: number;
}

const SKELETON_ROWS = 2;

/** 02-Listado-Cargando: two rows of placeholder cards with the grid gaps. */
export function ProductGridSkeleton({ cardWidth }: ProductGridSkeletonProps) {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel="Cargando productos"
      className="px-gutter gap-3"
    >
      {Array.from({ length: SKELETON_ROWS }, (_, row) => (
        <View key={row} className="flex-row gap-3">
          <View style={{ width: cardWidth }}>
            <ProductCardSkeleton />
          </View>
          <View style={{ width: cardWidth }}>
            <ProductCardSkeleton />
          </View>
        </View>
      ))}
    </View>
  );
}
