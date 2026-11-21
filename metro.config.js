const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
config.resolver.unstable_conditionsByPlatform.web = [...new Set([...config.resolver.unstable_conditionsByPlatform.web, "react-native"])];
module.exports = config;
