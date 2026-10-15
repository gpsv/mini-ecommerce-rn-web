import { Platform } from 'react-native';
import { getLegacyShadowStyle } from '../shadows';

function mockPlatform(os: 'android' | 'ios', version: number | string) {
  jest.replaceProperty(Platform, 'OS', os);
  // Version is a getter in the React Native Jest preset.
  jest.spyOn(Platform, 'Version', 'get').mockReturnValue(version);
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe('getLegacyShadowStyle', () => {
  it('returns elevation on Android below API 28', () => {
    mockPlatform('android', 27);

    expect(getLegacyShadowStyle('card')).toEqual({ elevation: 2 });
    expect(getLegacyShadowStyle('bar')).toEqual({ elevation: 8 });
  });

  it('keeps boxShadow from Uniwind on Android API 28+', () => {
    mockPlatform('android', 28);

    expect(getLegacyShadowStyle('card')).toBeUndefined();
  });

  it('keeps boxShadow from Uniwind on iOS', () => {
    mockPlatform('ios', '17.0');

    expect(getLegacyShadowStyle('bar')).toBeUndefined();
  });
});
