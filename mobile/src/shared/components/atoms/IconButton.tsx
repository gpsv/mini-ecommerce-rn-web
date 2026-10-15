import { Pressable, type PressableProps } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useTokenColor, type ColorToken } from '../../hooks/useTokenColor';

export type IconButtonVariant = 'neutral' | 'primary' | 'onPrimary' | 'danger';
export type IconButtonSize = 40 | 44 | 48;
export type IconButtonShape = 'circle' | 'square';

export interface IconButtonProps
  extends Omit<PressableProps, 'children' | 'disabled' | 'style'> {
  icon: LucideIcon;
  /** Required: an icon-only button has no visible text for screen readers. */
  accessibilityLabel: string;
  variant?: IconButtonVariant;
  /** 48 by default; 40 (stepper) and 44 (SearchBar) get hitSlop up to 48. */
  size?: IconButtonSize;
  /** 24 in headers, 20 in rows, 18 in the stepper. */
  iconSize?: number;
  /** square: flat cell inside QuantityStepper. */
  shape?: IconButtonShape;
  disabled?: boolean;
  className?: string;
}

const MIN_TOUCH_SIZE = 48;

const SIZE_CLASS: Record<IconButtonSize, string> = {
  40: 'size-10',
  44: 'size-11',
  48: 'size-touch',
};

interface VariantStyle {
  iconToken: ColorToken;
  pressedClass: string;
}

const VARIANT_STYLE: Record<IconButtonVariant, VariantStyle> = {
  neutral: { iconToken: '--color-text-muted', pressedClass: 'active:bg-primary-soft' },
  primary: { iconToken: '--color-primary', pressedClass: 'active:bg-primary-soft' },
  onPrimary: {
    iconToken: '--color-primary-foreground',
    pressedClass: 'active:bg-primary-pressed',
  },
  danger: { iconToken: '--color-danger', pressedClass: 'active:bg-danger-soft' },
};

function getShapeClass(shape: IconButtonShape, isDisabled: boolean): string {
  if (shape === 'square') {
    return isDisabled ? 'bg-disabled' : 'bg-surface';
  }
  return 'rounded-full bg-transparent';
}

export function IconButton({
  icon: Icon,
  accessibilityLabel,
  variant = 'neutral',
  size = 48,
  iconSize = 24,
  shape = 'circle',
  disabled = false,
  className = '',
  ...pressableProps
}: IconButtonProps) {
  const variantStyle = VARIANT_STYLE[variant];
  const iconColor = useTokenColor(variantStyle.iconToken);
  const neutralDisabledColor = useTokenColor('--color-disabled-foreground');
  // 12-Checkout-Procesando: on the primary header, disabled is white at 55% (D31).
  const onPrimaryDisabledColor = useTokenColor('--color-primary-foreground', 0.55);
  const disabledColor =
    variant === 'onPrimary' ? onPrimaryDisabledColor : neutralDisabledColor;
  const rippleColor = useTokenColor(variantStyle.iconToken, 0.2);
  const hitSlop = (MIN_TOUCH_SIZE - size) / 2;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={hitSlop}
      android_ripple={
        disabled ? undefined : { color: rippleColor, borderless: shape === 'circle' }
      }
      className={`items-center justify-center overflow-hidden ${SIZE_CLASS[size]} ${getShapeClass(shape, disabled)} ${disabled ? '' : variantStyle.pressedClass} ${className}`}
      {...pressableProps}
    >
      <Icon
        size={iconSize}
        color={disabled ? disabledColor : iconColor}
        strokeWidth={2.2}
      />
    </Pressable>
  );
}
