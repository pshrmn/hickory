const rollupBuild = require("../../../scripts/build");

// don't bundle dependencies for es/cjs builds
const pkg = require("../package.json");
const deps = Object.keys(pkg.dependencies).map(key => key);
const depsString = deps.join(",");

rollupBuild(
  "ESM",
  { f: "esm", o: "dist/hickory-browser.mjs", e: depsString },
  { NODE_ENV: "development", BABEL_ENV: "build" }
);

rollupBuild(
  "CommonJS",
  { f: "cjs", o: "dist/hickory-browser.js", e: depsString },
  { NODE_ENV: "development", BABEL_ENV: "build" }
);

rollupBuild(
  "UMD",
  { f: "umd", o: "dist/hickory-browser.umd.js" },
  { NODE_ENV: "development", BABEL_ENV: "build" }
);

rollupBuild(
  "UMD min file",
  { f: "umd", o: "dist/hickory-browser.min.js" },
  { NODE_ENV: "production", BABEL_ENV: "build" }
);
