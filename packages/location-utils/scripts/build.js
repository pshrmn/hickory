const rollupBuild = require("../../../scripts/build");

// don't bundle dependencies for es/cjs builds
// const pkg = require("../package.json");
// const deps = Object.keys(pkg.dependencies).map(key => key);

const base = {
  name: "HickoryLocationUtils",
  input: "src/index.ts"
};

rollupBuild([
  [
    "ESM",
    {
      ...base,
      format: "esm",
      file: "dist/hickory-location-utils.mjs",
      //external: deps,
      safeModules: false
    },
    { NODE_ENV: "development", BABEL_ENV: "build" }
  ],

  [
    "CommonJS",
    {
      ...base,
      format: "cjs",
      file: "dist/hickory-location-utils.js",
      //external: deps,
      safeModules: false
    },
    { NODE_ENV: "development", BABEL_ENV: "build" }
  ],

  [
    "UMD",
    {
      ...base,
      format: "umd",
      file: "dist/hickory-location-utils.umd.js"
    },
    { NODE_ENV: "development", BABEL_ENV: "build" }
  ],

  [
    "minimized UMD",
    {
      ...base,
      format: "umd",
      file: "dist/hickory-location-utils.min.js",
      uglify: true
    },
    { NODE_ENV: "production", BABEL_ENV: "build" }
  ]
]);
