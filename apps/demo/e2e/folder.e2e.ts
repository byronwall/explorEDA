import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

// The project folder flow, against a real browser folder: the page's
// private file system stands in for the folder the picker would return.
const exampleDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../packages/explorEDA/examples/shop"
);

function exampleFiles(): Record<string, string> {
  const files: Record<string, string> = {};
  const walk = (directory: string, prefix: string) => {
    for (const name of readdirSync(directory)) {
      const full = path.join(directory, name);
      const relative = prefix ? `${prefix}/${name}` : name;
      if (statSync(full).isDirectory()) {
        walk(full, relative);
      } else {
        files[relative] = readFileSync(full, "utf8");
      }
    }
  };
  walk(exampleDir, "");
  return files;
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript((files: Record<string, string>) => {
    window.showDirectoryPicker = async () => {
      const root = await navigator.storage.getDirectory();
      for await (const name of (
        root as unknown as { keys(): AsyncIterable<string> }
      ).keys()) {
        await root.removeEntry(name, { recursive: true });
      }
      for (const [file, text] of Object.entries(files)) {
        const parts = file.split("/");
        let folder = root;
        for (const part of parts.slice(0, -1)) {
          folder = await folder.getDirectoryHandle(part, { create: true });
        }
        const handle = await folder.getFileHandle(parts.at(-1)!, {
          create: true,
        });
        const writable = await handle.createWritable();
        await writable.write(text);
        await writable.close();
      }
      return root as never;
    };
  }, exampleFiles());
});

/** A file's text in the page's private file system. */
function readOpfs(page: import("@playwright/test").Page, file: string) {
  return page.evaluate(async (name) => {
    const root = await navigator.storage.getDirectory();
    return (await (await root.getFileHandle(name)).getFile()).text();
  }, file);
}

test("opens a project folder and saves an edit back to it", async ({
  page,
}) => {
  await page.goto("/folder");
  await page.getByRole("button", { name: "Choose a folder" }).click();
  const rail = page.getByRole("complementary", { name: "Project" });
  await expect(rail.getByRole("button", { name: /Orders/ })).toBeVisible();
  await expect(page.locator(".react-grid-item")).toHaveCount(7);

  const chart = page.locator('.react-grid-item:has-text("Orders by region")');
  await chart.hover();
  await page.getByRole("button", { name: "Delete Orders by region" }).focus();
  await page.keyboard.press("Enter");
  await page
    .getByRole("alertdialog", { name: "Delete chart?" })
    .getByRole("button", { name: "Delete" })
    .click();
  await expect(page.locator(".react-grid-item")).toHaveCount(6);
  await expect(rail.getByText("Saved to the folder")).toBeVisible();
  await expect
    .poll(() => readOpfs(page, "orders.eda"))
    .not.toContain('title="Orders by region"');
  expect(await readOpfs(page, "orders.eda")).toContain(
    'title="Orders by channel"'
  );
});
