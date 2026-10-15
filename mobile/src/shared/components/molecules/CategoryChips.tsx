import { Pressable, ScrollView, Text } from 'react-native';
import { useTokenColor } from '../../hooks/useTokenColor';

export interface CategoryChipOption {
  value: string;
  label: string;
}

export interface CategoryChipsProps {
  options: readonly CategoryChipOption[];
  /** null means "Todas". */
  selectedValue: string | null;
  onSelect: (value: string | null) => void;
  className?: string;
}

interface CategoryChipProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

const ALL_CATEGORIES_LABEL = 'Todas';

function CategoryChip({ label, isSelected, onPress }: CategoryChipProps) {
  const rippleColor = useTokenColor('--color-primary', 0.2);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      hitSlop={{ top: 4, bottom: 4 }}
      android_ripple={{ color: rippleColor }}
      onPress={onPress}
      className={`min-h-10 py-2 px-4 justify-center rounded-full border overflow-hidden ${
        isSelected
          ? 'bg-primary border-primary'
          : 'bg-surface border-border active:bg-primary-soft active:border-primary'
      }`}
    >
      <Text
        className={`font-sans text-[14px] leading-5 ${
          isSelected ? 'font-semibold text-primary-foreground' : 'font-medium text-text'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function CategoryChips({
  options,
  selectedValue,
  onSelect,
  className = '',
}: CategoryChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className={`grow-0 ${className}`}
      contentContainerClassName="gap-2 px-gutter py-3"
    >
      <CategoryChip
        label={ALL_CATEGORIES_LABEL}
        isSelected={selectedValue === null}
        onPress={() => onSelect(null)}
      />
      {options.map(option => (
        <CategoryChip
          key={option.value}
          label={option.label}
          isSelected={option.value === selectedValue}
          onPress={() => onSelect(option.value)}
        />
      ))}
    </ScrollView>
  );
}
