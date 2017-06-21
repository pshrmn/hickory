const buble = require('rollup-plugin-buble');
const replace = require('rollup-plugin-replace');

const reporters = ['progress'];
const frameworks = ['jasmine'];
const plugins = [
  'karma-jasmine',
  'karma-chrome-launcher',
  'karma-rollup-plugin'
];

// Example set of browsers to run on Sauce Labs
// Check out https://saucelabs.com/platforms for all browser/platform combos
var customLaunchers = {
  // windows
  sl_chrome: {
    base: 'SauceLabs',
    browserName: 'chrome',
    platform: 'Windows 10',
    version: '57'
  },
  sl_firefox: {
    base: 'SauceLabs',
    browserName: 'firefox',
    version: '53'
  },
  sl_ie_11: {
    base: 'SauceLabs',
    browserName: 'internet explorer',
    platform: 'Windows 10',
    version: '11'
  },
  sl_edge: {
    base: 'SauceLabs',
    browserName: 'edge',
    platform: 'Windows 10',
    version: '13'
  },
  // os x
  sl_osx_safari: {
    base: 'SauceLabs',
    browserName: 'safari',
    platform: 'OS X 10.12',
    version: '10'
  },
  // ios
  sl_ios_safari: {
    base: 'SauceLabs',
    browserName: 'Safari',
    platform: 'iOS 10'
  },
  // android
  sl_android_chrome: {
    base: 'SauceLabs',
    browserName: 'Android',
    platform: 'Android 6.0'
  }
};

module.exports = function(config) {
  config.set({
    customLaunchers: customLaunchers,
    browsers: ['Chrome'],
    frameworks: frameworks,
    reporters: reporters,

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

    plugins: plugins
    
  });

  if (process.env.USE_CLOUD) {
    config.set({

      // The rest of your karma config is here
      // ...
      sauceLabs: {
        testName: 'Hickory Browser Tests'
      },
      browsers: Object.keys(customLaunchers),
      reporters: reporters.concat('saucelabs'),
      singleRun: true
    });
  }
}
