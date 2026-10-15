import {
  CARD_MAX_FONT_SCALE,
  GRID_GAP,
  getCardTitleHeight,
  getProductCardHeight,
} from '../productGridLayout';

describe('getProductCardHeight', () => {
  it('keeps the 350 of the design at font scale 1', () => {
    expect(getProductCardHeight(1)).toBe(350);
    expect(getCardTitleHeight(1)).toBe(40);
  });

  it('grows with the font up to CARD_MAX_FONT_SCALE', () => {
    expect(getProductCardHeight(1.15)).toBeGreaterThan(350);
    // badge 25 · title 52 · price 37 · buttons 2 × 42 over the fixed 182.
    expect(getProductCardHeight(CARD_MAX_FONT_SCALE)).toBe(380);
    expect(getCardTitleHeight(CARD_MAX_FONT_SCALE)).toBe(52);
  });

  it('stops growing past the cap, so 2.0 uses the same height as 1.3', () => {
    expect(getProductCardHeight(2)).toBe(getProductCardHeight(CARD_MAX_FONT_SCALE));
  });

  it('never shrinks below the design with a smaller system font', () => {
    expect(getProductCardHeight(0.85)).toBe(350);
  });

  it('returns whole numbers so the row offsets add up exactly', () => {
    [1, 1.1, 1.15, 1.3, 2].forEach(scale => {
      expect(Number.isInteger(getProductCardHeight(scale) + GRID_GAP)).toBe(true);
    });
  });
});
