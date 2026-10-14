import { expect, it } from "vitest";
import type { ProjectFiles } from "@/lib/project/files";

/**
 * What every project file adapter must do. `create` makes an adapter over
 * a folder that already holds `seed`.
 */
export function projectFilesContract(
  create: (seed: Record<string, string>) => Promise<ProjectFiles>
) {
  it("lists files with / separators, skipping .git and node_modules", async () => {
    const files = await create({
      "exploreda.eda": "project @p\n",
      "data/orders.csv": "id\n1\n",
      ".git/HEAD": "ref",
      "node_modules/x/index.js": "",
    });
    expect(await files.list()).toEqual(["data/orders.csv", "exploreda.eda"]);
  });

  it("reads what it writes, making folders as needed", async () => {
    const files = await create({});
    await files.write("analyses/sales.eda", "hist revenue\n");
    expect(await files.read("analyses/sales.eda")).toBe("hist revenue\n");
    await files.write("analyses/sales.eda", "row region\n");
    expect(await files.read("analyses\\sales.eda")).toBe("row region\n");
  });

  it("reports a missing file by code", async () => {
    const files = await create({});
    await expect(files.read("nope.csv")).rejects.toMatchObject({
      code: "missing",
    });
  });

  it("refuses writes outside the folder", async () => {
    const files = await create({});
    for (const target of [
      "../escape.eda",
      "/tmp/escape.eda",
      "a/../../b.eda",
    ]) {
      await expect(files.write(target, "x")).rejects.toMatchObject({
        code: "refused",
      });
    }
  });

  it("removes files", async () => {
    const files = await create({ "old.eda": "x" });
    await files.remove("old.eda");
    expect(await files.list()).toEqual([]);
  });
}
