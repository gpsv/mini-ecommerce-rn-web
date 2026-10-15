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
  // Preset pattern plus uniwind, whose react-native entry ships TypeScript source.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|uniwind)/)',
  ],
};
