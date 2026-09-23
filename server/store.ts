import { mkdir, open, readFile, rename } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { stateSchema, type Action, type AppData } from "../shared/schema";
import { applyAction } from "../shared/state";
import { createSeed } from "./seed";
import { stockImageSources, images } from "../src/data/mockData";

export class LocalStore {
  private state!: AppData;
  private queue: Promise<unknown> = Promise.resolve();
  readonly file: string;
  constructor(readonly directory: string) {
    this.file = path.join(directory, "designnest.json");
  }
  async initialize() {
    await mkdir(this.directory, { recursive: true });
    try {
      const raw = await readFile(this.file, "utf8");
      const localPhotos = new Map(
        Object.entries(stockImageSources).map(([key, source]) => [
          source,
          images[key as keyof typeof images],
        ]),
      );
      let migrated = false;
      this.state = stateSchema.parse(
        JSON.parse(raw, (_key, value) => {
          if (typeof value === "string" && localPhotos.has(value)) {
            migrated = true;
            return localPhotos.get(value);
          }
          return value;
        }),
      );
      if (migrated) {
        this.state.revision++;
        await this.write(this.state);
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT")
        throw new Error(
          `Cannot read ${this.file}. Your file has been preserved. Restore a valid backup before restarting.`,
          { cause: error },
        );
      this.state = createSeed();
      await this.write(this.state);
    }
  }
  read() {
    return structuredClone(this.state);
  }
  private async write(state: AppData) {
    const temporary = `${this.file}.${randomUUID()}.tmp`;
    const file = await open(temporary, "wx", 0o600);
    try {
      await file.writeFile(JSON.stringify(state, null, 2));
      await file.sync();
    } finally {
      await file.close();
    }
    await rename(temporary, this.file);
  }
  async update(action: Action) {
    const task = this.queue.then(async () => {
      const next = stateSchema.parse(applyAction(this.state, action));
      next.revision = this.state.revision + 1;
      await this.write(next);
      this.state = next;
      return this.read();
    });
    this.queue = task.catch(() => undefined);
    return task;
  }
}
