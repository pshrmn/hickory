let plugins = require("../../rollup/plugins");
let getDeps = require("../../rollup/deps");

let pkg = require("./package.json");
let deps = getDeps(pkg);

let input = "src/index.ts";
let sourcemap = false;
let name = "HickoryRoot";

module.exports = [
  {
    input,
    external: deps,
    plugins: [
      plugins.typescript,
      plugins.resolveNode,
      plugins.commonjs,
      plugins.sizeSnapshot
    ],
    output: {
      format: "esm",
      file: "dist/hickory-root.es.js",
      sourcemap
    }
  },

  {
    input,
    external: deps,
    plugins: [
      plugins.typescript,
      plugins.resolveNode,
      plugins.commonjs,
      plugins.sizeSnapshot
    ],
    output: {
      format: "cjs",
      file: "dist/hickory-root.js",
      sourcemap
    }
  },

  {
    input,
    plugins: [
      plugins.typescript,
      plugins.replaceWithDevelopment,
      plugins.resolveNode,
      plugins.commonjs,
      plugins.sizeSnapshot
    ],
    output: {
      name: name,
      format: "umd",
      file: "dist/hickory-root.umd.js",
      sourcemap
    }
  },

  {
    input,
    plugins: [
      plugins.typescript,
      plugins.replaceWithProduction,
      plugins.resolveNode,
      plugins.commonjs,
      plugins.sizeSnapshot,
      plugins.minify
    ],
    output: {
      name: name,
      format: "umd",
      file: "dist/hickory-root.min.js",
      sourcemap
    }
  }
];
