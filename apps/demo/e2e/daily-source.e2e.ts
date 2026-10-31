import { expect, test } from "@playwright/test";

test("notebook source errors identify the last-valid preview and recover", async ({
  page,
}) => {
  await page.goto(
    "/daily/ercot-storm-by-the-hour?sheet=the-storm-week&view=source"
  );
  const editor = page.getByRole("textbox", {
    name: "storm-by-the-hour.eda.md text",
  });
  await expect(editor).toBeVisible();
  const original = await editor.inputValue();
  const changed = original.replace(
    'title="Electricity served and forecast, February 13 to 21, 2021"',
    'title="Edited chart title"'
  );
  await editor.fill(changed);
  await editor.blur();
  await expect(
    page.getByRole("heading", { name: "Edited chart title" })
  ).toBeVisible();
  await editor.fill(original);
  await editor.blur();
  const line = "line @nb-ercot-storm-by-the-hour-4";
  const invalid = original.replace(
    line,
    "audit_invalid @nb-ercot-storm-by-the-hour-4"
  );
  await editor.fill(invalid);
  await editor.blur();
  await expect(
    page.getByRole("alert").filter({ hasText: "last version that worked" })
  ).toContainText("Line 56");
  await expect(
    page.getByRole("button", { name: "Explore rows" })
  ).toBeDisabled();
  await editor.fill(original);
  await editor.blur();
  await expect(page.getByText("last version that worked")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Explore rows" })
  ).toBeEnabled();
  await editor.fill(original.replace("eda query=r", "eda query=missing"));
  await editor.blur();
  await expect(
    page.getByRole("alert").filter({ hasText: "No query is named missing" })
  ).toContainText("last valid data");
  await expect(
    page.getByRole("button", { name: "Explore rows" })
  ).toBeDisabled();
  await page.getByRole("button", { name: "Reset" }).click();
  await expect(editor).toHaveValue(original);
  await expect(
    page.getByRole("alert").filter({ hasText: "No query is named missing" })
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Explore rows" })
  ).toBeEnabled();
});
