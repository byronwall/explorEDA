import { act, cleanup, render } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { applyFilter } from "@/hooks/applyFilter";
import { buildValuesProfile } from "@/lib/fieldProfiles";
import {
  applyFieldSettings,
  buildConversionPreview,
} from "@/lib/fieldSettings";
import { CalculationManager } from "@/lib/calculations/CalculationState";
import { parseExpression } from "@/lib/calculations/parser/semantics";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import type { DatumObject } from "@/providers/DataLayerProvider";

// Native objects retain absent properties, explicit undefined, and Infinity.
const rows: DatumObject[] = [
  {},
  { x: undefined },
  { x: null },
  { x: "" },
  { x: "   " },
  { x: "NA" },
  { x: "oops" },
  { x: Infinity },
  { x: 0 },
  { x: false },
  { x: "12.5" },
  { x: "2025-02-30" },
];
const ids = (items: number[]) =>
  items.map((i) => `r${String(i + 1).padStart(2, "0")}`);
const settings = { type: "numeric" as const, nullTokens: ["NA"] };
afterEach(cleanup);

it("reconciles raw numeric and converted populations", () => {
  const raw = buildValuesProfile(
    "x",
    rows.map((row) => row.x),
    "numeric"
  );
  expect(raw).toMatchObject({
    totalCount: 12,
    nullCount: 5,
    excludedCount: 5,
    statistics: { mean: 6.25, stdDev: 6.25 },
  });
  const preview = buildConversionPreview("x", rows, settings, "categorical");
  expect(preview).toMatchObject({
    validCount: 2,
    missingCount: 6,
    failedCount: 4,
  });
  expect(ids(preview.failures.map((item) => item.row))).toEqual([
    "r07",
    "r08",
    "r10",
    "r12",
  ]);
  const applied = applyFieldSettings(
    rows,
    { x: settings },
    { x: "categorical" }
  );
  expect(applied.filter((row) => row.x != null).map((row) => row.x)).toEqual([
    0, 12.5,
  ]);
  expect(
    buildValuesProfile(
      "x",
      applied.map((row) => row.x),
      "numeric"
    )
  ).toMatchObject({ totalCount: 12, nullCount: 10, excludedCount: 0 });
  expect(Object.hasOwn(applied[0], "x")).toBe(false);
  expect(Object.hasOwn(rows[1], "x")).toBe(true);
  expect(rows[7].x).toBe(Infinity);
});

it("measures the categorical null count and broad missing predicate separately", () => {
  const profile = buildValuesProfile(
    "x",
    rows.map((row) => row.x),
    "categorical"
  );
  const selected = rows.flatMap((row, i) =>
    applyFilter(row.x, { field: "x", type: "value", values: [null] }) ? [i] : []
  );
  expect(profile.nullCount).toBe(3);
  expect(ids(selected)).toEqual(["r01", "r02", "r03", "r04", "r05"]);
  console.log("MS02", {
    displayedNullCount: profile.nullCount,
    predicateIds: ids(selected),
  });
});

it("compares absent-property batch and trace status through the real parser", () => {
  const data = rows.map((row, __ID) => ({ ...row, __ID }));
  const definition = {
    resultColumnName: "copy",
    expression: parseExpression("x"),
  };
  const manager = new CalculationManager(data, [definition]);
  expect(manager.executeCalculation(definition).get(0)).toBeUndefined();
  expect(manager.getErrors("copy").has(0)).toBe(false);
  expect(manager.traceRow("copy", 0)?.error).toBe("Undefined variable: x");
  expect(manager.traceRow("copy", 1)?.error).toBeUndefined();
  console.log("MS04", {
    batchError: manager.getErrors("copy").get(0),
    absentTraceError: manager.traceRow("copy", 0)?.error,
    undefinedTraceError: manager.traceRow("copy", 1)?.error,
  });
});

it("compares a token-only preview and Apply with a host numeric declaration", async () => {
  let state: any;
  function Probe() {
    state = useDataLayer((value) => value);
    return null;
  }
  render(
    <DataLayerProvider data={rows} charts={[]} fieldTypes={{ x: "number" }}>
      <Probe />
    </DataLayerProvider>
  );
  const preview = state.getFieldConversionPreview("x", { nullTokens: ["NA"] });
  expect(preview).toMatchObject({
    effectiveType: "categorical",
    validCount: 8,
    missingCount: 4,
    failedCount: 0,
  });
  await act(async () => state.updateFieldSettings("x", { nullTokens: ["NA"] }));
  const profile = state.fieldProfiles.find((p: any) => p.name === "x");
  expect(profile).toMatchObject({
    dataType: "numeric",
    nullCount: 10,
    excludedCount: 0,
  });
  expect(
    state.data.filter((r: any) => r.x != null).map((r: any) => r.x)
  ).toEqual([0, 12.5]);
  expect(state.getFieldConversionPreview("x", settings)).toMatchObject({
    effectiveType: "numeric",
    validCount: 2,
    missingCount: 6,
    failedCount: 4,
  });
  console.log("MS03", { preview, appliedProfile: profile });
});
