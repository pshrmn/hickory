const buble = require('rollup-plugin-buble');
const replace = require('rollup-plugin-replace');

module.exports = function(config) {
  // Example set of browsers to run on Sauce Labs
  // Check out https://saucelabs.com/platforms for all browser/platform combos
  var customLaunchers = {
    sl_chrome: {
      base: 'SauceLabs',
      browserName: 'chrome',
      platform: 'Windows 7',
      version: '35'
    },
    sl_firefox: {
      base: 'SauceLabs',
      browserName: 'firefox',
      version: '30'
    },
    sl_ios_safari: {
      base: 'SauceLabs',
      browserName: 'iphone',
      platform: 'OS X 10.9',
      version: '7.1'
    },
    sl_ie_11: {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: 'Windows 8.1',
      version: '11'
    }
  };

  config.set({
    customLaunchers: customLaunchers,
    browsers: ['Chrome'],
    frameworks: ['mocha', 'chai'],
    reporters: ['mocha'],

    files: [
      'tests/integration/*.js'
    ],

    preprocessors: {
     'tests/integration/*.js': ['rollup']
    },

    rollupPreprocessor: {
      plugins: [
        replace({
          'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
        }),
        // having trouble with babel, but this works
        buble()
      ],
      format: 'iife',
      sourceMap: 'inline'
    },

    plugins: [
      'karma-mocha',
      'karma-chai',
      'karma-chrome-launcher',
      'karma-mocha-reporter',
      'karma-rollup-plugin'
    ]
    
  });

  if (process.env.USE_CLOUD) {
    config.set({

      // The rest of your karma config is here
      // ...
      sauceLabs: {
          testName: 'Web App Unit Tests'
      },
      browsers: Object.keys(customLaunchers),
      reporters: ['dots', 'saucelabs'],
      singleRun: true
    });
  }
}
