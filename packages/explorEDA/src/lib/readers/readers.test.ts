import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { addSourceFromRows, singleTableProject } from "@/lib/analysis/sources";
import {
  parseAnalysisProject,
  stringifyAnalysisProject,
} from "@/lib/analysis/projectFile";
import { buildFieldProfiles } from "@/lib/fieldProfiles";
import { declaredDataTypes } from "@/lib/declaredFieldTypes";
import { readTableFile, readTableText } from "./readTable";
import { tableFileAccept, tableFormatList, tableFormatOf } from "./formats";
import { TableReadError, type TableFile } from "./types";

const fixture = async (name: string) =>
  new File([await readFile(resolve(__dirname, "fixtures", name))], name);

const typeOf = (table: TableFile) =>
  Object.fromEntries(table.fields.map((field) => [field.id, field.type]));

describe("adversarial delimited files", () => {
  for (const name of ["adversarial.csv", "adversarial.tsv"]) {
    it(`keeps every value in ${name} as the file states it`, async () => {
      const table = await readTableFile(await fixture(name));
      expect(table.name).toBe("adversarial");
      expect(table.format).toBe(name.endsWith(".tsv") ? "tsv" : "csv");
      expect(table.rows).toHaveLength(650);
      expect(typeOf(table)).toEqual({
        order_id: "string",
        account: "string",
        customer: "string",
        amount: "number",
        ordered: "date",
        shipped_on: "date",
        priority: "boolean",
        late_field: "number",
        depot: "string",
        __ID_source: "number",
      });
      expect(table.notes).toEqual(['Renamed header "__ID" to "__ID_source".']);

      const [first, second, , fourth] = table.rows;
      expect(first).toMatchObject({
        order_id: "0001",
        account: "9007199254740994",
        customer: "Tab\there",
        amount: 1.25,
        ordered: "2025-02-02",
        shipped_on: "02/02/2025",
        priority: true,
        late_field: null,
        depot: "Depot 1",
        __ID_source: 1,
      });
      expect(second!.customer).toBe("Line\nbreak");
      expect(fourth!.customer).toBe("Ada, Inc.");
      expect(table.rows[9]!.amount).toBeNull();
      expect(table.rows[598]!.late_field).toBeNull();
      expect(table.rows[599]!.late_field).toBe(1);
      expect(table.rows[2]!.customer).toBe('Say "hi"');
    });
  }

  it("keeps identifier text and late fields through a project file", async () => {
    const table = await readTableFile(await fixture("adversarial.tsv"));
    const promoted = singleTableProject({
      name: "Orders",
      rows: table.rows,
      fields: table.fields,
    });
    const added = addSourceFromRows(
      promoted.project,
      promoted.tables,
      table.name,
      table.rows,
      table.fields
    );
    const source = added.project.sources.find(
      (candidate) => candidate.id === added.sourceId
    )!;
    expect(source.entityKey).toBe("order_id");
    expect(source.fields.find((field) => field.id === "late_field")?.type).toBe(
      "number"
    );

    const restored = parseAnalysisProject(
      stringifyAnalysisProject({
        format: "exploreda-project",
        version: 1,
        project: added.project,
        tables: Object.fromEntries(
          Object.entries(added.tables).map(([id, rows]) => [id, [...rows]])
        ),
        views: [promoted.view],
        activeViewId: promoted.view.id,
      })
    );
    const row = restored.tables[added.sourceId]![0]!;
    expect(row.order_id).toBe("0001");
    expect(row.account).toBe("9007199254740994");
    expect(restored.tables[added.sourceId]![649]!.late_field).toBe(51);
  });

  it("profiles identifier columns as categories, as a reload re-detects them", async () => {
    const table = await readTableFile(await fixture("adversarial.csv"));
    // Without declared types, detection reaches the same answer.
    const detected = buildFieldProfiles(table.rows);
    const declared = buildFieldProfiles(
      table.rows,
      declaredDataTypes(table.fieldTypes)
    );
    for (const profiles of [detected, declared]) {
      const types = Object.fromEntries(
        profiles.map((profile) => [profile.name, profile.dataType])
      );
      expect(types.order_id).toBe("categorical");
      expect(types.account).toBe("categorical");
      expect(types.amount).toBe("numeric");
      expect(types.late_field).toBe("numeric");
    }
  });
});

describe("delimited text", () => {
  it("detects semicolons and strips a byte order mark", () => {
    const table = readTableText("﻿zip;price\r\n02134;1,5\r\n10001;2\r\n");
    expect(table.rows).toEqual([
      { zip: "02134", price: "1,5" },
      { zip: "10001", price: "2" },
    ]);
    expect(typeOf(table)).toEqual({ zip: "string", price: "string" });
  });

  it("splits TSV only on tabs", () => {
    const table = readTableText("a\tb,c\n1\t2,3\n", { format: "tsv" });
    expect(table.rows).toEqual([{ a: 1, "b,c": "2,3" }]);
  });

  it("fills short rows and ignores blank trailing cells", () => {
    const table = readTableText("a,b,c\n1,2\n4,5,6,,\n");
    expect(table.rows).toEqual([
      { a: 1, b: 2, c: null },
      { a: 4, b: 5, c: 6 },
    ]);
  });

  it("names blank and repeated headers", () => {
    const table = readTableText("name,,name\nx,y,z\n");
    expect(table.fields.map((field) => field.id)).toEqual([
      "name",
      "Column 2",
      "name_2",
    ]);
    expect(table.notes).toHaveLength(2);
  });

  it("keeps integers past 2^53 and radix text as text", () => {
    const table = readTableText(
      "big,hex,small\n12345678901234567890,0x1A,-3.5e2\n"
    );
    expect(table.rows[0]).toEqual({
      big: "12345678901234567890",
      hex: "0x1A",
      small: -350,
    });
  });

  it("reports the row with extra values", () => {
    expect(() => readTableText("a,b\n1,2\n3,4,5\n")).toThrow(
      "Row 2 has 3 values, but the header names 2 fields."
    );
  });

  it("reports an unclosed quote", () => {
    expect(() => readTableText('name,score\n"broken,1')).toThrow(
      TableReadError
    );
  });
});

describe("JSON", () => {
  it("reads an array of objects and types every field", () => {
    const table = readTableText(
      JSON.stringify([
        { id: "007", n: 1 },
        { id: "008", n: 2, late: true },
      ]),
      { name: "items.json" }
    );
    expect(table.format).toBe("json");
    expect(typeOf(table)).toEqual({
      id: "string",
      n: "number",
      late: "boolean",
    });
  });

  it("rejects scalar roots", () => {
    expect(() => readTableText("42", { format: "json" })).toThrow("object");
  });
});

describe("formats", () => {
  it("names formats by extension", () => {
    expect(tableFormatOf("Orders.TSV")).toBe("tsv");
    expect(tableFormatOf("notes.txt")).toBe("csv");
    expect(tableFormatOf("photo.png")).toBeUndefined();
    expect(tableFileAccept()).toContain(".tab");
    expect(tableFormatList()).toBe("CSV, TSV, or JSON");
  });

  it("rejects an unknown extension with the readable formats", async () => {
    await expect(readTableFile(new File(["x"], "photo.png"))).rejects.toThrow(
      "Choose a CSV, TSV, or JSON file."
    );
  });

  it("stops when the signal is aborted", async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(
      readTableFile(new File(["a\n1"], "a.csv"), { signal: controller.signal })
    ).rejects.toThrow();
  });
});
