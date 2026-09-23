import express, { type ErrorRequestHandler } from "express";
import multer from "multer";
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { ZodError } from "zod";
import { actionSchema } from "../shared/schema";
import { LocalStore } from "./store";

export async function createApp(directory: string, production = false) {
  const store = new LocalStore(directory);
  await store.initialize();
  const uploads = path.join(directory, "uploads");
  await mkdir(uploads, { recursive: true });
  const app = express();
  app.disable("x-powered-by");
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    next();
  });
  // Same-origin clients only; Vite proxies preserve the phone's Host header.
  app.use("/api", (req, res, next) => {
    const origin = req.headers.origin;
    if (origin && new URL(origin).host !== req.headers.host) {
      res
        .status(403)
        .json({ error: "Use DesignNest from this server's address." });
      return;
    }
    res.setHeader("Cache-Control", "no-store");
    next();
  });
  app.use(express.json({ limit: "1mb" }));
  app.get("/api/health", (_req, res) => res.json({ ok: true }));
  app.get("/api/state", (_req, res) => res.json(store.read()));
  app.post("/api/actions", async (req, res) => {
    const action = actionSchema.parse(req.body);
    res.json(await store.update(action));
  });
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024, files: 1, fields: 2 },
  });
  app.post("/api/uploads", upload.single("image"), async (req, res) => {
    if (!req.file) {
      res.status(400).json({ error: "Choose an image to upload." });
      return;
    }
    const panorama = req.body.kind === "panorama";
    try {
      const source = sharp(req.file.buffer, {
        limitInputPixels: 80_000_000,
        failOn: "error",
      });
      const metadata = await source.metadata();
      if (
        !["jpeg", "png", "webp"].includes(metadata.format ?? "") ||
        (metadata.pages ?? 1) > 1
      )
        throw new Error("Choose a still JPEG, PNG, or WebP image.");
      const oriented = metadata.autoOrient;
      const width = oriented?.width ?? metadata.width ?? 0;
      const height = oriented?.height ?? metadata.height ?? 0;
      if (panorama && (width < 1024 || Math.abs(width - 2 * height) > 2))
        throw new Error(
          "360° panoramas must be 2:1 equirectangular images, at least 1024 × 512 pixels.",
        );
      const { data, info } = await source
        .rotate()
        .resize({ width: panorama ? 4096 : 2400, withoutEnlargement: true })
        .webp({ quality: 92 })
        .toBuffer({ resolveWithObject: true });
      const filename = `${randomUUID()}.webp`;
      await writeFile(path.join(uploads, filename), data, {
        flag: "wx",
        mode: 0o600,
      });
      res
        .status(201)
        .json({
          url: `/uploads/${filename}`,
          width: info.width,
          height: info.height,
          bytes: info.size,
        });
    } catch (error) {
      res
        .status(400)
        .json({
          error:
            error instanceof Error
              ? error.message
              : "This image could not be read.",
        });
    }
  });
  app.use(
    "/uploads",
    express.static(uploads, {
      immutable: true,
      maxAge: "1y",
      dotfiles: "deny",
    }),
  );
  app.use("/uploads", (_req, res) => res.status(404).end());
  app.use("/api", (_req, res) =>
    res.status(404).json({ error: "Endpoint not found." }),
  );
  if (production) {
    const dist = path.resolve("dist");
    app.use(express.static(dist));
    app.get("/{*path}", (_req, res) =>
      res.sendFile(path.join(dist, "index.html")),
    );
  }
  const errors: ErrorRequestHandler = (error, _req, res, _next) => {
    if (error instanceof ZodError) {
      res
        .status(400)
        .json({
          error: error.issues
            .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
            .join("; "),
        });
      return;
    }
    if (error instanceof multer.MulterError) {
      res
        .status(400)
        .json({
          error:
            error.code === "LIMIT_FILE_SIZE"
              ? "Images must be 25 MB or smaller."
              : "Upload one image at a time.",
        });
      return;
    }
    console.error(error);
    res
      .status(500)
      .json({
        error:
          "The local server could not save this change. Check available disk space and try again.",
      });
  };
  app.use(errors);
  return { app, store };
}
