// @ts-check
const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "tests",
  timeout: 30000,
  fullyParallel: true,
  reporter: [["list"]],
  use: { baseURL: "http://localhost:8123", browserName: "chromium", viewport: { width: 1280, height: 900 } },
  webServer: { command: "PORT=8123 node scripts/serve.mjs", url: "http://localhost:8123/test/", reuseExistingServer: true }
});
