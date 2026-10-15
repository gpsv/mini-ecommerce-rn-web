module.exports = {
  preset: '@react-native/jest-preset',
  roots: ['<rootDir>', '<rootDir>/../core'],
  moduleNameMapper: {
    '^@core/(.*)$': '<rootDir>/../core/$1',
  },
  // core/ has no node_modules; resolve its imports (zod, ...) from this app.
  modulePaths: ['<rootDir>/node_modules'],
};
