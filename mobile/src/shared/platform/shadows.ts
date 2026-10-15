import { Platform, type ViewStyle } from 'react-native';

export type ShadowLevel = 'card' | 'bar';

/** Android renders boxShadow (shadow-card / shadow-bar via Uniwind) from API 28. */
const BOX_SHADOW_MIN_ANDROID_API = 28;

/** Elevation equivalents of the tokens in design/tokens.css. */
const LEGACY_ELEVATION: Record<ShadowLevel, number> = {
  card: 2,
  bar: 8,
};

function isLegacyAndroid(): boolean {
  return (
    Platform.OS === 'android' &&
    typeof Platform.Version === 'number' &&
    Platform.Version < BOX_SHADOW_MIN_ANDROID_API
  );
}

/**
 * Fallback for Android < 9, where boxShadow is not drawn: returns elevation.
 * Everywhere else returns undefined and the shadow-* className applies.
 * The view needs a background color (e.g. bg-surface) for elevation to show.
 */
export function getLegacyShadowStyle(
  level: ShadowLevel,
): ViewStyle | undefined {
  return isLegacyAndroid() ? { elevation: LEGACY_ELEVATION[level] } : undefined;
}
