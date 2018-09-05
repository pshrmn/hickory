const rollupBuild = require("../../../scripts/build");

rollupBuild(
  "ESM",
  { f: "esm", o: "dist/hickory-location-utils.mjs" },
  { NODE_ENV: "development", BABEL_ENV: "build" }
);

rollupBuild(
  "CommonJS",
  { f: "cjs", o: "dist/hickory-location-utils.js" },
  { NODE_ENV: "development", BABEL_ENV: "build" }
);

rollupBuild(
  "<script> file",
  { f: "iife", o: "dist/hickory-location-utils.umd.js" },
  { NODE_ENV: "development", BABEL_ENV: "build" }
);

rollupBuild(
  "<script> min file",
  { f: "iife", o: "dist/hickory-location-utils.min.js" },
  { NODE_ENV: "production", BABEL_ENV: "build" }
);
