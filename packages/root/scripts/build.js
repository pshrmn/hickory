const rollupBuild = require("../../../scripts/build");

// don't bundle dependencies for es/cjs builds
const pkg = require("../package.json");
const deps = Object.keys(pkg.dependencies).map(key => key);
const depsString = deps.join(",");

rollupBuild(
  "ESM",
  { f: "esm", o: "dist/hickory-root.mjs", e: depsString },
  { NODE_ENV: "development", BABEL_ENV: "build" }
);

rollupBuild(
  "CommonJS",
  { f: "cjs", o: "dist/hickory-root.js", e: depsString },
  { NODE_ENV: "development", BABEL_ENV: "build" }
);

rollupBuild(
  "<script> file",
  { f: "iife", o: "dist/hickory-root.umd.js" },
  { NODE_ENV: "development", BABEL_ENV: "build" }
);

rollupBuild(
  "<script> min file",
  { f: "iife", o: "dist/hickory-root.min.js" },
  { NODE_ENV: "production", BABEL_ENV: "build" }
);
