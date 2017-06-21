const buble = require('rollup-plugin-buble');
const replace = require('rollup-plugin-replace');

const reporters = ['progress'];
const frameworks = ['jasmine'];
const plugins = [
  'karma-jasmine',
  'karma-chrome-launcher',
  'karma-rollup-plugin'
];

var customLaunchers = {
  // windows
  bs_chrome: {
    base: 'BrowserStack',
    browser: 'chrome',
    browser_version: '57',
    os: 'Windows',
    os_version: '10'
  },
  bs_firefox: {
    base: 'BrowserStack',
    browser: 'firefox',
    browser_version: '53',
    os: 'Windows',
    os_version: '10'
  },
  bs_ie_11: {
    base: 'BrowserStack',
    browser: 'ie',
    browser_version: '11.0',
    os: 'Windows',
    os_version: '10'
  },
  bs_edge: {
    base: 'BrowserStack',
    browser: 'edge',
    browser_version: '13',
    os: 'Windows',
    os_version: '10'
  },
  // os x
  bs_osx_safari: {
    base: 'BrowserStack',
    browser: 'safari',
    browser_version: '10',
    os: 'OS X',
    os_version: 'Sierra'
  },
  // ios
  bs_ios_safari: {
    base: 'BrowserStack',
    browser: 'Safari',
    os: 'iOS',
    os_version: '10.3',
    real_mobile: false
  },
  // android
  bs_android_chrome: {
    base: 'BrowserStack',
    browser: 'chrome',
    os: 'android',
    os_version: '4.4',
    real_mobile: false
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

  if (process.env.TRAVIS) {
    config.set({
      browsers: Object.keys(customLaunchers),
      singleRun: true,
      reporters: reporters.concat('BrowserStack'),
      plugins: plugins.concat('karma-browserstack-launcher'),
      browserStack: {
        project: 'hickory',
        username: process.env.BROWSERSTACK_USERNAME,
        accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
        build: process.env.TRAVIS_BUILD_NUMBER,
        name: process.env.TRAVIS_JOB_NUMBER
      },
      browserDisconnectTimeout: 10000,
      browserDisconnectTolerance: 3
    });
  }
}
