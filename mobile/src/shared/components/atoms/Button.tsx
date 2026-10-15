import { Pressable, Text, View, type PressableProps } from 'react-native';
import { Check, type LucideIcon } from 'lucide-react-native';
import { useTokenColor, type ColorToken } from '../../hooks/useTokenColor';
import type { SpinnerSize } from '../../platform/spinnerSize';
import { TEXT_METRICS, getFixedScaleTextProps, type TextMetrics } from '../../theme/typography';
import { Spinner, type SpinnerTone } from './Spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps
  extends Omit<PressableProps, 'children' | 'disabled' | 'style'> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  /** Shows a spinner and blocks presses (e.g. "Procesando…"). */
  isLoading?: boolean;
  /** Temporary confirmation, e.g. "Agregado" + check (success, 1.5 s). */
  isSuccess?: boolean;
  /** Leading icon, e.g. Plus in "Agregar". */
  icon?: LucideIcon;
  fullWidth?: boolean;
  className?: string;
  /**
   * Scales the text by this factor instead of the system font scale, where the
   * layout computes its height in JS (ProductCard).
   */
  fixedFontScale?: number;
}

interface SizeStyle {
  container: string;
  text: string;
  /** Same values as `text`, for fixedFontScale. */
  textMetrics: TextMetrics;
  iconSize: number;
  spinnerSize: SpinnerSize;
  /** Extends the touch area to 48 (15-Specs). */
  hitSlop: number;
}

// Min height plus vertical padding and an explicit line height: same size at
// font scale 1, grows with larger fonts instead of clipping the label.
const SIZE_STYLE: Record<ButtonSize, SizeStyle> = {
  sm: { container: 'min-h-10 py-2 px-4', text: 'text-[14px] leading-5', textMetrics: TEXT_METRICS.buttonSm, iconSize: 18, spinnerSize: 16, hitSlop: 4 },
  md: { container: 'min-h-11 py-2 px-5', text: 'text-[15px] leading-5', textMetrics: TEXT_METRICS.buttonMd, iconSize: 18, spinnerSize: 16, hitSlop: 2 },
  lg: { container: 'min-h-12 py-2 px-6', text: 'text-[16px] leading-6', textMetrics: TEXT_METRICS.buttonLg, iconSize: 20, spinnerSize: 20, hitSlop: 0 },
};

interface VariantStyle {
  container: string;
  loadingContainer: string;
  text: string;
  foregroundToken: ColorToken;
  spinnerTone: SpinnerTone;
}

const VARIANT_STYLE: Record<ButtonVariant, VariantStyle> = {
  primary: {
    container: 'bg-primary active:bg-primary-pressed',
    loadingContainer: 'bg-primary/70',
    text: 'text-primary-foreground',
    foregroundToken: '--color-primary-foreground',
    spinnerTone: 'onPrimary',
  },
  secondary: {
    container: 'bg-secondary active:opacity-80',
    loadingContainer: 'bg-secondary',
    text: 'text-secondary-foreground',
    foregroundToken: '--color-secondary-foreground',
    spinnerTone: 'onSecondary',
  },
  ghost: {
    container: 'bg-transparent active:bg-primary-soft',
    loadingContainer: 'bg-transparent',
    text: 'text-primary',
    foregroundToken: '--color-primary',
    spinnerTone: 'primary',
  },
  danger: {
    container: 'bg-danger active:opacity-90',
    loadingContainer: 'bg-danger/70',
    text: 'text-primary-foreground',
    foregroundToken: '--color-primary-foreground',
    spinnerTone: 'onPrimary',
  },
};

const SUCCESS_STYLE = { container: 'bg-success', text: 'text-primary-foreground' };

function getStateStyle(
  variant: ButtonVariant,
  { isDisabled, isLoading, isSuccess }: Record<'isDisabled' | 'isLoading' | 'isSuccess', boolean>,
): { container: string; text: string } {
  const style = VARIANT_STYLE[variant];
  if (isSuccess) {
    return SUCCESS_STYLE;
  }
  if (isLoading) {
    return { container: style.loadingContainer, text: style.text };
  }
  if (isDisabled) {
    return variant === 'ghost'
      ? { container: 'bg-transparent', text: 'text-disabled-foreground' }
      : { container: 'bg-disabled', text: 'text-disabled-foreground' };
  }
  return { container: style.container, text: style.text };
}

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  disabled = false,
  isLoading = false,
  isSuccess = false,
  icon: Icon,
  fullWidth = false,
  className = '',
  fixedFontScale,
  ...pressableProps
}: ButtonProps) {
  const sizeStyle = SIZE_STYLE[size];
  const variantStyle = VARIANT_STYLE[variant];
  const isBlocked = disabled || isLoading;
  const stateStyle = getStateStyle(variant, {
    isDisabled: disabled,
    isLoading,
    isSuccess,
  });
  const foregroundColor = useTokenColor(
    isSuccess ? '--color-primary-foreground' : variantStyle.foregroundToken,
  );
  const disabledColor = useTokenColor('--color-disabled-foreground');
  const rippleColor = useTokenColor(variantStyle.foregroundToken, 0.2);
  const iconColor = disabled ? disabledColor : foregroundColor;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isBlocked, busy: isLoading }}
      disabled={isBlocked}
      hitSlop={sizeStyle.hitSlop}
      android_ripple={isBlocked ? undefined : { color: rippleColor }}
      className={`flex-row items-center justify-center gap-2 rounded-md overflow-hidden ${sizeStyle.container} ${stateStyle.container} ${fullWidth ? 'self-stretch' : 'self-start'} ${className}`}
      {...pressableProps}
    >
      {isLoading ? (
        <Spinner size={sizeStyle.spinnerSize} tone={variantStyle.spinnerTone} />
      ) : null}
      {!isLoading && Icon ? (
        <Icon size={sizeStyle.iconSize} color={iconColor} strokeWidth={2.4} />
      ) : null}
      <Text
        className={`font-sans font-semibold ${sizeStyle.text} ${stateStyle.text}`}
        numberOfLines={1}
        {...(fixedFontScale === undefined
          ? undefined
          : getFixedScaleTextProps(sizeStyle.textMetrics, fixedFontScale))}
      >
        {label}
      </Text>
      {isSuccess ? (
        <View accessibilityElementsHidden importantForAccessibility="no">
          <Check size={sizeStyle.iconSize} color={iconColor} strokeWidth={2.6} />
        </View>
      ) : null}
    </Pressable>
  );
}
