import { View } from 'react-native';
import { SearchX, ShoppingCart, type LucideIcon } from 'lucide-react-native';
import { useTokenColor, type ColorToken } from '../../hooks/useTokenColor';
import { AppText } from '../atoms/AppText';
import { Button, type ButtonVariant } from '../atoms/Button';

export type EmptyStateVariant = 'cart' | 'search';

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
  circleClass: string;
  iconToken: ColorToken;
  actionVariant: ButtonVariant;
}

const VARIANT_STYLE: Record<EmptyStateVariant, VariantStyle> = {
  cart: {
    icon: ShoppingCart,
    circleClass: 'bg-secondary',
    iconToken: '--color-price',
    actionVariant: 'primary',
  },
  search: {
    icon: SearchX,
    circleClass: 'bg-primary-soft',
    iconToken: '--color-primary',
    actionVariant: 'secondary',
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
    <View className={`items-center gap-2.5 px-8 py-2 ${className}`}>
      <View
        className={`size-[72px] rounded-full items-center justify-center ${style.circleClass}`}
      >
        <Icon size={32} color={iconColor} strokeWidth={2} />
      </View>
      <AppText variant="subtitle" className="text-center">
        {title}
      </AppText>
      <AppText tone="muted" className="text-center">
        {message}
      </AppText>
      {actionLabel && onAction ? (
        <Button
          label={actionLabel}
          variant={style.actionVariant}
          onPress={onAction}
          className="mt-1 self-center"
        />
      ) : null}
    </View>
  );
}
