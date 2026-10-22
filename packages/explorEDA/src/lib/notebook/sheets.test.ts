import { describe, expect, it } from "vitest";
import { parseNotebook } from "./parseNotebook";
import { notebookSheets, sheetId, withoutHeading } from "./sheets";

const BOOK = [
  "**What happened?** Each row is one hour.", // 1
  "", // 2
  "```eda", // 3
  "eda query=r", // 4
  "```", // 5
  "", // 6
  "# Two months", // 7
  "", // 8
  "The whole span.", // 9
  "", // 10
  "```eda", // 11
  "line @all x=time y=error", // 12
  "```", // 13
  "", // 14
  "A finding after the chart.", // 15
  "", // 16
  "# The storm week", // 17
  "", // 18
  "```md", // 19
  "# not a sheet", // 20
  "```", // 21
  "", // 22
  "```eda", // 23
  "line @storm x=time y=error", // 24
  "```", // 25
].join("\n");

describe("notebookSheets", () => {
  it("treats a notebook with one title as one unnamed sheet", () => {
    const parsed = parseNotebook(
      "# Title\n\nProse.\n\n```eda\nline x=a y=b\n```\n"
    );
    const { lede, sheets } = notebookSheets(parsed);
    expect(lede).toEqual([]);
    expect(sheets).toHaveLength(1);
    expect(sheets[0]!.title).toBe("");
    expect(sheets[0]!.segments).toBe(parsed.segments);
  });

  it("splits at every # heading outside fences, keeping file lines", () => {
    const { lede, sheets } = notebookSheets(parseNotebook(BOOK));
    expect(lede.map((segment) => segment.kind)).toEqual(["prose", "block"]);
    expect(sheets.map((sheet) => [sheet.title, sheet.id, sheet.line])).toEqual([
      ["Two months", "two-months", 7],
      ["The storm week", "the-storm-week", 17],
    ]);
    const [first, second] = sheets;
    // The heading line opens the sheet's first prose segment.
    expect(first!.segments[0]).toMatchObject({
      kind: "prose",
      startLine: 7,
      endLine: 10,
    });
    expect(first!.segments[0]!.text.startsWith("# Two months")).toBe(true);
    expect(first!.segments.map((segment) => segment.kind)).toEqual([
      "prose",
      "block",
      "prose",
    ]);
    // Prose that follows a chart stays with its sheet, up to the next heading.
    expect(first!.segments[2]).toMatchObject({ startLine: 14, endLine: 16 });
    expect(first!.segments[2]!.text).toContain("A finding after the chart.");
    // A heading inside a fenced block is prose, not a sheet.
    expect(second!.segments[0]!.text).toContain("# not a sheet");
    expect(second!.segments.map((segment) => segment.kind)).toEqual([
      "prose",
      "block",
    ]);
  });

  it("gives repeated titles distinct ids", () => {
    const { sheets } = notebookSheets(
      parseNotebook("# Same\n\na\n\n# Same\n\nb\n\n# Same!\n\nc\n")
    );
    expect(sheets.map((sheet) => sheet.id)).toEqual([
      "same",
      "same-2",
      "same-3",
    ]);
  });

  it("makes ids from titles", () => {
    expect(sheetId("CO₂ by month, 1960–2010")).toBe("co₂-by-month-1960-2010");
    expect(sheetId("***")).toBe("sheet");
  });

  it("drops the heading line from a sheet's opening text", () => {
    expect(withoutHeading("# Two months\n\nThe span.")).toBe("\nThe span.");
    expect(withoutHeading("# Only")).toBe("");
    expect(withoutHeading("No heading")).toBe("No heading");
  });
});
