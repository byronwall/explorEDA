---
title: "Local data file inputs — implementation plan"
slug: "data-file-inputs"
phase: plan
status: draft
last_updated: "2026-10-13"
---

# Local data file inputs — implementation plan

## Plan at a glance

Build the reader API and source-faithful typing on formats we already read, then add one new reader library per milestone. Milestone 1 moves CSV and JSON reading into `exploreda`, adds TSV, and stops Papa's automatic typing. Every later reader hands the same pipeline rows and declared field types, so the value fixes happen once, before any binary dependency arrives.

Order: CSV/TSV, then JSON/JSON Lines, then XLSX, then Parquet, then Arrow/Feather. Text formats come first because they exercise inference, the hardest typing case. Typed formats then mostly skip inference. XLSX comes before Parquet because peers rank Excel highest and it needs the only new UI, the sheet picker. Parquet and Arrow share type mapping, so Arrow reuses what Parquet proves.

The project has no users, so existing CSV coercion changes by default with no compatibility option. A saved layout that depended on `0012` becoming `12` simply changes.

Each milestone is one stacked PR with a changeset, a load-data docs section, an example file, and screenshots at three widths.

Material pushback: do not build a format registry. A `switch` on detected format inside `readTableFile` is enough for seven formats. Also keep reading on the main thread until a measured 100 MB fixture shows a real stall.

## Implementation strategy

- **First proof:** An adversarial CSV and its TSV twin import through the landing page and Add source, and every value matches the file through summary, rows, filters, trace, session reload, history, and project file.
- **Primary seam:** `readTableFile(file, options) → { name, format, rows, fields }` in `packages/explorEDA/src/lib/readers/`, exported from `exploreda/readers`. `fields` carries declared `FieldDefinition` types. `sourceFromRows` and initial import accept those types instead of re-detecting them.
- **Fast local loop:** `pnpm --filter exploreda exec vitest run src/lib/readers` with committed fixtures; `pnpm --filter demo dev` for the browser.
- **Local dependencies:** Small fixtures in `packages/explorEDA/src/lib/readers/fixtures/`, produced by independent tools: pandas or pyarrow, DuckDB, Excel or LibreOffice, and a Google Sheets download. Each has an expected-values JSON file.
- **Provider confirmation:** None live. A production demo build in Chromium confirms lazy chunks, codecs, and the content security policy.
- **Rollout and rollback:** Each format is one `case` plus one lazy import. Removing the case removes the format; other readers are unaffected.

### Material dependency proof strategy

```text
reader unit tests on committed producer fixtures (vitest, Node)
    → library consumers: sourceFromRows, applyFieldSettings, project codec
    → demo dev server: both import paths, reload, history, project file
    → production demo build in Chromium: lazy chunk, codecs, CSP, bundle size
```

## Milestone 1: CSV and TSV keep their source values

This milestone establishes the API and the typing rules with no new dependency. Papa moves from the demo into the library.

- **Change — reader API in `exploreda`**
  - Add `lib/readers/` with `readTableFile`, `readTableText`, `SUPPORTED_FILE_TYPES` (extensions and MIME types for `accept`), and a typed `ReadError` that names the file, line, field, and reason.
  - Add an `exploreda/readers` entry in `tsup.config.ts` and `package.json` exports. Move `papaparse` to library `dependencies`.
- **Change — whole-column typing** in `lib/readers/inferColumns.ts`
  - Parse with `dynamicTyping: false`. Scan every row to discover fields and types, replacing the 500-row `TYPE_SAMPLE` in `sources.ts`.
  - A column is a number only when every non-missing token converts exactly: no leading zeros except `0` and `0.x`, and every integer within the safe range. Otherwise it stays text.
  - A column is a date only when every token is ISO date or date-time text. Keep the ISO string and declare `date`, so values never become `Date` objects.
  - Booleans are `true` or `false` only. Missing tokens are empty and the field's `nullTokens`.
