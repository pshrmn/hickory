let typescript = require("rollup-plugin-typescript2");
let resolve = require("rollup-plugin-node-resolve");
let commonjs = require("rollup-plugin-commonjs");

let customLaunchers = {
  // windows
  bs_chrome: {
    base: "BrowserStack",
    browser: "chrome",
    browser_version: "63",
    os: "Windows",
    os_version: "10"
  },
  bs_firefox: {
    base: "BrowserStack",
    browser: "firefox",
    browser_version: "57",
    os: "Windows",
    os_version: "10"
  },
  bs_ie_11: {
    base: "BrowserStack",
    browser: "ie",
    browser_version: "11.0",
    os: "Windows",
    os_version: "10"
  },
  bs_edge: {
    base: "BrowserStack",
    browser: "edge",
    browser_version: "16",
    os: "Windows",
    os_version: "10"
  },
  // os x
  bs_osx_safari: {
    base: "BrowserStack",
    browser: "safari",
    browser_version: "12",
    os: "OS X",
    os_version: "Mojave"
  }
  /*
  // ios
  bs_ios_safari: {
    base: "BrowserStack",
    browser: "safari",
    os: "iOS",
    os_version: "11.0",
    device: "iPhone 8",
    real_mobile: false
  },
  // android
  bs_android_chrome: {
    base: "BrowserStack",
    browser: "chrome",
    os: "android",
    os_version: "7.0",
    device: "Samsung Galaxy S8",
    real_mobile: true
  }
  */
};

let tsConfig = {
  compilerOptions: {
    lib: ["es5", "es6", "dom"],
    target: "es5",
    module: "es6",
    allowSyntheticDefaultImports: true,
    moduleResolution: "Node",
    types: ["jasmine", "node"]
  },
  exclude: ["node_modules"]
};

module.exports = function(config) {
  let username = process.env.BROWSER_STACK_USERNAME;
  let accessKey = process.env.BROWSER_STACK_ACCESS_KEY;

  if (!username || !accessKey) {
    throw new Error(
      "Cannot run tests: BrowserStack environment variables not set."
    );
  }

  config.set({
    frameworks: ["jasmine"],
    reporters: ["progress", "BrowserStack"],
    plugins: [
      "karma-jasmine",
      "karma-rollup-preprocessor",
      "karma-browserstack-launcher"
    ],

    browsers: Object.keys(customLaunchers),
    customLaunchers: customLaunchers,
    singleRun: true,

    browserStack: {
      project: "hickory",
      username: username,
      accessKey: accessKey,
      build: process.env.CIRCLE_BUILD_NUM || "local",
      name: process.env.CIRCLE_JOB || "local",
      video: false,
      timeout: 120
    },
    browserDisconnectTimeout: 10000,
    browserDisconnectTolerance: 1,

    files: [
      "packages/browser/tests/integration/*.ts",
      "packages/hash/tests/integration/*.ts"
    ],

    preprocessors: {
      "packages/browser/tests/integration/*.ts": ["rollup"],
      "packages/hash/tests/integration/*.ts": ["rollup"]
    },

    mime: {
      "text/x-typescript": ["ts", "tsx"]
    },

    rollupPreprocessor: {
      plugins: [
        typescript({
          tsconfigDefaults: tsConfig
        }),
        resolve(),
        commonjs({
          include: /node_modules/
        })
      ],
      output: {
        format: "iife",
        sourcemap: false
      }
    }
  });
};
