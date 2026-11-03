import { describe, expect, it } from "vitest";
import { parseNumberInput } from "@/lib/numericInput";
import {
  buildConversionPreview,
  convertFieldValue,
  type FieldSettings,
} from "@/lib/fieldSettings";

describe("parseNumberInput", () => {
  it.each([
    ["dot-comma", "1,234", 1234],
    ["dot-comma", "1,234.50", 1234.5],
    ["dot-comma", "1234.5", 1234.5],
    ["dot-comma", "-1,234,567.25", -1234567.25],
    ["dot-comma", ".5", 0.5],
    ["dot-comma", "0012", 12],
    ["dot-comma", "-0", 0],
    ["comma-dot", "1,234", 1.234],
    ["comma-dot", "1.234,50", 1234.5],
    ["comma-plain", "1234,5", 1234.5],
    ["comma-space", "1 234,50", 1234.5],
    ["comma-space", "1\u00a0234,50", 1234.5],
    ["comma-space", "1\u202f234\u202f567", 1234567],
  ] as const)("%s reads %j as %d", (input, text, value) => {
    expect(parseNumberInput(text, input)).toEqual({ value });
  });

  it.each([
    ["dot-comma", "1.234,50", "Separators do not match 1,234.5"],
    ["dot-comma", "12,34,567.89", "Separators do not match 1,234.5"],
    ["dot-comma", "1 234.50", "Separators do not match 1,234.5"],
    ["comma-space", "1 234\u00a0567", "Separators do not match 1 234,5"],
    ["comma-plain", "1.234,5", "Separators do not match 1234,5"],
    ["dot-comma", "1.", "Not a number written as 1,234.5"],
    ["dot-comma", "bad", "Has characters that are not part of a number"],
    ["dot-comma", "$5.00", "Has a currency sign; turn on currency input"],
    ["dot-comma", "12%", "Has a percent sign; turn on percent input"],
    ["dot-comma", "(12)", "Parentheses need accounting negatives"],
    ["indian-dot", "123,456", "Separators do not match 12,34,567.8"],
    ["dot-comma", "1e309", "Too large for a number"],
    ["dot-comma", "1e-400", "Too small for a number"],
  ] as const)("%s rejects %j", (input, text, error) => {
    expect(parseNumberInput(text, input)).toEqual({ value: undefined, error });
  });

  it.each([
    ["dot-space", "1 234 567.25", {}, 1234567.25],
    ["indian-dot", "12,34,567.89", {}, 1234567.89],
    ["dot-comma", "12%", { percent: true }, 0.12],
    ["dot-comma", "0.12%", { percent: true }, 0.0012],
    ["dot-comma", "1,200%", { percent: true }, 12],
    ["dot-comma", "5e-322%", { percent: true }, Number.MIN_VALUE],
    ["dot-comma", "(1,234.50)", { accounting: true }, -1234.5],
    ["dot-comma", "(12%)", { accounting: true, percent: true }, -0.12],
    ["dot-comma", "$1,234.50", { currency: "USD" }, 1234.5],
    ["dot-comma", "-$5", { currency: "USD" }, -5],
    ["dot-comma", "USD 5.00", { currency: "USD" }, 5],
    ["dot-comma", "($250.00)", { currency: "USD", accounting: true }, -250],
    ["comma-dot", "€ 1.234,50", { currency: "EUR" }, 1234.5],
    ["comma-dot", "1.234,50 €", { currency: "EUR" }, 1234.5],
    ["dot-comma", "CA$12", { currency: "CAD" }, 12],
    ["dot-comma", "$12", { currency: "CAD" }, 12],
  ] as const)("%s with %j and %j reads %d", (input, text, options, value) => {
    expect(parseNumberInput(text, input, options)).toEqual({ value });
  });

  it.each([
    ["12", { percent: true }, "Missing a percent sign"],
    ["12 %", { percent: true }, "Separators do not match 1,234.5"],
    ["12%%", { percent: true }, "Has characters that are not part of a number"],
    [
      "(-12)",
      { accounting: true },
      "Accounting negatives take no sign or spaces inside",
    ],
    [
      "( 12)",
      { accounting: true },
      "Accounting negatives take no sign or spaces inside",
    ],
    ["£5", { currency: "USD" }, "Currency does not match USD"],
    ["EUR 5", { currency: "USD" }, "Currency does not match USD"],
  ] as const)("rejects %j with %j", (text, options, error) => {
    expect(parseNumberInput(text, "dot-comma", options)).toEqual({
      value: undefined,
      error,
    });
  });

  it("keeps native numbers and null tokens ahead of the convention", () => {
    const settings: FieldSettings = {
      type: "numeric",
      numberInput: "comma-dot",
      nullTokens: ["NA"],
    };
    expect(convertFieldValue(1.5, "numeric", settings)).toEqual({
      value: 1.5,
    });
    // A native number is never scaled as a percent.
    expect(
      convertFieldValue(12, "numeric", { ...settings, percentInput: true })
    ).toEqual({ value: 12 });
    expect(convertFieldValue("NA", "numeric", settings)).toEqual({
      value: undefined,
    });
    expect(convertFieldValue(true, "numeric", settings).error).toBeDefined();
  });
});

describe("number input review", () => {
  const rows = ["1,234", "1,234.50", "12", "bad", null].map((amount) => ({
    amount,
  }));

  it("counts each convention and flags text another convention reads differently", () => {
    const preview = buildConversionPreview(
      "amount",
      rows,
      { type: "numeric", numberInput: "dot-comma" },
      "categorical"
    );
    expect(preview).toMatchObject({
      validCount: 3,
      missingCount: 1,
      failedCount: 1,
      ambiguousCount: 1,
    });
    expect(preview.failures[0]).toMatchObject({ row: 3, raw: "bad" });
    expect(preview.examples[0]).toMatchObject({
      raw: "1,234",
      value: 1234,
      alternate: "1.234 as 1234,5",
    });
    expect(preview.numberInputs).toEqual([
      { input: undefined, validCount: 1, failedCount: 3 },
      { input: "comma-plain", validCount: 2, failedCount: 2 },
      { input: "dot-comma", validCount: 3, failedCount: 1 },
      { input: "comma-dot", validCount: 2, failedCount: 2 },
      { input: "comma-space", validCount: 2, failedCount: 2 },
      { input: "dot-space", validCount: 1, failedCount: 3 },
      { input: "indian-dot", validCount: 3, failedCount: 1 },
    ]);
  });
});
