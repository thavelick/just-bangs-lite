module.exports = {
  testDir: './tests/integration',
  use: {
    baseURL: 'http://localhost:8008',
  },
  webServer: {
    command: 'cd public_html && python -m http.server 8008',
    port: 8008,
    reuseExistingServer: !process.env.CI,
  },
};