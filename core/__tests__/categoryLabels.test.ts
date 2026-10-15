import { getCategoryLabel } from '../catalog/categoryLabels';

describe('getCategoryLabel', () => {
  it.each([
    ['electronics', 'Electrónica'],
    ['jewelery', 'Joyería'],
    ["men's clothing", 'Ropa de hombre'],
    ["women's clothing", 'Ropa de mujer'],
  ])('labels %s as %s', (category, label) => {
    expect(getCategoryLabel(category)).toBe(label);
  });

  it('falls back to the raw value for an unknown category', () => {
    expect(getCategoryLabel('home')).toBe('home');
  });

  it('does not read inherited object keys', () => {
    expect(getCategoryLabel('constructor')).toBe('constructor');
  });
});
