---
title: "Local data file inputs — shape brief"
slug: "data-file-inputs"
phase: shape
status: draft
last_updated: "2026-10-13"
---

# Local data file inputs — proposed scope

**Outcome:** Open the local formats that mainstream analysis tools share, keeping the source's own values and types.

**Primary flow:** Choose or drop a file → select a sheet when needed → read the complete table → explore and save it.

**Baseline:** The formats shared by Tableau, Power BI, Polars, DuckDB, and Observable: delimited text, JSON, Excel, Parquet, and Arrow. See the [tool matrix](raw/2026-10-12-pro/exploreda-data-file-inputs-research/report.md#representative-tool-support-matrix).

## Feature scope

```text
Local file readers (exploreda package)
├── IN SCOPE NOW
│   ├── Public reader API in the library, used by the demo
│   │   ├── File → complete rows plus source field types
│   │   ├── Optional reader dependencies, loaded only when a format is read
│   │   └── One path for initial import and Add source; project restore stays separate
│   ├── Source fidelity across all readers, CSV included
│   │   ├── Keep identifier text (leading zeros), large integers, and dates as the source states
│   │   ├── Discover every field, not only fields in the first 500 rows
│   │   └── Carry declared types through filters, trace, session, history, and project files
│   ├── CSV (revisited) and TSV through Papa with explicit typing rules
│   ├── JSON (existing) and JSON Lines / NDJSON
│   ├── XLSX: choose a sheet; header row below any title rows; stored formula values
│   ├── Parquet: single local file through hyparquet
│   ├── Arrow IPC / Feather V2 through Flechette
│   ├── Google Sheets via its XLSX, CSV, and TSV downloads
│   └── Load-data docs and one working example per format
└── LATER
    ├── Avro OCF, ODS, XLSB, XLS, gzip wrapper
    ├── Range selection inside a sheet
    ├── GeoJSON with map-and-location; SPSS, Stata, SAS
    └── Live Sheets, databases, multi-file datasets, lakehouse tables
```

## Behavior

| Situation                                                                            | Expected result                                                                                       |
| ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| A typed source declares a column type (Parquet, Arrow, XLSX cell type)               | Use the declared type. Do not re-infer it from values.                                                |
| A text source holds `0012`, a 19-digit ID, or ISO dates                              | Keep identifier-like text as text. Infer numbers only when conversion is exact.                       |
| A value has no exact scalar form (int64 beyond 2^53, decimal, nested list or struct) | Keep it as exact text, or JSON text for nested values, and mark the field type. Never round silently. |
| A workbook has several sheets                                                        | Choose one. Do not merge sheets.                                                                      |
| A read fails or is cancelled                                                         | Keep the prior analysis. Never publish a partial table as complete.                                   |
| A user imports a Sheets download                                                     | Treat it as a snapshot; it does not stay connected.                                                   |

## Decisions and boundaries

**Reader location:** Readers live in `exploreda`, so package users get them too. Reader libraries are optional peer dependencies loaded by dynamic import, as `maplibre-gl` already is. A missing reader produces a clear message. Each library change carries a changeset.

**Readers:** Use one library per format: Papa for delimited text, read-excel-file for XLSX, hyparquet for Parquet, and Flechette for Arrow. Do not add DuckDB-Wasm, a SQL engine, a plugin registry, or an Arrow-resident data model. Keep the library row based.

**Fidelity:** Treat CSV as a starting point, not as the rule for other formats. Today's coercion, such as turning `0012` into `12`, is a defect to fix for every reader. It is not behavior new readers should copy.

**First proof:** Build the reader API with CSV and TSV before adding binary dependencies.

**Try:** Import an adversarial file with quoted tabs, leading zeros, missing cells, date-like text, a 19-digit integer, and a field that first appears after row 500.

**Observe:** Check values through both import paths, summary, rows, filters, trace, session reload, history, and project files.

**Decide:** Fix each consumer that changes a value. Then add the other formats in turn, each with its fixtures, docs, and example.

**Open product defaults (proposed):** Nested values become JSON text in one column. Set practical file limits from measured fixtures, starting near 100 MB. Defer the range picker until real files need it.

**Cut line:** No workbook editing, formula calculation, macros, executable serialization, browser-cache decoding, or arbitrary archives.

The [intent](intent-brief.md) and [evidence review](evidence/recommendation-review.md) explain the research. The [full research](raw/2026-10-12-pro/exploreda-data-file-inputs-research/report.md) keeps the detailed alternatives. Implementation has not started.
