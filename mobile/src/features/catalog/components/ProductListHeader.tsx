import { View, type LayoutChangeEvent } from 'react-native';
import type { CategoryOption } from '@core/catalog/categoryLabels';
import { AppText } from '../../../shared/components/atoms/AppText';
import { CategoryChips } from '../../../shared/components/molecules/CategoryChips';
import { SearchBar } from '../../../shared/components/molecules/SearchBar';

export interface ProductListHeaderProps {
  searchText: string;
  onChangeSearchText: (text: string) => void;
  onClearSearch: () => void;
  categoryOptions: readonly CategoryOption[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  /** null while there is no data (loading or error): the count is hidden. */
  totalCount: number | null;
  /** The screen uses the measured height as the getItemLayout offset. */
  onLayout: (event: LayoutChangeEvent) => void;
}

function getCountLabel(totalCount: number): string {
  return `${totalCount} ${totalCount === 1 ? 'producto' : 'productos'}`;
}

/**
 * Scrolls with the grid (03-Listado-CargandoMas). 148 high with the count at
 * font scale 1 (124 without it); it grows with larger fonts instead of
 * clipping, and the screen measures it so getItemLayout offsets stay exact.
 */
export function ProductListHeader({
  searchText,
  onChangeSearchText,
  onClearSearch,
  categoryOptions,
  selectedCategory,
  onSelectCategory,
  totalCount,
  onLayout,
}: ProductListHeaderProps) {
  return (
    <View onLayout={onLayout}>
      <View className="px-gutter pt-3">
        <SearchBar
          value={searchText}
          onChangeText={onChangeSearchText}
          onClear={onClearSearch}
        />
      </View>
      <CategoryChips
        options={categoryOptions}
        selectedValue={selectedCategory}
        onSelect={onSelectCategory}
      />
      {totalCount === null ? null : (
        <View className="min-h-6 pb-2 px-gutter">
          <AppText variant="caption" accessibilityLiveRegion="polite" numberOfLines={1}>
            {getCountLabel(totalCount)}
          </AppText>
        </View>
      )}
    </View>
  );
}
