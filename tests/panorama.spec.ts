import { test, expect } from "./fixtures";

test("all generated room panoramas render without page overflow", async ({
  page,
  request,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const [id, title] of [
    ["living-room", "Living Room"],
    ["bedroom", "Bedroom"],
    ["kitchen", "Kitchen"],
  ]) {
    const response = await request.get(`/panoramas/${id}-panorama.png`);
    expect(response.ok()).toBeTruthy();
    const png = await response.body();
    expect(png.readUInt32BE(16)).toBe(png.readUInt32BE(20) * 2);
    await page.goto(`/tour/${id}`);
    await expect(page.locator(".tour-page")).toHaveAttribute(
      "data-status",
      "ready",
      { timeout: 20000 },
    );
    await expect(
      page.getByRole("heading", { name: `${title}.`, exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Main navigation" }),
    ).toHaveCount(0);
    await expect(page.locator(".panorama-surface canvas")).toBeVisible();
    expect(
      await page
        .locator(".app-scroll")
        .evaluate((element) => element.scrollWidth <= element.clientWidth),
    ).toBeTruthy();
    await page.screenshot({
      path: `test-results/${test.info().project.name}-tour-${id}.png`,
      animations: "disabled",
    });
  }
  expect(errors).toEqual([]);
});

test("dragging, keyboard, tour playback, zoom, reset, and room switching work", async ({
  page,
}) => {
  await page.goto("/room/living-room");
  await page.getByRole("link", { name: "Explore 360°", exact: true }).click();
  await expect(page.locator(".tour-page")).toHaveAttribute(
    "data-status",
    "ready",
    { timeout: 20000 },
  );
  const direction = page.getByLabel("Viewing direction");
  await expect(direction).toHaveText("0°");
  await page.getByRole("button", { name: "Play tour" }).click();
  await expect(page.locator(".tour-page")).toHaveAttribute(
    "data-playing",
    "true",
  );
  await expect(direction).not.toHaveText("0°");
  await page.getByRole("button", { name: "Tour speed 1×" }).click();
  await expect(
    page.getByRole("button", { name: "Tour speed 1.5×" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Pause tour" }).click();
  await expect(page.locator(".tour-page")).toHaveAttribute(
    "data-playing",
    "false",
  );
  await page.getByRole("button", { name: "Reset view" }).click();
  await expect(direction).toHaveText("0°");

  const region = page.getByRole("region", { name: /Interactive 360 degree/ });
  await region.focus();
  await region.press("ArrowRight");
  await expect(direction).toHaveText("12°");
  await region.press("Home");
  await expect(direction).toHaveText("0°");

  await page.mouse.move(130, 240);
  await page.mouse.down();
  await page.mouse.move(260, 260, { steps: 10 });
  await page.mouse.up();
  await expect(direction).not.toHaveText("0°");
  await page.getByRole("button", { name: "Reset view" }).click();
  await expect(direction).toHaveText("0°");
  for (let index = 0; index < 4; index++)
    await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Zoom in", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Reset view" }).click();
  await expect(
    page.getByRole("button", { name: "Zoom in", exact: true }),
  ).toBeEnabled();
  const touch = await page.context().newCDPSession(page);
  await touch.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: 100, y: 220, id: 0 }],
  });
  await touch.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: 230, y: 230, id: 0 }],
  });
  await touch.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await touch.detach();
  await expect(direction).not.toHaveText("0°");
  await page.getByRole("button", { name: "Expand view" }).click();
  await expect(
    page.getByRole("button", { name: "Exit expanded view" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Exit expanded view" }).click();
  await expect(page.getByRole("button", { name: "Expand view" })).toBeVisible();
  await page
    .getByRole("link", { name: "Explore Bedroom in 360 degrees" })
    .click();
  await expect(page).toHaveURL(/\/tour\/bedroom$/);
  await expect(page.locator(".tour-page")).toHaveAttribute(
    "data-status",
    "ready",
  );
  await page.getByRole("button", { name: "About the 360 degree tour" }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "AI-generated concept interiors",
  );
  await page.keyboard.press("Escape");
  await page.getByRole("link", { name: "Back to room", exact: true }).click();
  await expect(page).toHaveURL(/\/room\/bedroom$/);
});

test("a missing panorama can recover through retry", async ({ page }) => {
  await page.route("**/panoramas/living-room-panorama.png", (route) =>
    route.fulfill({ status: 404, body: "Not found" }),
  );
  await page.goto("/tour/living-room");
  await expect(page.locator(".tour-page")).toHaveAttribute(
    "data-status",
    "error",
  );
  await expect(page.getByRole("button", { name: "Play tour" })).toBeDisabled();
  await expect(
    page.getByRole("link", { name: "Open the panorama image" }),
  ).toHaveAttribute("href", "/panoramas/living-room-panorama.png");
  await page.unroute("**/panoramas/living-room-panorama.png");
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.locator(".tour-page")).toHaveAttribute(
    "data-status",
    "ready",
    { timeout: 20000 },
  );
});
