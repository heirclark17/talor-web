const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Get the parent project root
const projectRoot = path.resolve(__dirname, '..');

// Only watch the mobile directory
config.watchFolders = [__dirname];

// Exclude parent project's dist, electron, and other non-mobile directories
config.resolver.blockList = [
  // Block parent project directories
  new RegExp(`${projectRoot.replace(/[\\]/g, '/')}/(dist|electron|backend|web)/.*`),
  new RegExp(`${projectRoot.replace(/[\\]/g, '\\\\')}\\\\(dist|electron|backend|web)\\\\.*`),
];

// Ensure node_modules resolution includes nested packages
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(__dirname, 'node_modules/react-native/node_modules'),
];

// Map nested dependencies that Metro has trouble finding
config.resolver.extraNodeModules = {
  '@react-native/virtualized-lists': path.resolve(
    __dirname,
    'node_modules/react-native/node_modules/@react-native/virtualized-lists'
  ),
};

module.exports = config;
