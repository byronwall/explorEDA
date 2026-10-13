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
  it("reads JSON Lines with exact IDs, nested fields, and late fields", async () => {
    const table = await readTableFile(await fixture("events.ndjson"));
    expect(table.format).toBe("jsonl");
    expect(table.rows).toHaveLength(300);
    expect(typeOf(table)).toEqual({
      event_id: "string",
      account: "string",
      amount: "number",
      "user.name": "string",
      "user.address.city": "string",
      tags: "string",
      ok: "boolean",
      at: "date",
      late: "number",
    });
    expect(table.rows[0]).toEqual({
      event_id: "00001",
      account: "9007199254740994",
      amount: 0.75,
      "user.name": "José",
      "user.address.city": "Oslo",
      tags: '["a","b"]',
      ok: true,
      at: "2025-06-02T12:00:00Z",
      late: null,
    });
    expect(table.rows[1]!.account).toBe("9007199254740995");
    expect(table.rows[1]!.tags).toBe("[]");
    expect(table.rows[9]!.amount).toBeNull();
    expect(table.rows[299]!.late).toBe(50);
  });

  it("reads the records array of an API-style object", async () => {
    const table = await readTableFile(await fixture("events-api.json"));
    expect(table.rows).toHaveLength(20);
    expect(table.notes).toEqual(['Read the 20 records in "data".']);
    expect(table.rows[0]!.event_id).toBe("00001");
  });

  it("keeps long integers inside arrays and leaves strings alone", () => {
    const table = readTableText(
      '[{"id": 12345678901234567890, "n": -9007199254740993, "s": "12345678901234567890", "x": 1.5e3}]',
      { format: "json" }
    );
    expect(table.rows[0]).toEqual({
      id: "12345678901234567890",
      n: "-9007199254740993",
      s: "12345678901234567890",
      x: 1500,
    });
  });

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
    expect(table.rows[0]!.late).toBeNull();
  });

  it("names the line of a bad JSON Lines record", () => {
    expect(() =>
      readTableText('{"a":1}\n\n{"a":2\n', { format: "jsonl" })
    ).toThrow(/^Line 3 is not valid JSON/);
    expect(() => readTableText('{"a":1}\n[1]\n', { format: "jsonl" })).toThrow(
      "Line 2 is not an object. Each line must hold one JSON object."
    );
  });

  it("rejects scalar roots", () => {
    expect(() => readTableText("42", { format: "json" })).toThrow("object");
  });
});

describe("Excel workbooks", () => {
  it("reads the largest table, below its title rows", async () => {
    const table = await readTableFile(await fixture("orders.xlsx"));
    expect(table.format).toBe("xlsx");
    expect(table.sheet).toBe("Orders");
    expect(table.name).toBe("Orders");
    expect(table.sheets).toEqual([
      { name: "Cover", rows: 1, columns: 1 },
      { name: "Orders", rows: 40, columns: 9 },
      { name: "Returns", rows: 10, columns: 3 },
      { name: "Lookup", rows: 1, columns: 2 },
    ]);
    expect(table.notes[0]).toBe(
      'Started "Orders" at row 4, below 3 title rows.'
    );
    expect(table.rows).toHaveLength(40);
    expect(typeOf(table)).toEqual({
      order_id: "string",
      customer: "string",
      qty: "number",
      unit_price: "number",
      total: "number",
      ordered: "date",
      shipped_at: "date",
      rush: "boolean",
      ratio: "number",
    });
    expect(table.rows[0]).toEqual({
      order_id: "00001",
      customer: "Grace",
      qty: 2,
      unit_price: 2.75,
      total: 5.5,
      ordered: "2025-07-02",
      shipped_at: "2025-08-02T10:30:00",
      rush: false,
      ratio: 2 / 2.75,
    });
    // Excel's day fractions round to the second.
    expect(table.rows[1]!.shipped_at).toBe("2025-08-03T11:30:00");
    expect(table.rows[4]!.shipped_at).toBeNull();
    // A #DIV/0! result is a missing value.
    expect(table.rows[6]!.ratio).toBeNull();
  });

  it("reads the sheet it is asked for", async () => {
    const table = await readTableFile(await fixture("orders.xlsx"), {
      sheet: "Returns",
    });
    expect(table.sheet).toBe("Returns");
    expect(table.notes).toEqual([]);
    expect(table.rows[0]).toEqual({
      order_id: "00003",
      reason: "late",
      refund: 4.5,
    });
    await expect(
      readTableFile(await fixture("orders.xlsx"), { sheet: "Nope" })
    ).rejects.toThrow('The workbook has no sheet named "Nope".');
  });

  it("reads 1904 dates, text ZIP codes, and formulas with no stored result", async () => {
    const table = await readTableFile(await fixture("mac-1904.xlsx"));
    expect(table.name).toBe("mac-1904");
    expect(table.rows[0]).toEqual({
      zip: "02131",
      count: 10,
      when: "2024-01-01",
      calc: null,
    });
    expect(typeOf(table).zip).toBe("string");
  });

  it("explains a file that is not a workbook", async () => {
    await expect(readTableFile(new File(["a,b"], "fake.xlsx"))).rejects.toThrow(
      "The file is not a readable Excel workbook"
    );
  });
});

