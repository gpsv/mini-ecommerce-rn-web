import { getFirstName } from '../checkout/getFirstName';

describe('getFirstName', () => {
  it('returns the first word of the full name', () => {
    expect(getFirstName('María López')).toBe('María');
  });

  it('ignores surrounding and repeated spaces', () => {
    expect(getFirstName('   Ana   Sofía  Ruiz ')).toBe('Ana');
  });

  it('returns an empty string for a blank name', () => {
    expect(getFirstName('   ')).toBe('');
  });
});
