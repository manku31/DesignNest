import { test as base, expect } from "@playwright/test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import type { AddressInfo } from "node:net";
import { createApp } from "../server/app";

// Every test has a real API and its own on-disk library. Never reset or write
// the user's running server / data folder during verification.
export const test = base.extend<{ localServer: string; dataDirectory: string }>({
  dataDirectory: async ({ browserName }, use) => {
    void browserName;
    const directory = await mkdtemp(path.join(tmpdir(), "designnest-browser-"));
    try { await use(directory); } finally { await rm(directory, { recursive: true, force: true }); }
  },
  localServer: async ({ dataDirectory }, use) => {
    const { app } = await createApp(dataDirectory, true);
    const server = app.listen(0, "127.0.0.1");
    await new Promise<void>((resolve) => server.once("listening", resolve));
    try { await use(`http://127.0.0.1:${(server.address() as AddressInfo).port}`); }
    finally { server.closeAllConnections(); await new Promise<void>((resolve) => server.close(() => resolve())); }
  },
  baseURL: async ({ localServer }, use) => { await use(localServer); },
});
export { expect };
