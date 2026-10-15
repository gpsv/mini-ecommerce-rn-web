module.exports = {
  preset: '@react-native/jest-preset',
  roots: ['<rootDir>', '<rootDir>/../core'],
  setupFiles: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@core/(.*)$': '<rootDir>/../core/$1',
    // Uniwind compiles CSS in Metro; Jest only needs the import to resolve.
    '\\.css$': '<rootDir>/__mocks__/styleMock.js',
    // Jest resolves lucide's .mjs entry, which the preset does not transform: use its CommonJS build.
    '^lucide-react-native$':
      '<rootDir>/node_modules/lucide-react-native/dist/cjs/lucide-react-native.js',
  },
  // core/ has no node_modules; resolve its imports (zod, ...) from this app.
  modulePaths: ['<rootDir>/node_modules'],
  // Preset pattern plus packages whose react-native export condition is not CommonJS:
  // uniwind ships TypeScript source; immer and react-redux (used by RTK) ship ESM;
  // react-native-svg and async-storage's Jest mock ship ESM.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-native-async-storage|uniwind|immer|react-redux|react-native-svg)/)',
  ],
};
