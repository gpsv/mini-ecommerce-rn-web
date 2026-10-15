import { View } from 'react-native';
import { PackageX, SearchX, ShoppingCart, type LucideIcon } from 'lucide-react-native';
import { useTokenColor, type ColorToken } from '../../hooks/useTokenColor';
import { AppText } from '../atoms/AppText';
import { Button, type ButtonVariant } from '../atoms/Button';

export type EmptyStateVariant = 'cart' | 'search' | 'notFound';

export interface EmptyStateProps {
  variant: EmptyStateVariant;
  title: string;
  message: string;
  /** Optional action, e.g. "Ver productos" or "Limpiar búsqueda". */
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

interface VariantStyle {
  icon: LucideIcon;
  iconSize: number;
  iconStrokeWidth: number;
  /** Size, spacing and background of the icon circle. */
  circleClass: string;
  iconToken: ColorToken;
  /** 05-Listado-SinResultados: 18/24 · 10-Carrito-Vacio: 20/28 (title). */
  titleClass: string;
  actionVariant: ButtonVariant;
}

const STATE_TITLE_CLASS = 'text-[18px] leading-6 font-semibold';

const VARIANT_STYLE: Record<EmptyStateVariant, VariantStyle> = {
  cart: {
    icon: ShoppingCart,
    // 10-Carrito-Vacio (the screen wins over the component sheet, as in P07).
    iconSize: 44,
    iconStrokeWidth: 1.8,
    circleClass: 'size-24 mb-2 bg-secondary',
    iconToken: '--color-price',
    titleClass: 'text-title',
    actionVariant: 'primary',
  },
  search: {
    icon: SearchX,
    iconSize: 34,
    iconStrokeWidth: 2,
    circleClass: 'size-[72px] mb-1 bg-primary-soft',
    iconToken: '--color-primary',
    titleClass: STATE_TITLE_CLASS,
    actionVariant: 'secondary',
  },
  notFound: {
    icon: PackageX,
    iconSize: 34,
    iconStrokeWidth: 2,
    circleClass: 'size-[72px] mb-1 bg-primary-soft',
    iconToken: '--color-primary',
    titleClass: STATE_TITLE_CLASS,
    actionVariant: 'primary',
  },
};

export function EmptyState({
  variant,
  title,
  message,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  const style = VARIANT_STYLE[variant];
  const Icon = style.icon;
  const iconColor = useTokenColor(style.iconToken);

  return (
    <View className={`items-center gap-3 px-8 ${className}`}>
      <View
        className={`rounded-full items-center justify-center ${style.circleClass}`}
      >
        <Icon size={style.iconSize} color={iconColor} strokeWidth={style.iconStrokeWidth} />
      </View>
      <AppText className={`text-center ${style.titleClass}`}>{title}</AppText>
      <AppText tone="muted" className="text-center">
        {message}
      </AppText>
      {actionLabel && onAction ? (
        <Button
          label={actionLabel}
          variant={style.actionVariant}
          size="lg"
          onPress={onAction}
          className="mt-2 self-center"
        />
      ) : null}
    </View>
  );
}
