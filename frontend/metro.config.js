const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// S'assurer que Metro regarde bien dans le dossier actuel pour le dossier 'app'
config.projectRoot = __dirname;
config.watchFolders = [__dirname];

module.exports = config;
