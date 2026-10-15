import { formatPrice, multiplyCents, sumCents, toCents } from '../shared/money';

describe('toCents', () => {
  it('avoids floating point errors: 0.1 + 0.2 in cents equals 0.3', () => {
    expect(0.1 + 0.2).not.toBe(0.3);
    expect(toCents(0.1) + toCents(0.2)).toBe(toCents(0.3));
    expect(toCents(0.1) + toCents(0.2)).toBe(30);
  });

  it('converts real API prices', () => {
    expect(toCents(109.95)).toBe(10995);
    expect(toCents(999.99)).toBe(99999);
    expect(toCents(695)).toBe(69500);
    expect(toCents(0)).toBe(0);
  });
});

describe('multiplyCents', () => {
  it('multiplies cents by a quantity', () => {
    expect(multiplyCents(10995, 3)).toBe(32985);
    expect(multiplyCents(10995, 0)).toBe(0);
  });

  it('rejects non-integer values', () => {
    expect(() => multiplyCents(109.95, 2)).toThrow(RangeError);
    expect(() => multiplyCents(10995, 1.5)).toThrow(RangeError);
  });
});

describe('sumCents', () => {
  it('adds amounts and returns 0 for an empty list', () => {
    expect(sumCents([10995, 2230, 1])).toBe(13226);
    expect(sumCents([])).toBe(0);
  });

  it('rejects non-integer amounts', () => {
    expect(() => sumCents([100, 0.5])).toThrow(RangeError);
  });
});

describe('formatPrice', () => {
  it.each([
    [0, '$0.00'],
    [5, '$0.05'],
    [99, '$0.99'],
    [100, '$1.00'],
    [10995, '$109.95'],
    [99999, '$999.99'],
    [100000, '$1,000.00'],
    [123456, '$1,234.56'],
    [100000000, '$1,000,000.00'],
    [-123456, '-$1,234.56'],
  ])('formats %i cents as %s', (cents, expected) => {
    expect(formatPrice(cents)).toBe(expected);
  });

  it('rejects non-integer cents', () => {
    expect(() => formatPrice(10.5)).toThrow(RangeError);
  });
});
