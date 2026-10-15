import { useState } from 'react';
import { Image, View } from 'react-native';
import { ImageOff } from 'lucide-react-native';
import { useTokenColor } from '../../hooks/useTokenColor';
import { AppText } from './AppText';

export type ProductImageVariant = 'card' | 'detail' | 'thumb';

export interface ProductImageProps {
  uri: string;
  /** Product title, read by screen readers. */
  accessibilityLabel: string;
  /** Padding from 15-Specs: card 12 · detail 24 · thumb 6. */
  variant?: ProductImageVariant;
  /** Size and radius come from the parent (e.g. "h-[132px]"). */
  className?: string;
}

const PADDING_CLASS: Record<ProductImageVariant, string> = {
  card: 'p-3',
  detail: 'p-6',
  thumb: 'p-1.5',
};

const PLACEHOLDER_ICON_SIZE: Record<ProductImageVariant, number> = {
  card: 32,
  detail: 48,
  thumb: 24,
};

export function ProductImage({
  uri,
  accessibilityLabel,
  variant = 'card',
  className = '',
}: ProductImageProps) {
  // Keyed by uri: a new image gets a fresh attempt without an effect.
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const placeholderColor = useTokenColor('--color-disabled-foreground');
  const hasError = failedUri === uri;

  if (hasError) {
    return (
      <View
        accessible
        accessibilityRole="image"
        accessibilityLabel={`${accessibilityLabel}: imagen no disponible`}
        className={`items-center justify-center gap-1.5 bg-skeleton ${PADDING_CLASS[variant]} ${className}`}
      >
        <ImageOff
          size={PLACEHOLDER_ICON_SIZE[variant]}
          color={placeholderColor}
          strokeWidth={1.8}
        />
        {variant === 'thumb' ? null : (
          <AppText variant="caption" className="text-center">
            Imagen no disponible
          </AppText>
        )}
      </View>
    );
  }

  return (
    <View
      className={`items-center justify-center bg-surface ${PADDING_CLASS[variant]} ${className}`}
    >
      <Image
        source={{ uri }}
        resizeMode="contain"
        accessible
        accessibilityRole="image"
        accessibilityLabel={accessibilityLabel}
        onError={() => setFailedUri(uri)}
        className="w-full h-full"
      />
    </View>
  );
}
