import path from "node:path";
import { createApp } from "./app";

const production = process.argv.includes("--production");
const directory = path.resolve(process.env.DESIGNNEST_DATA_DIR || "data");
const port = Number(process.env.API_PORT || (production ? 3000 : 8787));
const { app } = await createApp(directory, production);
app.listen(port, production ? "0.0.0.0" : "127.0.0.1", () => {
  console.log(
    `DesignNest local server: http://localhost:${port} · Data: ${directory}`,
  );
});
