const rollupBuild = require("../../../scripts/build");

// don't bundle dependencies for es/cjs builds
// const pkg = require("../package.json");
// const deps = Object.keys(pkg.dependencies).map(key => key);

const base = {
  name: "HickoryDOMUtils",
  input: "src/index.ts"
};

rollupBuild([
  [
    "ESM",
    {
      ...base,
      format: "esm",
      file: "dist/hickory-dom-utils.es.js",
      safeModules: false
    },
    { NODE_ENV: "development", BABEL_ENV: "build" }
  ],

  [
    "CommonJS",
    {
      ...base,
      format: "cjs",
      file: "dist/hickory-dom-utils.js",
      safeModules: false
    },
    { NODE_ENV: "development", BABEL_ENV: "build" }
  ],

  [
    "UMD",
    {
      ...base,
      format: "umd",
      file: "dist/hickory-dom-utils.umd.js"
    },
    { NODE_ENV: "development", BABEL_ENV: "build" }
  ],

  [
    "minimized UMD",
    {
      ...base,
      format: "umd",
      file: "dist/hickory-dom-utils.min.js",
      uglify: true
    },
    { NODE_ENV: "production", BABEL_ENV: "build" }
  ]
]);
