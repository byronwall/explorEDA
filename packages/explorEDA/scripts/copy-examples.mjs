// Copies the sample projects into dist, where `exploreda --example` finds
// them. The app itself is built into dist/app by apps/app.
import { cpSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
rmSync(resolve(root, "dist/examples"), { recursive: true, force: true });
cpSync(resolve(root, "examples"), resolve(root, "dist/examples"), {
  recursive: true,
});
