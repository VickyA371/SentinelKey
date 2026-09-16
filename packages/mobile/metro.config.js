const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

// Monorepo root (two levels up from packages/mobile)
const monorepoRoot = path.resolve(__dirname, '../..');
const sharedPackage = path.resolve(monorepoRoot, 'packages/shared');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  // Watch the shared package for live changes
  watchFolders: [sharedPackage, monorepoRoot],

  resolver: {
    // Allow Metro to resolve packages from both the mobile node_modules
    // and the hoisted root node_modules (yarn workspaces)
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(monorepoRoot, 'node_modules'),
    ],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
