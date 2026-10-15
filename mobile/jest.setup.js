/* eslint-env jest */
// AsyncStorage ships an in-memory mock; the native module does not exist in Jest.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest'),
);
