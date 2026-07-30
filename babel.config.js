module.exports = function (api) {
  const isProduction = api.env('production');
  // Recompute config when the build env changes (dev vs production).
  api.cache.using(() => process.env.NODE_ENV);

  return {
    presets: ['module:@react-native/babel-preset'],
    plugins: [
      // Strip all console.* calls from production bundles so debug output —
      // which may include sensitive data — never reaches device logs. Kept in
      // development. (Belt-and-suspenders alongside utils/logger's __DEV__ gate.)
      ...(isProduction ? [['transform-remove-console']] : []),
      // react-native-worklets/plugin MUST remain the LAST plugin.
      'react-native-worklets/plugin',
    ],
  };
};
