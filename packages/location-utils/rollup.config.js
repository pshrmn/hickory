const plugins = require("../../rollup/plugins");
const getDeps = require("../../rollup/deps");

const pkg = require("./package.json");
const deps = getDeps(pkg);

const input = "src/index.ts";
const sourcemap = false;
const name = "HickoryLocationUtils";

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
      file: "dist/hickory-location-utils.es.js",
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
      file: "dist/hickory-location-utils.js",
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
      file: "dist/hickory-location-utils.umd.js",
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
      file: "dist/hickory-location-utils.min.js",
      sourcemap
    }
  }
];
