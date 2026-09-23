import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  workers: 2,
  reporter: "list",
  use: {
    baseURL: process.env.TEST_BASE_URL || "http://localhost:3000",
    headless: true,
    screenshot: "only-on-failure",
  },
  projects: [360, 390, 430].map((width) => ({
    name: `${width}px`,
    use: { viewport: { width, height: 844 }, isMobile: true, hasTouch: true },
  })),
});
