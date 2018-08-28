module.exports = {
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "js"],
  transform: {
    "\\.ts$": "<rootDir>/node_modules/ts-jest/preprocessor.js"
  },
  testMatch: ["<rootDir>/tests/*.spec.ts"],
  globals: {
    "ts-jest": {
      module: "commonjs"
    }
  },
  mapCoverage: true
};
