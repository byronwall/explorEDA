// @vitest-environment node
import {
  mkdtempSync,
  mkdirSync,
  renameSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { memoryProjectFiles } from "@/lib/project/files";
import { projectFilesContract } from "@/test/projectFilesContract";
import { nodeProjectFiles } from "./projectFiles";

function seedFolder(seed: Record<string, string>) {
  const root = mkdtempSync(path.join(tmpdir(), "exploreda-"));
  for (const [file, text] of Object.entries(seed)) {
    const target = path.join(root, ...file.split("/"));
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, text);
  }
  return root;
}

describe("memory project files", () => {
  projectFilesContract(async (seed) => memoryProjectFiles(seed));
});

describe("node project files", () => {
  projectFilesContract(async (seed) => nodeProjectFiles(seedFolder(seed)));

  it("reads a file outside the folder by absolute path", async () => {
    const outside = seedFolder({ "shared.csv": "id\n1\n" });
    const files = nodeProjectFiles(seedFolder({}));
    expect(await files.read(path.join(outside, "shared.csv"))).toBe("id\n1\n");
  });

  it("refuses a write that a link would carry outside the folder", async () => {
    const outside = seedFolder({});
    const root = seedFolder({});
    symlinkSync(outside, path.join(root, "linked"), "dir");
    const files = nodeProjectFiles(root);
    await expect(files.write("linked/escape.eda", "x")).rejects.toMatchObject({
      code: "refused",
    });
  });

  it("leaves no temporary file behind after a write", async () => {
    const root = seedFolder({});
    const files = nodeProjectFiles(root);
    await files.write("a.eda", "x");
    expect(await files.list()).toEqual(["a.eda"]);
  });

  it("reports an editor's rename-over save, but not its own writes", async () => {
    const root = seedFolder({ "orders.eda": "row a\n" });
    const files = nodeProjectFiles(root);
    const seen: string[] = [];
    const stop = files.watch!((paths) => seen.push(...paths));
    await new Promise((resolve) => setTimeout(resolve, 100));
    await files.write("mine.eda", "row b\n");
    writeFileSync(path.join(root, ".orders.eda.swp"), "row c\n");
    renameSync(
      path.join(root, ".orders.eda.swp"),
      path.join(root, "orders.eda")
    );
    await new Promise((resolve) => setTimeout(resolve, 600));
    stop();
    expect(seen).toContain("orders.eda");
    expect(seen).not.toContain("mine.eda");
  });
});
