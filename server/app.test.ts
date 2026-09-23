import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import type { AddressInfo } from "node:net";
import sharp from "sharp";
import { createApp } from "./app";
import { LocalStore } from "./store";
import type { Action, AppData } from "../shared/schema";

test("local API saves uploads and concurrent changes, survives restart, rejects invalid input", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "designnest-api-"));
  const { app } = await createApp(directory);
  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const send = (action: Action | object) => fetch(`${base}/api/actions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(action) });
  const upload = (buffer: Buffer, kind = "panorama") => {
    const form = new FormData(); form.append("kind", kind); form.append("image", new Blob([new Uint8Array(buffer)], { type: "image/png" }), "../../room.png");
    return fetch(`${base}/api/uploads`, { method: "POST", body: form });
  };
  try {
    const seed: AppData = await (await fetch(`${base}/api/state`)).json();
    const png = await sharp({ create: { width: 1024, height: 512, channels: 3, background: "#C8B08A" } }).png().toBuffer();
    const response = await upload(png); assert.equal(response.status, 201);
    const photo = await response.json(); assert.match(photo.url, /^\/uploads\/[a-f0-9-]+\.webp$/);
    const stored = await fetch(`${base}${photo.url}`); assert.equal(stored.status, 200); assert.match(stored.headers.get("content-type")!, /image\/webp/);
    const room = { ...seed.rooms[0], id: "my-studio", name: "My studio", panorama: photo.url, image: photo.url };
    assert.equal((await send({ type: "room.save", room })).status, 200);
    const updates = await Promise.all([
      send({ type: "profile.update", update: { name: "My Name" } }),
      send({ type: "light.update", id: room.id, update: { brightness: 28 } }),
      send({ type: "favorite.set", id: room.id, saved: true }),
      send({ type: "roomSettings.update", id: room.id, update: { furniture: ["chair"], decor: "Natural textures", wallColor: "Sage green" } }),
    ]);
    assert.ok(updates.every((res) => res.status === 200));
    const reopened = new LocalStore(directory); await reopened.initialize(); const disk = reopened.read();
    assert.equal(disk.user.name, "My Name"); assert.equal(disk.lights[room.id].brightness, 28);
    assert.ok(disk.favorites.includes(room.id)); assert.equal(disk.rooms.at(-1)?.panorama, photo.url);
    assert.deepEqual(disk.roomSettings[room.id].furniture, ["chair"]);
    assert.equal((await send({ type: "light.update", id: room.id, update: { brightness: 999 } })).status, 400);
    assert.equal((await send({ type: "room.save", room: { ...room, image: "javascript:alert(1)" } })).status, 400);
    assert.equal((await upload(Buffer.from("fake image"))).status, 400);
    const square = await sharp({ create: { width: 1024, height: 1024, channels: 3, background: "#000" } }).png().toBuffer();
    const invalidPanorama = await upload(square); assert.equal(invalidPanorama.status, 400); assert.match((await invalidPanorama.json()).error, /2:1/);
    assert.equal((await readdir(path.join(directory, "uploads"))).length, 1);
    const foreign = await fetch(`${base}/api/actions`, { method: "POST", headers: { Origin: "https://unrelated.example", "Content-Type": "application/json" }, body: JSON.stringify({ type: "room.delete", id: room.id }) }); assert.equal(foreign.status, 403);
    assert.equal((await send({ type: "room.delete", id: room.id })).status, 200);
    const after: AppData = await (await fetch(`${base}/api/state`)).json(); assert.ok(!after.rooms.some((value) => value.id === room.id)); assert.ok(!after.favorites.includes(room.id)); assert.ok(!after.lights[room.id]);
    assert.equal((await fetch(`${base}${photo.url}`)).status, 200);
  } finally { server.closeAllConnections(); await new Promise<void>((resolve) => server.close(() => resolve())); await rm(directory, { recursive: true, force: true }); }
});

test("an unreadable data file is preserved instead of being replaced with sample content", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "designnest-corrupt-"));
  const file = path.join(directory, "designnest.json");
  try { await writeFile(file, "broken-user-file"); await assert.rejects(() => new LocalStore(directory).initialize(), /preserved/); assert.equal(await readFile(file, "utf8"), "broken-user-file"); }
  finally { await rm(directory, { recursive: true, force: true }); }
});
