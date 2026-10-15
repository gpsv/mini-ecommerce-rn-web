const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

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

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
