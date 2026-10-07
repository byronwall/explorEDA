import { expect, it } from "vitest";
import {
  fitColumnWidth,
  MAX_COLUMN_WIDTH,
  MIN_COLUMN_WIDTH,
} from "../columnWidths";

it("fits a column to its name or its widest value", () => {
  expect(fitColumnWidth("pH", ["3.51", "3.2"])).toBe(MIN_COLUMN_WIDTH);
  const byName = fitColumnWidth("volatile acidity", ["0.7"]);
  expect(byName).toBeGreaterThan(MIN_COLUMN_WIDTH);
  expect(fitColumnWidth("band", ["Ordinary (3–5) wines"])).toBe(
    Math.ceil(20 * 6.6) + 20
  );
});

it("never fits a column wider than the maximum", () => {
  expect(fitColumnWidth("note", ["x".repeat(500)])).toBe(MAX_COLUMN_WIDTH);
  expect(fitColumnWidth("n".repeat(80))).toBe(MAX_COLUMN_WIDTH);
});
