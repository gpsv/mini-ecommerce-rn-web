import { Platform } from 'react-native';

export type SpinnerSize = 16 | 20 | 24 | 32;

/** iOS ActivityIndicator only accepts small (20) or large (36); Android takes dp. */
export function getActivityIndicatorSize(
  size: SpinnerSize,
): number | 'small' | 'large' {
  return Platform.select<number | 'small' | 'large'>({
    ios: size >= 32 ? 'large' : 'small',
    default: size,
  });
}