describe("Parquet", () => {
  it("keeps exact values for every pyarrow type", async () => {
    const table = await readTableFile(await fixture("parquet/types.parquet"));
    expect(table.format).toBe("parquet");
    expect(table.rows).toHaveLength(6);
    expect(typeOf(table)).toEqual({
      id: "string",
      account: "string",
      count: "number",
      small: "number",
      ratio: "number",
      price: "number",
      balance: "string",
      day: "date",
      at_ms: "date",
      local_us: "date",
      at_ns: "date",
      flag: "boolean",
      tags: "string",
      address: "string",
    });
    expect(table.rows[1]).toEqual({
      id: "00001",
      account: "9007199254740994",
      count: 10,
      small: 1,
      ratio: 1 / 3,
      price: 0.1,
      balance: "1.5000000000",
      day: "2025-01-02",
      at_ms: "2025-03-01T12:00:01.123Z",
      local_us: "2025-03-01T08:30:00.111111",
      at_ns: "2025-03-01T12:00:00.12345679Z",
      flag: false,
      tags: "[]",
      address: '{"city":"Lima","zip":null}',
    });
    expect(table.rows[0]!.balance).toBe("12345678901234567890.1234567891");
    expect(table.rows[0]!.tags).toBe('["a","b"]');
    expect(table.rows[2]).toMatchObject({
      count: null,
      price: null,
      flag: null,
      tags: null,
      address: null,
    });
  });

  for (const codec of ["none", "gzip", "zstd", "brotli", "lz4"]) {
    it(`reads ${codec} pages`, async () => {
      const table = await readTableFile(
        await fixture(`parquet/codec-${codec}.parquet`)
      );
      expect(table.rows[5]).toEqual({
        id: "00005",
        account: "9007199254740998",
        price: 0,
        at_ms: "2025-03-01T12:00:05.123Z",
        tags: '["f"]',
      });
    });
  }

  it("reads a DuckDB file with decimals, lists, and structs", async () => {
    const table = await readTableFile(await fixture("parquet/duckdb.parquet"));
    expect(typeOf(table)).toEqual({
      n: "number",
      code: "string",
      amount: "number",
      huge: "number",
      ts: "date",
      d: "date",
      pair: "string",
      obj: "string",
      ok: "boolean",
    });
    expect(table.rows[3]).toEqual({
      n: 3,
      code: "0003",
      amount: 3.375,
      huge: 170141183460469231731687303715884105727 - 3,
      ts: "2024-03-01T00:00:02",
      d: "2024-03-03",
      pair: "[3,4]",
      obj: '{"k":3}',
      ok: true,
    });
  });

  it("explains a file that is not Parquet", async () => {
    await expect(
      readTableFile(new File(["a,b"], "fake.parquet"))
    ).rejects.toThrow("The file is not a readable Parquet file");
  });
});

describe("formats", () => {
  it("names formats by extension", () => {
    expect(tableFormatOf("Orders.TSV")).toBe("tsv");
    expect(tableFormatOf("notes.txt")).toBe("csv");
    expect(tableFormatOf("photo.png")).toBeUndefined();
    expect(tableFileAccept()).toContain(".tab");
    expect(tableFormatList()).toBe(
      "CSV, TSV, JSON, JSON Lines, Excel, or Parquet"
    );
    expect(tableFormatOf("events.NDJSON")).toBe("jsonl");
  });

  it("rejects an unknown extension with the readable formats", async () => {
    await expect(readTableFile(new File(["x"], "photo.png"))).rejects.toThrow(
      "Choose a CSV, TSV, JSON, JSON Lines, Excel, or Parquet file."
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
