const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Only watch the mobile directory, exclude parent project files
config.watchFolders = [__dirname];

// Exclude parent project's dist, electron, and other non-mobile directories
config.resolver.blockList = [
  /.*\/dist\/.*/,
  /.*\/electron\/.*/,
  /.*\/backend\/.*/,
  /.*\/web\/.*/,
  /.*[/\\]\.\.\/node_modules\/.*/,
  // Block specific problematic files
  /.*[/\\]dist[/\\]main[/\\]index\.js/,
];

// Ensure node_modules resolution stays within mobile
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
];

module.exports = config;