- **Change — consumers honor declared types**
  - `sourceFromRows` takes optional `fields` and skips detection for declared fields.
  - `ExplorEdaProject` `renderedSettings` merges declared types even without saved settings.
  - Rename an imported `__ID` column on import instead of letting `dataLayerState` overwrite it.
- **Change — demo uses the library**
  - `CsvUpload`, `PageFileDrop`, `LandingPage`, `SampleDataButtons`, the order-book examples, and Add source in `SavedViewsWorkspace` call `readTableFile` or `readTableText`. Add source accepts every supported type.
  - Delete `apps/demo/src/csvParser.ts`, `jsonParser.ts`, and `readDataFile.ts`. The current JSON flattening moves into the library unchanged until milestone 2.
- **Change — adversarial fixture and consumer tests**
  - Fixture with quoted tabs, quoted newlines, leading-zero IDs, missing cells, ISO and non-ISO dates, a 19-digit integer, a BOM, and a field first populated at row 600.
  - Tests through `sourceFromRows`, `applyFieldSettings`, the project-file codec, and `savedViewsSession` and history JSON round trips.

### Desired end state

- Both import paths accept `.csv`, `.tsv`, `.tab`, and `.json`, and every fixture value matches its expected file in the UI and after reload.
- Sample datasets still open with sensible types; any changed sample type is listed in the PR.
- The load-data docs explain the typing rules; the TSV example opens from the docs.
- `minor` changeset: new `exploreda/readers` API and source-faithful CSV typing.

## Milestone 2: JSON and JSON Lines keep exact numbers

- **Change — JSON Lines** in `lib/readers/json.ts`
  - Accept `.jsonl` and `.ndjson`: one object per line, blank trailing line allowed, errors report the line number.
  - Share one record-to-row path with JSON arrays and single objects.
- **Change — nested values**
  - Nested objects flatten to dotted fields, one row per record. Arrays become JSON text in one field.
  - This replaces the current `field[0]` expansion, which creates sparse, unbounded columns.
- **Spike — exact large integers**
  - Decision required: how to read integers above 2^53 without rounding.
  - Evidence to gather: whether `JSON.parse` reviver `context.source` works in current Chrome, Firefox, and Safari, and whether a small lossless parser (such as `lossless-json`) builds cleanly.
  - Fallback: scan number tokens with a small tokenizer before `JSON.parse`, and keep unsafe integers as text.

### Desired end state

- JSON, JSON Lines, and nested-record fixtures import with exact IDs and predictable fields.
- Docs section and an NDJSON example. `minor` changeset.

## Milestone 3: XLSX opens one chosen sheet

- **Change — workbook reader**
  - Lazily load the workbook reader (`read-excel-file`; see the spike outcome below). Read cell types: numbers, text, booleans, and Excel dates as ISO text declared `date`. Use cached formula values; never calculate.
  - Error cells become missing values, and the import reports how many there were. The first non-empty row is the header.
- **Change — sheet picker**
  - Add a nonmodal popover beside the drop target that lists sheet names with row and column counts. It appears only when a workbook has several visible sheets. Follow [UI defaults](../../ui-defaults.md).
  - It works for initial import and Add source.
- **Spike — SheetJS packaging**
  - Decision required: depend on the official SheetJS tarball, or have hosts pass the module, as `maplibre-gl` hosts do.
  - Evidence to gather: whether `pnpm` and npm consumers install the tarball cleanly, plus `tsup` chunk output and size.
  - Fallback: host registration through `registerWorkbookReader(XLSX)`, with a clear message when it is absent.
- **Change — fixtures** from Excel, LibreOffice, and a Google Sheets download, each with two sheets, dates, formulas, an error cell, and leading-zero text.

### Desired end state

- A Google Sheets XLSX download opens with the chosen sheet and correct dates and IDs.
- Screenshots of the sheet picker at 1280, 783, and 390 px. Docs section, example workbook, `minor` changeset.

