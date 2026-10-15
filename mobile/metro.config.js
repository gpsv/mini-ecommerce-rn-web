const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withUniwindConfig } = require('uniwind/metro');

const corePath = path.resolve(__dirname, '../core');
const designPath = path.resolve(__dirname, '../design');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * core/ and design/ live outside this app and have no node_modules:
 * - watchFolders lets Metro read and watch them.
 * - nodeModulesPaths resolves their imports (zod, react, ...) from this app,
 *   so there is a single runtime copy of react and react-redux.
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  watchFolders: [corePath, designPath],
  resolver: {
    nodeModulesPaths: [path.resolve(__dirname, 'node_modules')],
  },
};

// Uniwind must be the outermost wrapper (https://docs.uniwind.dev/quickstart).
module.exports = withUniwindConfig(
  mergeConfig(getDefaultConfig(__dirname), config),
  {
    cssEntryFile: './src/app/global.css',
    dtsFile: './src/uniwind-types.d.ts',
  },
);
