import { test, expect } from "./fixtures";

test("every screen fits the viewport and all images load", async ({ page, browser, baseURL }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const route of [
    "/",
    "/home",
    "/room/living-room",
    "/light",
    "/favorites",
    "/profile",
    "/projects",
    "/customize",
  ]) {
    await page.goto(route);
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("h1")).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await expect
      .poll(
        () =>
          page
            .locator("img")
            .evaluateAll((images) =>
              images.every((image) => image.complete && image.naturalWidth > 0),
            ),
        { timeout: 15000 },
      )
      .toBeTruthy();
    await expect(page.locator(".image-fallback")).toHaveCount(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
    expect(
      await page
        .locator(".app-scroll")
        .evaluate((el) => el.scrollWidth <= el.clientWidth),
    ).toBeTruthy();
    await page.screenshot({
      path: `test-results/${test.info().project.name}-${route.replaceAll("/", "-") || "onboarding"}.png`,
      animations: "disabled",
    });
    const frame = await page.locator(".app-frame").boundingBox();
    expect(frame?.x).toBe(0);
    expect(frame?.width).toBe(page.viewportSize()?.width);
    const smallTargets = await page
      .locator("button, a, input, select")
      .evaluateAll((elements) =>
        elements.flatMap((element) => {
          const rect = element.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) return [];
          return rect.width < 43.9 || rect.height < 43.9
            ? [
                {
                  label:
                    element.getAttribute("aria-label") ||
                    element.textContent?.trim(),
                  width: rect.width,
                  height: rect.height,
                },
              ]
            : [];
        }),
      );
    expect(smallTargets, `Touch targets on ${route}`).toEqual([]);
  }
  if (test.info().project.name === "390px") {
    const desktop = await browser.newContext({ baseURL, viewport: { width: 1440, height: 1000 }, isMobile: false, hasTouch: false });
    const page = await desktop.newPage();
    await page.goto("/");
    await expect
      .poll(() =>
        page
          .locator(".onboarding-image img")
          .evaluate(
            (image: HTMLImageElement) =>
              image.complete && image.naturalWidth > 0,
          ),
      )
      .toBeTruthy();
    await expect(page.locator(".app-frame")).toHaveCSS("max-width", "430px");
    const bounds = await page.locator(".app-frame").boundingBox();
    expect(bounds?.width).toBe(430);
    expect(bounds?.x).toBe(505);
    await page.screenshot({
      path: "test-results/desktop-onboarding.png",
      animations: "disabled",
    });
    await desktop.close();
  }
  expect(errors).toEqual([]);
});

test("onboarding, shared lighting state, presets, power, and schedules work", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("navigation")).toHaveCount(0);
  await page.getByRole("button", { name: "View inspiration 2" }).click();
  await expect(
    page.getByRole("button", { name: "View inspiration 2" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("link", { name: "Get Started" }).click();
  await expect(page).toHaveURL(/\/home$/);
  await page.locator(".space-tile").first().click();
  await expect(
    page.getByRole("heading", { name: "Living Room", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Natural Balanced" }).click();
  await expect(
    page.getByRole("slider", { name: "Room brightness" }),
  ).toHaveValue("80");
  await page.getByRole("slider", { name: "Room brightness" }).fill("55");
  await expect(page.locator("output")).toHaveText("55%");
  await page.getByRole("button", { name: "Edit lighting schedule" }).click();
  await page.getByLabel("From", { exact: true }).fill("19:30");
  await page.getByLabel("Until", { exact: true }).fill("23:45");
  await page.getByRole("button", { name: "Save schedule" }).click();
  await expect(page.locator(".schedule-times")).toContainText("07:30 PM");
  await page.getByRole("link", { name: "A little more control" }).click();
  await expect(
    page.getByRole("slider", { name: "Light brightness" }),
  ).toHaveValue("55");
  await page.getByRole("button", { name: "Device 2" }).click();
  await expect(
    page.getByRole("slider", { name: "Light brightness" }),
  ).toHaveValue("42");
  await page.getByRole("button", { name: "Ocean blue" }).click();
  await expect(
    page.getByRole("button", { name: "Ocean blue" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Device 1" }).click();
  await expect(
    page.getByRole("slider", { name: "Light brightness" }),
  ).toHaveValue("55");
  await page.getByRole("button", { name: "Turn light off" }).click();
  await expect(
    page.getByRole("slider", { name: "Light brightness" }),
  ).toBeDisabled();
  await page.getByRole("link", { name: "Back to room" }).click();
  await expect(
    page.getByRole("slider", { name: "Room brightness" }),
  ).toBeDisabled();
});

test("favorites, discovery, editing a profile, and adding a room work", async ({
  page,
}) => {
  await page.goto("/favorites");
  await expect(page.locator(".favorite-card")).toHaveCount(6);
  await page.getByRole("button", { name: "Unsave Warm minimalism" }).click();
  await expect(page.locator(".favorite-card")).toHaveCount(5);
  await page.getByRole("button", { name: "Discover", exact: true }).click();
  await expect(page.locator(".favorite-card")).toHaveCount(6);
  await page
    .getByRole("button", { name: "Save Warm minimalism", exact: true })
    .click();
  await page.getByRole("button", { name: "Saved collection" }).click();
  await expect(page.locator(".favorite-card")).toHaveCount(6);
  await page.getByRole("button", { name: "Bedroom", exact: true }).click();
  await expect(page.locator(".favorite-card")).toHaveCount(1);
  await page.getByRole("link", { name: "Profile", exact: true }).click();
  await page.getByRole("button", { name: "Edit profile" }).click();
  await page.getByLabel("Your name", { exact: true }).fill("Emma Williams");
  await page.getByRole("button", { name: "Save your details" }).click();
  await expect(
    page.getByRole("heading", { name: "Emma Williams." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Home", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Emma Williams." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Add Space", exact: true }).click();
  await page.getByLabel("Space name").fill("Reading nook");
  await page.getByRole("button", { name: "Create your space" }).click();
  await expect(
    page.getByRole("heading", { name: "Reading nook", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Save room to favorites" }).click();
  await page.getByRole("link", { name: "Favorites", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Reading nook", exact: true }),
  ).toBeVisible();
});

test("room tabs, search, and keyboard dialog dismissal work", async ({
  page,
}) => {
  await page.goto("/room/living-room");
  await page.getByRole("button", { name: "Colors", exact: true }).click();
  await page.getByRole("button", { name: "Sage green" }).click();
  await expect(
    page.getByRole("button", { name: "Sage green" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Furniture", exact: true }).click();
  await page.getByRole("button", { name: "Add The accent chair" }).click();
  await expect(
    page.getByRole("button", { name: "Remove The accent chair" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Room options" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("link", { name: "Projects", exact: true }).click();
  await page.getByRole("textbox", { name: "Search projects" }).fill("Kitchen");
  await expect(page.locator(".project-card")).toHaveCount(1);
  await page.getByRole("button", { name: "Completed", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "No spaces found" }),
  ).toBeVisible();
});
