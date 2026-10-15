import { useWindowDimensions } from 'react-native';
import { TEXT_METRICS } from '../../../shared/theme/typography';

/** 15-Specs, mobile listing. */
export const GRID_COLUMNS = 2;
export const GRID_GUTTER = 16;
export const GRID_GAP = 12;
/**
 * Initial estimate of ProductListHeader (search 12 + 48 · chips 12 + 40 + 12 ·
 * count 16 + 8) at font scale 1. The screen replaces it with the measured height.
 */
export const LIST_HEADER_HEIGHT = 148;

/**
 * The card is a 158 dp preview on a 360 dp screen: its text grows up to 1.3
 * (Android's largest size before 14) and the detail screen shows the rest unlimited.
 * The card scales its text itself (fixedFontScale): maxFontSizeMultiplier caps
 * fontSize but not lineHeight on RN 0.87 Android, so the height would not match.
 */
export const CARD_MAX_FONT_SCALE = 1.3;
/** Title slot: 2 lines of text-body (20 line height). */
export const CARD_TITLE_LINES = 2;

/** Image 132 · padding 10 + 10 · 3 gaps of 6 · buttons mt 4 · gap between buttons 8. */
const CARD_FIXED_HEIGHT = 132 + 20 + 18 + 4 + 8;
const BADGE_MIN_HEIGHT = 20;
const BADGE_PADDING_Y = 4;
const BUTTON_SM_MIN_HEIGHT = 40;
const BUTTON_PADDING_Y = 16;

export function getCardFontScale(fontScale: number): number {
  return Math.min(Math.max(fontScale, 1), CARD_MAX_FONT_SCALE);
}

export function getCardTitleHeight(fontScale: number): number {
  return Math.ceil(
    CARD_TITLE_LINES * TEXT_METRICS.body.lineHeight * getCardFontScale(fontScale),
  );
}

/**
 * Fixed per font scale so getItemLayout stays exact: 350 at 1.0, 380 from 1.3.
 * Exact because the card scales its text linearly by getCardFontScale.
 */
export function getProductCardHeight(fontScale: number): number {
  const scale = getCardFontScale(fontScale);
  const scaled = (lineHeight: number) => Math.ceil(lineHeight * scale);
  const badge = Math.max(
    BADGE_MIN_HEIGHT,
    scaled(TEXT_METRICS.caption.lineHeight) + BADGE_PADDING_Y,
  );
  const button = Math.max(
    BUTTON_SM_MIN_HEIGHT,
    scaled(TEXT_METRICS.buttonSm.lineHeight) + BUTTON_PADDING_Y,
  );
  return (
    CARD_FIXED_HEIGHT +
    badge +
    getCardTitleHeight(fontScale) +
    scaled(TEXT_METRICS.priceMd.lineHeight) +
    button * 2
  );
}

export interface ProductGridLayout {
  cardWidth: number;
  cardHeight: number;
  /** Text scale of the card: the system font scale capped at CARD_MAX_FONT_SCALE. */
  cardFontScale: number;
  /** Card + the gap below it (pb-3 on the column wrapper). */
  rowHeight: number;
}

/**
 * Width: (window − 2 gutters − gap) / 2 → 158 on a 360 dp screen. A computed
 * width instead of flex-1, so an odd last card does not stretch to the full row.
 * fontScale from useWindowDimensions updates if the system setting changes.
 */
export function useProductGridLayout(): ProductGridLayout {
  const { width, fontScale } = useWindowDimensions();
  const cardHeight = getProductCardHeight(fontScale);
  return {
    cardWidth: Math.floor((width - GRID_GUTTER * 2 - GRID_GAP) / GRID_COLUMNS),
    cardHeight,
    cardFontScale: getCardFontScale(fontScale),
    rowHeight: cardHeight + GRID_GAP,
  };
}
