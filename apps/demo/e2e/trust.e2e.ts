import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { trustRows, trustSettings } from "../src/localTrustFixture";

// The "local trust" journey from docs/intent/current-analysis-trust, through
// real clicks: open a saved analysis, select Tools in the bar, compare the
// cards, the table, and its CSV download, undo and redo, then copy the full
// analysis JSON and reopen it in a fresh browser to the same rows and values.
// Tools has three source rows but only two numeric contributors: sum 12,
// mean 6.

const toolsCsv = [
  "order,category,revenue",
  "O-101,Tools,4",
  "O-102,Tools,8",
  "O-103,Tools,",
].join("\n");

async function openAnalysis(page: Page, json: string) {
  await page.goto("/");
  await page.getByRole("button", { name: "Reopen it from JSON" }).click();
  await page.getByRole("textbox", { name: "Full analysis JSON" }).fill(json);
  await page.getByRole("button", { name: "Open analysis JSON" }).click();
  await expect(tools(page)).toBeVisible();
}

const tools = (page: Page) =>
  page.getByRole("button", { name: "Tools: 12", exact: true });
const sum = (page: Page) => page.getByLabel("Sum of revenue", { exact: true });
const average = (page: Page) =>
  page.getByLabel("Average of revenue", { exact: true });
const table = (page: Page) =>
  page.locator('.react-grid-item:has-text("Orders")').getByRole("table");

async function exportCsv(page: Page) {
  const panel = page.locator('.react-grid-item:has-text("Orders")');
  // The panel's actions slide in when its header is hovered.
  await panel.getByRole("heading", { name: "Orders" }).hover();
  const download = page.waitForEvent("download");
  await panel.getByRole("button", { name: "Export rows as CSV" }).click();
  return readFileSync(await (await download).path(), "utf8");
}

async function expectTools(page: Page) {
  await expect(tools(page)).toHaveAttribute("aria-pressed", "true");
  await expect(sum(page).getByText("12", { exact: true })).toBeVisible();
  await expect(sum(page)).toContainText("1 excluded");
  await expect(sum(page)).toContainText("3 of 5 rows");
  await expect(average(page).getByText("6", { exact: true })).toBeVisible();
  await expect(table(page).getByRole("row")).toHaveCount(4);
  await expect(table(page)).toContainText("O-103");
  await expect(table(page)).not.toContainText("O-104");
  expect(await exportCsv(page)).toBe(toolsCsv);
}

test("one category agrees across bar, cards, table, CSV, undo, and a reopened save", async ({
  browser,
}) => {
  const context = await browser.newContext({
    permissions: ["clipboard-read", "clipboard-write"],
  });
  const page = await context.newPage();
  await openAnalysis(
    page,
    JSON.stringify({
      format: "exploreda-analysis",
      version: 1,
      data: trustRows,
      settings: trustSettings,
    })
  );
  await expect(sum(page).getByText("24", { exact: true })).toBeVisible();

  await tools(page).click();
  await expectTools(page);

  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(tools(page)).not.toHaveAttribute("aria-pressed", "true");
  await expect(sum(page).getByText("24", { exact: true })).toBeVisible();
  await expect(table(page).getByRole("row")).toHaveCount(6);
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expectTools(page);

  await page.getByRole("button", { name: "Workspace actions" }).click();
  await page.getByRole("menuitem", { name: "Copy full analysis JSON" }).click();
  await expect(page.getByText("Full analysis JSON copied")).toBeVisible();
  const saved = await page.evaluate(() => navigator.clipboard.readText());
  expect(JSON.parse(saved).data).toEqual(trustRows);
  await context.close();

  // A fresh browser has no saved workspace to resume.
  const reopened = await browser.newPage();
  await openAnalysis(reopened, saved);
  await expectTools(reopened);
  await reopened.close();
});
