const rollupBuild = require("../../../scripts/build");

rollupBuild(
  "ESM",
  { f: "esm", o: "dist/hickory-dom-utils.mjs" },
  { NODE_ENV: "development", BABEL_ENV: "build" }
);

rollupBuild(
  "CommonJS",
  { f: "cjs", o: "dist/hickory-dom-utils.js" },
  { NODE_ENV: "development", BABEL_ENV: "build" }
);

rollupBuild(
  "UMD file",
  { f: "umd", o: "dist/hickory-dom-utils.umd.js" },
  { NODE_ENV: "development", BABEL_ENV: "build" }
);

rollupBuild(
  "UMD min file",
  { f: "umd", o: "dist/hickory-dom-utils.min.js" },
  { NODE_ENV: "production", BABEL_ENV: "build" }
);
