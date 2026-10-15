import type { TextStyle } from 'react-native';

export interface TextMetrics {
  fontSize: number;
  lineHeight: number;
}

/**
 * Mirrors the type scale of design/tokens.css (and the Button sizes) for
 * layouts that compute text heights in JS. Keep in sync with the tokens.
 */
export const TEXT_METRICS = {
  caption: { fontSize: 12, lineHeight: 16 },
  body: { fontSize: 14, lineHeight: 20 },
  priceSm: { fontSize: 18, lineHeight: 24 },
  priceMd: { fontSize: 22, lineHeight: 28 },
  priceLg: { fontSize: 28, lineHeight: 34 },
  priceXl: { fontSize: 36, lineHeight: 44 },
  buttonSm: { fontSize: 14, lineHeight: 20 },
  buttonMd: { fontSize: 15, lineHeight: 20 },
  buttonLg: { fontSize: 16, lineHeight: 24 },
} as const satisfies Record<string, TextMetrics>;

export interface FixedScaleTextProps {
  allowFontScaling: false;
  style: Pick<TextStyle, 'fontSize' | 'lineHeight'>;
}

/**
 * Scales a text by a given factor and ignores the system font scale. Used where
 * the layout computes its height in JS (ProductCard): maxFontSizeMultiplier caps
 * fontSize but not lineHeight on RN 0.87 Android, so heights would not match.
 */
export function getFixedScaleTextProps(
  metrics: TextMetrics,
  scale: number,
): FixedScaleTextProps {
  return {
    allowFontScaling: false,
    style: {
      fontSize: metrics.fontSize * scale,
      lineHeight: metrics.lineHeight * scale,
    },
  };
}
