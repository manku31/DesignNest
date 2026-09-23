import { test, expect } from "./fixtures";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { AppData } from "../shared/schema";

test("mobile pages fill wider screens, including touch landscape", async ({ page }) => {
  for (const width of [450, 480, 844]) {
    await page.setViewportSize({ width, height: width === 844 ? 390 : 920 });
    for (const route of ["/", "/home", "/room/living-room", "/favorites", "/profile", "/customize", "/tour/kitchen"]) {
      await page.goto(route); await expect(page.locator(".app-frame")).toBeVisible();
      const box = await page.locator(".app-frame").boundingBox(); expect(box?.x).toBe(0); expect(box?.width).toBe(width);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
      if (width === 450 && ["/", "/home", "/customize"].includes(route)) await page.screenshot({ path: `test-results/450px-edge-to-edge-${route.replaceAll("/", "-")}.png` });
    }
  }
});

test("uploaded room photos, gallery, panorama, settings, and profile persist for a second device", async ({ page, browser, request, baseURL, dataDirectory }) => {
  await page.goto("/customize");
  await page.getByRole("button", { name: /Add a new place/ }).click();
  await page.getByLabel("Space name", { exact: true }).fill("My terrace");
  await page.getByLabel("Room type", { exact: true }).fill("Outdoor");
  await page.getByLabel("Description", { exact: true }).fill("A place for our evening coffee.");
  await page.getByLabel("Cover photo", { exact: true }).setInputFiles("public/library/lounge.jpg");
  await expect(page.getByText("Uploading…")).toHaveCount(0);
  await page.getByLabel("360° panorama", { exact: true }).setInputFiles("public/panoramas/living-room-panorama.png");
  await expect(page.getByText("Uploading…")).toHaveCount(0);
  await page.getByRole("button", { name: "Add gallery photo", exact: true }).click();
  await page.getByLabel("Gallery photo 1", { exact: true }).setInputFiles("public/library/details.jpg");
  await expect(page.getByText("Uploading…")).toHaveCount(0);
  await page.getByRole("button", { name: "Create your space" }).click();
  await expect(page.getByRole("heading", { name: "My terrace", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Save room to favorites" }).click();
  await page.getByRole("button", { name: "Colors", exact: true }).click();
  await page.getByRole("button", { name: "Sage green" }).click();
  await page.getByRole("button", { name: "Furniture", exact: true }).click();
  await page.getByRole("button", { name: "Add The accent chair" }).click();
  await page.getByRole("link", { name: "Explore 360°", exact: true }).click();
  await expect(page.locator(".tour-page")).toHaveAttribute("data-status", "ready", { timeout: 20000 });
  await expect(page.getByText("Your panorama", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Back to room", exact: true }).click();
  await page.getByRole("button", { name: "Open gallery photo 1" }).click();
  await expect(page.locator(".gallery-full")).toBeVisible(); await page.keyboard.press("Escape");
  await page.getByRole("link", { name: "Profile", exact: true }).click();
  await page.getByRole("button", { name: "Edit profile" }).click();
  await page.getByLabel("Your name", { exact: true }).fill("Manku");
  await page.getByLabel("Profile photo", { exact: true }).setInputFiles("public/library/oliver.jpg");
  await expect(page.getByText("Uploading…")).toHaveCount(0);
  await page.getByRole("button", { name: "Save your details" }).click();
  await expect(page.getByRole("heading", { name: "Manku." })).toBeVisible();
  const saved: AppData = await (await request.get("/api/state")).json();
  const room = saved.rooms.find((room) => room.name === "My terrace")!;
  expect(room.image).toMatch(/^\/uploads\//); expect(room.panorama).toMatch(/^\/uploads\//); expect(room.gallery?.[0]).toMatch(/^\/uploads\//);
  const disk: AppData = JSON.parse(await readFile(path.join(dataDirectory, "designnest.json"), "utf8"));
  expect(disk.user.name).toBe("Manku"); expect(disk.user.avatar).toMatch(/^\/uploads\//); expect(disk.roomSettings[room.id].furniture).toContain("chair");
  const second = await browser.newContext({ baseURL, viewport: { width: 450, height: 920 }, isMobile: true, hasTouch: true });
  try {
    const phone = await second.newPage(); await phone.goto(`/room/${room.id}`);
    await expect(phone.getByRole("heading", { name: "My terrace", exact: true })).toBeVisible();
    await expect(phone.getByRole("button", { name: "Remove room from favorites" })).toBeVisible();
    await phone.getByRole("button", { name: "Colors", exact: true }).click();
    await expect(phone.getByRole("button", { name: "Sage green" })).toHaveAttribute("aria-pressed", "true");
    await phone.getByRole("button", { name: "Room options" }).click(); await phone.getByRole("button", { name: "Edit space & photos" }).click();
    await phone.getByLabel("Space name", { exact: true }).fill("Our terrace"); await phone.getByRole("button", { name: "Save space", exact: true }).click();
    await expect(phone.getByRole("heading", { name: "Our terrace", exact: true })).toBeVisible();
    await phone.reload(); await expect(phone.getByRole("heading", { name: "Our terrace", exact: true })).toBeVisible();
  } finally { await second.close(); }
});

test("library customization, app text, upload errors, and deletion work", async ({ page, request }) => {
  await page.goto("/customize"); await page.getByRole("button", { name: "Library", exact: true }).click();
  await page.getByLabel("Collection", { exact: true }).selectOption("furnishings");
  await page.getByRole("button", { name: "Add item", exact: true }).click();
  await page.getByLabel("Name", { exact: true }).fill("My handmade table");
  await page.getByLabel("Material / details").fill("Oak from our workshop");
  await page.getByLabel("Photo", { exact: true }).setInputFiles("public/library/dining.jpg"); await expect(page.getByText("Uploading…")).toHaveCount(0);
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.goto("/room/living-room"); await page.getByRole("button", { name: "Furniture", exact: true }).click();
  await expect(page.getByRole("heading", { name: "My handmade table" })).toBeVisible();
  await page.goto("/customize"); await page.getByRole("button", { name: "App", exact: true }).click();
  await page.getByLabel("App name", { exact: true }).fill("Manku’s Nest");
  await page.getByRole("button", { name: "Save app details" }).click();
  await expect.poll(async () => (await (await request.get("/api/state")).json()).site.brand).toBe("Manku’s Nest");
  await page.goto("/"); await expect(page.locator(".onboarding-header .brand strong")).toHaveText("Manku’s Nest.");
  await page.goto("/customize"); await page.getByRole("button", { name: "Edit Kitchen", exact: true }).click();
  await page.getByLabel("360° panorama", { exact: true }).setInputFiles("public/library/kitchen.jpg");
  await expect(page.getByRole("alert")).toContainText("2:1");
  await page.getByRole("button", { name: "Delete space", exact: true }).click();
  await page.getByRole("button", { name: "Confirm delete", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Kitchen", exact: true })).toHaveCount(0);
  await page.reload(); await expect(page.getByRole("button", { name: "Edit Kitchen", exact: true })).toHaveCount(0);
});

test("a failed save stays visible and can be retried", async ({ page, request }) => {
  await page.goto("/room/living-room");
  await page.route("**/api/actions", (route) => route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "Server unavailable" }) }));
  await page.getByRole("button", { name: "Natural Balanced" }).click();
  await expect(page.getByRole("alert")).toContainText("Changes haven’t been saved");
  await page.unroute("**/api/actions"); await page.getByRole("button", { name: "Retry saving" }).click();
  await expect(page.locator(".save-banner")).toHaveCount(0);
  await expect.poll(async () => (await (await request.get("/api/state")).json()).lights["living-room"].brightness).toBe(80);
  await page.reload(); await expect(page.getByRole("slider", { name: "Room brightness" })).toHaveValue("80");
});
