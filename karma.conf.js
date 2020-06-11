/* eslint-disable import/no-extraneous-dependencies */
const webpack = require('webpack');
const dotenvSafe = require('dotenv-safe');
const path = require('path');
const fs = require('fs');

module.exports = (config) => {
  config.set({
    frameworks: ['mocha', 'chai'],
    files: [
      'karma.test.loader.js',
      'tests/functional/wallet.js',
    ],
    preprocessors: {
      'karma.test.loader.js': ['webpack'],
      'tests/functional/wallet.js': ['webpack'],
    },
    webpack: {
      mode: 'development',
      optimization: {
        minimize: false,
      },
      plugins: [
        new webpack.EnvironmentPlugin(
          dotenvSafe.parse(
            fs.readFileSync(
              path.resolve(__dirname, '.env'),
            ),
          ),
        ),
      ],
      node: {
        fs: 'empty',
      },
    },
    reporters: ['mocha'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['ChromeHeadless', 'FirefoxHeadless'],
    singleRun: false,
    concurrency: Infinity,
    plugins: [
      'karma-mocha',
      'karma-mocha-reporter',
      'karma-chai',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-webpack',
    ],
    customLaunchers: {
      FirefoxHeadless: {
        base: 'Firefox',
        flags: ['-headless'],
      },
    },
  });
};
