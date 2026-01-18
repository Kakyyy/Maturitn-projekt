const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

const vendoredBodyHighlighter = path.resolve(
  projectRoot,
  'vendor/react-native-body-highlighter'
);

config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  'react-native-body-highlighter': vendoredBodyHighlighter,
};

config.watchFolders = [...(config.watchFolders || []), vendoredBodyHighlighter];

module.exports = config;
