import { View } from 'react-native';
import { AppText } from '../../../shared/components/atoms/AppText';
import {
  CategoryChips,
  type CategoryChipOption,
} from '../../../shared/components/molecules/CategoryChips';
import { SearchBar } from '../../../shared/components/molecules/SearchBar';

export interface ProductListHeaderProps {
  searchText: string;
  onChangeSearchText: (text: string) => void;
  onClearSearch: () => void;
  categoryOptions: readonly CategoryChipOption[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  isLoading: boolean;
  totalCount: number;
}

function getCountLabel(isLoading: boolean, totalCount: number): string {
  if (isLoading) {
    return 'Cargando productos…';
  }
  return `${totalCount} ${totalCount === 1 ? 'producto' : 'productos'}`;
}

/**
 * Scrolls with the grid (03-Listado-CargandoMas). Fixed 148 high
 * (LIST_HEADER_HEIGHT) so getItemLayout offsets stay exact.
 */
export function ProductListHeader({
  searchText,
  onChangeSearchText,
  onClearSearch,
  categoryOptions,
  selectedCategory,
  onSelectCategory,
  isLoading,
  totalCount,
}: ProductListHeaderProps) {
  return (
    <View className="h-[148px]">
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
      <View className="h-6 px-gutter">
        <AppText variant="caption" accessibilityLiveRegion="polite" numberOfLines={1}>
          {getCountLabel(isLoading, totalCount)}
        </AppText>
      </View>
    </View>
  );
}
