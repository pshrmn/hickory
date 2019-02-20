const typescript = require("rollup-plugin-typescript2");
const resolve = require("rollup-plugin-node-resolve");
const customLaunchers = require("./config/karmaLaunchers");

module.exports = function(config) {
  const username = process.env.BROWSER_STACK_USERNAME;
  const accessKey = process.env.BROWSER_STACK_ACCESS_KEY;

  if (!username || !accessKey) {
    throw new Error(
      "BrowserStack environment variables not set; cannot run tests."
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
      build: process.env.TRAVIS_BUILD_NUMBER || "local",
      name: process.env.TRAVIS_JOB_NUMBER || "local",
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
          tsconfig: "config/tsconfig.json"
        }),
        resolve()
      ],
      output: {
        format: "iife",
        sourcemap: "inline"
      }
    }
  });
};
