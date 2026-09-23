import { mkdir, writeFile } from "node:fs/promises";
import { stockImageSources } from "../src/data/mockData";

await mkdir("public/library", { recursive: true });
for (const [name, url] of Object.entries(stockImageSources)) {
  if (!url.startsWith("https://images.unsplash.com/")) continue;
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`Photo ${name}: ${response.status}`);
  await writeFile(`public/library/${name}.jpg`, Buffer.from(await response.arrayBuffer()));
  console.log(`Saved ${name}.jpg`);
}
