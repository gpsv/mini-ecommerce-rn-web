import { useId, type ComponentRef, type Ref } from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';
import { CircleAlert } from 'lucide-react-native';
import { useTokenColor } from '../../hooks/useTokenColor';
import { AppText } from './AppText';

export interface TextFieldProps extends Omit<TextInputProps, 'editable'> {
  /** Always visible above the input (not a placeholder). */
  label: string;
  /** Validation message; turns the border danger. */
  error?: string;
  /** Help text, hidden while there is an error. */
  hint?: string;
  disabled?: boolean;
  /** React 19 passes ref as a prop: React Hook Form can focus the field. */
  ref?: Ref<ComponentRef<typeof TextInput>>;
  className?: string;
}

// Focus and error use a 2 px border; padding drops 1 px so the text does not move.
const DEFAULT_BORDER_CLASS =
  'border border-input-border px-3.5 focus:border-2 focus:border-primary focus:px-[13px]';
const ERROR_BORDER_CLASS = 'border-2 border-danger px-[13px]';

export function TextField({
  label,
  error,
  hint,
  disabled = false,
  ref,
  className = '',
  ...inputProps
}: TextFieldProps) {
  const labelId = useId();
  const dangerColor = useTokenColor('--color-danger');
  const hasError = error !== undefined && error.length > 0;

  return (
    <View className={`gap-1.5 ${className}`}>
      <Text nativeID={labelId} className="font-sans text-body font-medium text-text">
        {label}
      </Text>
      <TextInput
        ref={ref}
        editable={!disabled}
        accessibilityLabel={label}
        accessibilityLabelledBy={labelId}
        accessibilityHint={hasError ? error : hint}
        accessibilityState={{ disabled }}
        placeholderTextColorClassName="accent-text-muted"
        className={`min-h-12 rounded-md font-sans text-[16px] ${
          disabled ? 'bg-disabled text-disabled-foreground' : 'bg-surface text-text'
        } ${hasError ? ERROR_BORDER_CLASS : DEFAULT_BORDER_CLASS}`}
        {...inputProps}
      />
      {hasError ? (
        <View className="flex-row items-center gap-1.5" accessibilityLiveRegion="polite">
          <CircleAlert size={16} color={dangerColor} strokeWidth={2.2} />
          <AppText variant="caption" tone="danger">
            {error}
          </AppText>
        </View>
      ) : null}
      {!hasError && hint ? <AppText variant="caption">{hint}</AppText> : null}
    </View>
  );
}
