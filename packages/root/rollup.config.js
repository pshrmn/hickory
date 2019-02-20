const plugins = require("../../rollup/plugins");
const getDeps = require("../../rollup/deps");

const pkg = require("./package.json");
const deps = getDeps(pkg);

const input = "src/index.ts";
const sourcemap = false;
const name = "HickoryRoot";

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
