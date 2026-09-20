import { describe, expect, it } from "vitest";
import {
  applyFieldSettings,
  buildConversionPreview,
  convertFieldValue,
  formatFieldValue,
  getFieldSettingsError,
} from "./fieldSettings";
import { buildFieldProfiles } from "./fieldProfiles";

describe("field settings", () => {
  it("converts valid numbers, null tokens, and failed values", () => {
    const rows = [
      { revenue: "12.5" },
      { revenue: "NA" },
      { revenue: "bad" },
      { revenue: 4 },
    ];
    const preview = buildConversionPreview(
      "revenue",
      rows,
      { type: "numeric", nullTokens: ["NA"] },
      "categorical"
    );

    expect(preview).toMatchObject({
      effectiveType: "numeric",
      validCount: 2,
      missingCount: 1,
      failedCount: 1,
    });
    expect(preview.failures[0]).toMatchObject({ raw: "bad" });
  });

  it("uses explicit date presets and rejects invalid dates", () => {
    expect(
      convertFieldValue("28/02/2025", "datetime", {
        datePreset: "day-month-year",
      }).value
    ).toBe("2025-02-28T00:00:00.000Z");
    expect(
      convertFieldValue("29/02/2025", "datetime", {
        datePreset: "day-month-year",
      })
    ).toMatchObject({ value: undefined, error: "Invalid date" });
    expect(
      convertFieldValue("2025-02-29", "datetime", { datePreset: "iso" })
    ).toMatchObject({ value: undefined, error: "Invalid date" });
    expect(
      convertFieldValue("29/02/2025", "datetime", {
        datePreset: "month-day-year",
      })
    ).toMatchObject({ value: undefined, error: "Invalid date" });
  });

  it("accepts only explicit boolean values", () => {
    expect(convertFieldValue("TRUE", "boolean").value).toBe(true);
    expect(convertFieldValue("yes", "boolean")).toMatchObject({
      value: undefined,
      error: "Expected true or false",
    });
  });

  it("validates settings and keeps draft formatting safe", () => {
    expect(getFieldSettingsError({ precision: -1 })).toMatch(/whole number/);
    expect(getFieldSettingsError({ precision: 2.5 })).toMatch(/whole number/);
    expect(getFieldSettingsError({ precision: 21 })).toMatch(/whole number/);
    expect(getFieldSettingsError({ currency: "US" })).toMatch(/three-letter/);
    expect(formatFieldValue("value", "", { format: "currency" })).toBe("—");
    expect(
      formatFieldValue("date", 0, { format: "date" })
    ).toMatch(/1970/);
  });

  it("does not preview inferred conversion without an explicit conversion setting", () => {
    const preview = buildConversionPreview(
      "value",
      [{ value: 1 }, { value: "1" }],
      {},
      "categorical"
    );
    expect(preview.validCount).toBe(2);
    expect(preview.failures).toHaveLength(0);
    expect(preview.examples.map((example) => example.value)).toEqual([1, "1"]);
  });

  it("uses an explicit categorical profile for typed numeric runtime values", () => {
    expect(
      buildFieldProfiles([{ value: 1 }, { value: 2 }], {
        value: "categorical",
      })[0]
    ).toMatchObject({ dataType: "categorical", uniqueCount: 2 });
  });

  it("leaves raw scalar types unchanged until an override is present", () => {
    const rows = [{ value: 1 }, { value: "1" }];
    expect(applyFieldSettings(rows, {}, { value: "categorical" })).toEqual(
      rows
    );
    expect(
      applyFieldSettings(
        rows,
        { value: { type: "numeric" } },
        {
          value: "categorical",
        }
      )
    ).toEqual([{ value: 1 }, { value: 1 }]);
  });

  it("formats values without changing their runtime value", () => {
    expect(
      formatFieldValue("revenue", 12.5, {
        format: "currency",
        currency: "USD",
        precision: 2,
      })
    ).toBe("$12.50");
    expect(formatFieldValue("flag", false)).toBe("No");
  });
});
