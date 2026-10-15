module.exports = {
  preset: '@react-native/jest-preset',
  roots: ['<rootDir>', '<rootDir>/../core'],
  moduleNameMapper: {
    '^@core/(.*)$': '<rootDir>/../core/$1',
    // Uniwind compiles CSS in Metro; Jest only needs the import to resolve.
    '\\.css$': '<rootDir>/__mocks__/styleMock.js',
  },
  // core/ has no node_modules; resolve its imports (zod, ...) from this app.
  modulePaths: ['<rootDir>/node_modules'],
  // Preset pattern plus packages whose react-native export condition is not CommonJS:
  // uniwind ships TypeScript source; immer and react-redux (used by RTK) ship ESM.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|uniwind|immer|react-redux)/)',
  ],
};
