import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { useTokenColor } from '../../hooks/useTokenColor';
import { IconButton } from '../atoms/IconButton';

export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  placeholder?: string;
  className?: string;
}

/** Controlled input; debouncing belongs to the screen hook (useDebouncedValue). */
export function SearchBar({
  value,
  onChangeText,
  onClear,
  placeholder = 'Buscar por nombre',
  className = '',
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const mutedColor = useTokenColor('--color-text-muted');
  const primaryColor = useTokenColor('--color-primary');
  const hasText = value.length > 0;

  // Focus uses a 2 px border; padding drops 1 px so the content does not move.
  const borderClass = isFocused
    ? 'border-2 border-primary pl-[13px]'
    : 'border border-input-border pl-3.5';

  return (
    <View
      className={`h-12 flex-row items-center gap-2 rounded-md bg-surface ${borderClass} ${hasText ? 'pr-0' : 'pr-3.5'} ${className}`}
    >
      <Search size={20} color={isFocused ? primaryColor : mutedColor} strokeWidth={2.2} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        placeholderTextColorClassName="accent-text-muted"
        accessibilityLabel="Buscar productos"
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        className="flex-1 h-full p-0 font-sans text-[16px] text-text"
      />
      {hasText ? (
        <IconButton
          icon={X}
          accessibilityLabel="Borrar búsqueda"
          size={44}
          iconSize={20}
          onPress={onClear}
        />
      ) : null}
    </View>
  );
}
