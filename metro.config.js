const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // expo-font 14: Font.js импортирует ./server; на нативной сборке подставляем заглушку
  if (
    platform !== 'web' &&
    moduleName === './server' &&
    context.originModulePath &&
    context.originModulePath.replace(/\\/g, '/').includes('expo-font/build/Font.js')
  ) {
    return {
      filePath: path.resolve(__dirname, 'metro-font-server-stub.js'),
      type: 'sourceFile',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
