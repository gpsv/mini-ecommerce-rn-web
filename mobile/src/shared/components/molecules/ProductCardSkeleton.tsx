import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { getLegacyShadowStyle } from '../../platform/shadows';

export interface ProductCardSkeletonProps {
  className?: string;
}

const PULSE_DURATION_MS = 700;
const MIN_OPACITY = 0.5;

/**
 * Same layout as ProductCard (02-Listado-Cargando). The design uses a moving
 * gradient; RN has no gradients without another library, so it pulses opacity.
 */
export function ProductCardSkeleton({ className = '' }: ProductCardSkeletonProps) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: MIN_OPACITY,
          duration: PULSE_DURATION_MS,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: PULSE_DURATION_MS,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className={`bg-surface rounded-lg shadow-card overflow-hidden ${className}`}
      style={getLegacyShadowStyle('card')}
    >
      <Animated.View style={{ opacity }}>
        <View className="h-[132px] bg-skeleton" />
        <View className="p-2.5 gap-1.5">
          <View className="w-[84px] h-5 rounded-full bg-skeleton" />
          <View className="h-3.5 mt-[3px] rounded-sm bg-skeleton" />
          <View className="w-[70%] h-3.5 mt-[3px] rounded-sm bg-skeleton" />
          <View className="w-[72px] h-[22px] mt-1.5 rounded-sm bg-skeleton" />
          <View className="h-10 mt-1 rounded-md bg-skeleton" />
          <View className="h-10 mt-0.5 rounded-md bg-skeleton" />
        </View>
      </Animated.View>
    </View>
  );
}
