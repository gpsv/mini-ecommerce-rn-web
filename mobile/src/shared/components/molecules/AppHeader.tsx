import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, House } from 'lucide-react-native';
import { useTokenColor } from '../../hooks/useTokenColor';
import { AppText } from '../atoms/AppText';
import { IconButton } from '../atoms/IconButton';

interface HomeHeaderProps {
  /** Catalog: logo + "MiniShop". */
  variant: 'home';
}

interface BackHeaderProps {
  /** Inner screens: back button + title. */
  variant: 'back';
  title: string;
  onBack: () => void;
  /** Checkout while processing: going back is blocked. */
  isBackDisabled?: boolean;
}

export type AppHeaderProps = (HomeHeaderProps | BackHeaderProps) & {
  /** Right slot, e.g. the cart button (it reads the store, so it comes from a feature). */
  rightAction?: ReactNode;
};

const APP_NAME = 'MiniShop';

function AppLogo() {
  const primaryColor = useTokenColor('--color-primary');
  return (
    <View className="flex-row items-center gap-2.5" accessible accessibilityRole="header">
      <View className="size-8 rounded-md bg-surface items-center justify-center">
        <House size={20} color={primaryColor} strokeWidth={2.2} />
      </View>
      <AppText variant="title" tone="onPrimary">
        {APP_NAME}
      </AppText>
    </View>
  );
}

/**
 * At least 56 high (min-h-header) below the status bar, so large fonts are not
 * clipped; the primary background goes edge to edge.
 */
export function AppHeader(props: AppHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View className="bg-primary" style={{ paddingTop: insets.top }}>
      {props.variant === 'home' ? (
        <View className="min-h-header flex-row items-center justify-between pl-4 pr-1">
          <AppLogo />
          {props.rightAction}
        </View>
      ) : (
        <View className="min-h-header flex-row items-center gap-1 px-1">
          <IconButton
            icon={ArrowLeft}
            accessibilityLabel="Regresar"
            variant="onPrimary"
            disabled={props.isBackDisabled}
            onPress={props.onBack}
          />
          <AppText
            accessibilityRole="header"
            tone="onPrimary"
            numberOfLines={1}
            className="flex-1 text-[18px] leading-6 font-semibold"
          >
            {props.title}
          </AppText>
          {props.rightAction}
        </View>
      )}
    </View>
  );
}
