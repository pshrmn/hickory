module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  testURL: "https://example.com",
  moduleFileExtensions: ["ts", "js"],
  testMatch: ["<rootDir>/tests/*.spec.ts"],
  globals: {
    "ts-jest": {
      module: "commonjs",
      diagnostics: false
    }
  }
};