## Milestone 4: Parquet single files open with declared types

- **Change — Parquet reader** with lazily loaded `hyparquet` and `hyparquet-compressors` for gzip, zstd, brotli, and LZ4
  - Map the schema to field types before conversion. Integers within the safe range and floats stay numbers. Larger int64 values and decimals become exact text. Timestamps become ISO text at source precision, declared `date`. Lists, maps, and structs become JSON text.
  - Put the mapping in `lib/readers/typedColumns.ts` for milestone 5 to reuse.
- **Change — fixtures** from pyarrow and DuckDB covering each codec, nullable columns, int64 above 2^53, decimal, timestamp in milliseconds, microseconds, and nanoseconds, and a list column.
- **Change — size measurement**
  - Time a 100 MB file through read, source build, and first render in the production build.
  - Record the result and set the size limit message from it.

### Desired end state

- Parquet fixtures match expected values exactly in the UI and after reload.
- The measured import time and lazy chunk size are recorded in the PR. Docs section, example file, `minor` changeset.

## Milestone 5: Arrow IPC and Feather V2 open

- **Change — Arrow reader** with a lazily loaded Arrow decoder (Flechette; see the spike outcome below), reusing `typedColumns.ts`.
- **Spike — compressed IPC buffers**
  - Decision required: whether `apache-arrow` decodes LZ4 and ZSTD buffers without fetching codecs at runtime.
  - Evidence to gather: decode pyarrow Feather files written with `lz4`, `zstd`, and `uncompressed` in the production build.
  - Fallback: support uncompressed files plus whichever codec works, and tell users how to re-save the others.
- **Change — fixtures** from pyarrow and Polars, with dictionary-encoded strings and the same type cases as Parquet.

### Desired end state

- `.arrow`, `.feather`, and `.arrows` fixtures import exactly. Docs section, example file, `minor` changeset.
- The load-data docs list all seven formats and the formats deferred to later.

## Cross-cutting verification

- Each milestone runs the reader tests, `pnpm --filter exploreda check-types`, `pnpm check:ui`, and browser checks at three widths. Run `pnpm check` before each PR.
- A failed or cancelled read leaves the current analysis unchanged. Test this once in milestone 1, then rerun the test for each format.

## Open decisions and spikes

All three spikes ran during implementation (October 13, 2026):

- **Exact JSON integers (M2, #391):** Reviver `context.source` works in V8, but support in Firefox and Safari is unconfirmed. A small scanner quotes integer literals past 2^53 before `JSON.parse`, the same in every browser.
- **Workbook package (M3, #394):** Current SheetJS ships only from its CDN, and npm `xlsx` is frozen at a release with known vulnerabilities. `read-excel-file` (MIT, on npm) replaced it. It reads cached formula results and 1904 dates; error cells read as missing.
- **Size limit (M4, #395):** On the production demo build, 250,000 Parquet rows load in 4.5 s and 1,000,000 in 17.9 s, and the reader is about 10% of that time. No worker was added. Tables of more than 500,000 rows ask before opening.
- **Arrow reader and codecs (M5):** Neither apache-arrow nor Flechette bundles LZ4 or zstd codecs, and apache-arrow misread decimals. Flechette replaced apache-arrow, with fzstd and a small LZ4 frame decoder registered as codecs. A Flechette ordering bug dropped dictionaries that Polars writes after its record batches; the reader loads a file's dictionaries first.

## Below the cut line

- Avro, ODS, XLSB, XLS, gzip, and ZIP archives
- Range selection inside a sheet; multiple tables per sheet
- GeoJSON (with map-and-location work), and SPSS, Stata, and SAS
- Multi-file or partitioned datasets, lakehouse tables, SQLite, and DuckDB files
- Live Google Sheets, URLs, and database connectors
- A worker pipeline or streaming reader before measurements require one
- A public format registry or plugin API
