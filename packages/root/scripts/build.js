const rollupBuild = require("../../../scripts/build");

// don't bundle dependencies for es/cjs builds
const pkg = require("../package.json");
const deps = Object.keys(pkg.dependencies).map(key => key);

const base = {
  name: "HickoryRoot",
  input: "src/index.ts"
};

rollupBuild([
  [
    "ESM",
    {
      ...base,
      format: "esm",
      file: "dist/hickory-root.es.js",
      external: deps,
      safeModules: false
    },
    { NODE_ENV: "development", BABEL_ENV: "build" }
  ],

  [
    "CommonJS",
    {
      ...base,
      format: "cjs",
      file: "dist/hickory-root.js",
      external: deps,
      safeModules: false
    },
    { NODE_ENV: "development", BABEL_ENV: "build" }
  ],

  [
    "UMD",
    {
      ...base,
      format: "umd",
      file: "dist/hickory-root.umd.js"
    },
    { NODE_ENV: "development", BABEL_ENV: "build" }
  ],

  [
    "minimized UMD",
    {
      ...base,
      format: "umd",
      file: "dist/hickory-root.min.js",
      uglify: true
    },
    { NODE_ENV: "production", BABEL_ENV: "build" }
  ]
]);
