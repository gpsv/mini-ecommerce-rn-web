const path = require('path');

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // zod 4 ships `export * as ns from`, which @react-native/babel-preset does not transform.
    '@babel/plugin-transform-export-namespace-from',
    [
      'module-resolver',
      {
        // Metro ignores tsconfig paths; this rewrites @core/* to a relative path.
        alias: {
          '@core': path.resolve(__dirname, '../core'),
        },
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
      },
    ],
  ],
};
