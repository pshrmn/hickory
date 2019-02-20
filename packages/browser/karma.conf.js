const typescript = require("rollup-plugin-typescript2");
const resolve = require("rollup-plugin-node-resolve");
const customLaunchers = require("../../config/karmaLaunchers");

const reporters = ["progress"];
const frameworks = ["jasmine"];
const plugins = [
  "karma-jasmine",
  "karma-chrome-launcher",
  "karma-rollup-preprocessor"
];

module.exports = function(config) {
  config.set({
    customLaunchers: customLaunchers,
    browsers: ["Chrome"],
    frameworks: frameworks,
    reporters: reporters,

    files: ["tests/integration/*.ts"],

    preprocessors: {
      "tests/integration/*.ts": ["rollup"]
    },

    mime: {
      "text/x-typescript": ["ts", "tsx"]
    },

    rollupPreprocessor: {
      plugins: [
        typescript({
          tsconfig: "tests/integration/tsconfig.json"
        }),
        resolve()
      ],
      output: {
        format: "iife",
        sourcemap: "inline"
      }
    },

    plugins: plugins
  });

  // if (process.env.TRAVIS) {
  config.set({
    browsers: Object.keys(customLaunchers),
    singleRun: true,
    reporters: reporters.concat("BrowserStack"),
    plugins: plugins.concat("karma-browserstack-launcher"),
    browserStack: {
      project: "hickory",
      username: process.env.BROWSER_STACK_USERNAME,
      accessKey: process.env.BROWSER_STACK_ACCESS_KEY,
      build: process.env.TRAVIS_BUILD_NUMBER,
      name: process.env.TRAVIS_JOB_NUMBER,
      video: false,
      timeout: 120
    },
    browserDisconnectTimeout: 10000,
    browserDisconnectTolerance: 1
  });
  // }
};
