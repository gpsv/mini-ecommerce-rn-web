import { ActivityIndicator } from 'react-native';
import { useTokenColor, type ColorToken } from '../../hooks/useTokenColor';
import {
  getActivityIndicatorSize,
  type SpinnerSize,
} from '../../platform/spinnerSize';

export type SpinnerTone = 'primary' | 'onPrimary' | 'onSecondary';

export interface SpinnerProps {
  size?: SpinnerSize;
  tone?: SpinnerTone;
  /** Only for a standalone spinner; inside a Button the label already says it. */
  accessibilityLabel?: string;
}

const TONE_TOKEN: Record<SpinnerTone, ColorToken> = {
  primary: '--color-primary',
  onPrimary: '--color-primary-foreground',
  onSecondary: '--color-secondary-foreground',
};

export function Spinner({
  size = 24,
  tone = 'primary',
  accessibilityLabel,
}: SpinnerProps) {
  const color = useTokenColor(TONE_TOKEN[tone]);
  return (
    <ActivityIndicator
      size={getActivityIndicatorSize(size)}
      color={color}
      accessible={accessibilityLabel !== undefined}
      accessibilityLabel={accessibilityLabel}
    />
  );
}
