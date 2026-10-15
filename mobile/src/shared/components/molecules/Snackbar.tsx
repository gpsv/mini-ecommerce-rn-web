import { useEffect } from 'react';
import { AccessibilityInfo, Platform, Pressable, Text, View } from 'react-native';
import { useTokenColor } from '../../hooks/useTokenColor';
import { getLegacyShadowStyle } from '../../platform/shadows';

export interface SnackbarProps {
  isVisible: boolean;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Position comes from the parent (e.g. 12 above the bottom bar). */
  className?: string;
}

/**
 * 07-Detalle-Agregado. Colors that are not tokens use the closest one (D31):
 * background = text color, link #A9C8F2 → primary-soft, its shadow → shadow-card.
 * Timing (3 s) belongs to the caller.
 */
export function Snackbar({
  isVisible,
  message,
  actionLabel,
  onAction,
  className = '',
}: SnackbarProps) {
  const rippleColor = useTokenColor('--color-primary-soft', 0.2);

  useEffect(() => {
    // Android reads accessibilityLiveRegion; iOS needs an explicit announcement.
    if (isVisible && Platform.OS === 'ios') {
      AccessibilityInfo.announceForAccessibility(message);
    }
  }, [isVisible, message]);

  if (!isVisible) {
    return null;
  }

  return (
    <View
      accessibilityLiveRegion="polite"
      className={`min-h-12 flex-row items-center justify-between gap-2 pl-4 pr-1 rounded-md bg-text shadow-card ${className}`}
      style={getLegacyShadowStyle('card')}
    >
      <Text className="flex-1 font-sans text-body text-primary-foreground">{message}</Text>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          android_ripple={{ color: rippleColor }}
          onPress={onAction}
          className="min-h-12 px-3 justify-center rounded-md overflow-hidden active:opacity-80"
        >
          <Text className="font-sans text-[14px] font-semibold text-primary-soft">
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
