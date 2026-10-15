import { useWindowDimensions } from 'react-native';

/** 15-Specs, mobile listing. */
export const GRID_COLUMNS = 2;
export const GRID_GUTTER = 16;
export const GRID_GAP = 12;
export const PRODUCT_CARD_HEIGHT = 350;
/** Row = card + the gap below it (pb-3 on the column wrapper). */
export const GRID_ROW_HEIGHT = PRODUCT_CARD_HEIGHT + GRID_GAP;
/** ProductListHeader: search 12 + 48 · chips 12 + 40 + 12 · count 16 + 8. */
export const LIST_HEADER_HEIGHT = 148;

/**
 * (window − 2 gutters − gap) / 2 → 158 on a 360 dp screen. A computed width
 * instead of flex-1, so an odd last card does not stretch to the full row.
 */
export function useProductCardWidth(): number {
  const { width } = useWindowDimensions();
  return Math.floor((width - GRID_GUTTER * 2 - GRID_GAP) / GRID_COLUMNS);
}
