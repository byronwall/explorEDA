import { expect, test } from "@playwright/test";

test("published findings stay labeled when a chart changes the selection", async ({
  page,
}) => {
  await page.goto("/daily/ercot-forecast-investigation");
  const findings = page.getByRole("region", { name: "Published findings" });
  await expect(findings).toContainText(
    "chart selections do not change these findings"
  );
  await expect(findings).toContainText("-1,242.9 MWh");
  await page.getByRole("button", { name: "Equal: 1 rows" }).click();
  await expect(page.getByText("1 row", { exact: true })).toBeVisible();
  await expect(findings).toContainText("-1,242.9 MWh");
  await expect(findings).toContainText(
    "chart selections do not change these findings"
  );
  await page.getByRole("button", { name: "Clear all filters" }).click();
  await expect(findings).toContainText("1,417 rows");
});
