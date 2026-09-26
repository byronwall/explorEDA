import { describe, expect, it } from "vitest";
import { buildFieldProfile } from "@/lib/fieldProfiles";
import { formatFieldValue } from "@/lib/fieldSettings";
import { fieldMetadata } from "./FieldMetadata";

describe("fieldMetadata", () => {
  it("summarizes the full range for datetime fields", () => {
    const profile = buildFieldProfile("created", {
      0: "2026-03-14",
      1: "2026-01-02",
      2: "2026-02-20",
      3: null,
    });

    expect(profile.dataType).toBe("datetime");
    expect(fieldMetadata(profile)).toMatchObject({
      type: "Date",
      detail: "2026-01-02–2026-03-14",
      detailLabel: "Range",
      nulls: "1 null",
    });
  });
  it("formats ranges and samples with the field's display format", () => {
    const profile = buildFieldProfile("price", { 0: 12.5, 1: 40, 2: null });
    const settings = { format: "currency" as const, precision: 2 };

    expect(
      fieldMetadata(profile, (value) =>
        formatFieldValue("price", value, settings)
      )
    ).toMatchObject({ detail: "$12.50–$40.00", detailLabel: "Range" });
  });
});
