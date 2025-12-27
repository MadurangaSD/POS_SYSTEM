module.exports = {
  testEnvironment: "node",
  coverageDirectory: "coverage",
  collectCoverageFrom: ["src/**/*.js", "!src/index.js", "!src/models/database.js"],
  testMatch: ["**/tests/**/*.test.js"],
  verbose: true,
};
