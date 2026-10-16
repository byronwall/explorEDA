# Proof plan for local data-file input

Research baseline: byronwall/explorEDA at c534378c052c9fbb2cb076d1df0d21eb0fa0965e. Research date: October 12, 2026, America/Indiana/Indianapolis.

## Status and purpose

This is a proposed verification sequence for Codex shaping and implementation work. It contains no application changes or claim of new format support.

Executed during research: the selected source packet's 36 manifest entries passed byte/hash verification; four targeted assertions under Node v24.19.0 checked JSON numeric rounding, undefined/nonfinite serialization, bigint serialization failure, and duplicate-member overwrite. Independent review also checked the date-serial pair and numerical fixture expectations arithmetically; those are not reader tests. These language checks expose risks; they are not tests of explorEDA, Papa Parse, workbooks, Parquet, or browsers. [P10]

All format decoding, real-browser, package-build, memory, responsiveness, integration, and pnpm checks below are **unrun**. The packet is a selected snapshot, not a runnable checkout. Do not describe current tests as passed merely because they were inspected.

The first proof should be capable of rejecting the recommended small direct-reader boundary. Failure means narrow the supported values or revise admission/persistence before adding more formats. A decoder returning rows is insufficient evidence.

## Milestones and promotion decisions

| Milestone | Intended result | Promotion gate |
| --- | --- | --- |
| M0 | Common detection/admission rules; adversarial TSV end-to-end proof | Every admitted value survives real inference, filtering, tracing, and persistence honestly. |
| M1 | Shared TSV in initial import and Add source; strict JSON Lines afterward | Both entry points use the same declared profile and publish complete results atomically. |
| M2 | Bounded XLSX; documented manual Sheets exports | Independent workbooks prove selected-region semantics and safe cached-value handling. |
| M3 | Flat single-file Parquet evaluation | Promote only the tested codecs, physical/logical types, and deployment route. |
| M4 | Arrow/Feather V2 and Avro OCF evaluation on demand | A concrete user dataset justifies each dependency and all browser/value gates pass. |

Every user-visible format milestone includes its documentation and example. An evaluate decision may remain evaluate after proof; no milestone forces adoption.

## Fixture provenance and expected results

Store future format fixtures under a proposed subfolder of apps/demo/public/datasets, with exact new filenames decided during implementation. Keep a fixture record containing producer/version, export options, source URL/ref where applicable, creation date, file bytes, SHA-256, declared schema, and independently derived expected rows.

Use a compact expected-values sidecar for each fixture. State strings exactly, distinguish null from empty/missing, and encode boundary integers as decimal text in the expectation so the test itself cannot round them. For rejected cases, specify error code, source field/cell/line, and unchanged workspace state. Codes below are proposed vocabulary.

At least one binary/workbook success fixture must originate outside the candidate reader's own writer. Use independent producers and reviewed authoritative suites; retain generated same-library files only as supplementary cases. Never substitute a fake decoder for real format fidelity.

## M0 — prove admission before expanding readers

### First rejecting proof: TSV all the way through analysis

Create a proposed four-record quoted TSV with UTF-8 BOM, CRLF records, an embedded tab, an embedded LF inside quotes, escaped quotes, and an empty numeric field. The expected rows are:

| record | amount | comment |
| --- | --- | --- |
| k01 | 12.5 | Exact string alpha + tab + beta |
| k02 | -2 | Exact string line one + LF + line two |
| k03 | Empty string | Empty string, retained under the declared token-preserving profile |
| k04 | 0 | Exact string say "hello" |

Expected count is four, finite amount count three, and finite sum 10.5. The quoted TSV profile is an explicit spreadsheet-style dialect, wider than the simple IANA registration. Document that choice and the empty-cell rule; TSV does not intrinsically encode null. BOM must not become part of the first header. LF-only and CR-only record variants must produce the same records. [P01] [P02] [P07]

Run the real row reader, actual exploration component, filtering, and trace UI. Filter amount >= 0: exactly k01 and k04 remain; the empty amount is excluded from numeric measurements. Trace k01 back to the same original values. Save, reload, change tabs, and repeat the filter. Original source record labels stay intact; use project trace records after promotion where that UI requires project context.

Next substitute adversarial identity values "00123" and "9007199254740993". They must remain exact categorical strings only if that behavior is demonstrably enforced through every consumer; otherwise return UNSAFE_NUMBER/UNSUPPORTED_VALUE before publication. A rounded identifier, successful import followed by numeric reinterpretation, or a restored value with a different meaning rejects the design.

This is essential because valueParsing.ts parses numeric-looking strings with Number(), and sourceFromRows samples only the first 500 rows for field names/types. Declared metadata alone is not proof: ExplorEdaProject applies declared fields only when saved settings exist, while explicit field settings govern conversion. Inspect the actual branch conditions in components/ExplorEdaProject.tsx, lib/analysis/sources.ts, and the selected supplemental lib/fieldSettings.ts. [E11] [E15] [E16] [E37] [E39]

Also test schema-declared text values "true", "2026-10-12", "NaN", and "Infinity". The same categorical-preservation or explicit-rejection rule applies when boolean/date/numeric inference would change their intended text meaning. [E15] [E39]

### Shared admission adversaries

Use separate small fixtures so each failure has one decisive cause:

- A 502-row file introduces late_only in record 501. The field must appear with its one value and explicit missing values elsewhere, or fail with a declared schema error; silently omitting it is forbidden. Admission must examine the full selected data, not only inference's sample.
- A late incompatible scalar appears in record 502 of an otherwise uniform column. Detect it before publication; do not let the preview's type stand for all rows.
- A source field named __ID fails RESERVED_FIELD until an explicit reviewed mapping preserves it. initializeData overwrites __ID [E38]; an internal row ID must not become an invented business key.
- Duplicate headers fail DUPLICATE_HEADER with both column positions. Blank headers require explicit names/selection. Include constructor and __proto__ labels: preserve them safely only through a tested mapping, otherwise reject; never create prototype properties or lose a field.
- Native bigint, Date, binary bytes, arrays/records, errors, and other unsupported values fail UNSUPPORTED_VALUE unless an approved conversion is independently proved. A project-file Date tag does not admit Date cells: validation rejects them.
- Nonfinite numeric values and undefined object members must not pass into a persistence route that changes them. writeProjectTables uses ordinary JSON.stringify; project session/history clones also use JSON. The tests must cover those exact paths, not only a serializer with richer tags. [E17] [E25] [E26]
- Preserve the distinction between a decoded empty string and missing where the format has one. Document that isMissingValue treats blank/whitespace strings as missing for analysis; verify missing counts separately from retained raw values.

Compatibility fixtures freeze existing CSV, raw object/array JSON, full-analysis JSON, and exploreda-project JSON routing. A project marker must reach project validation/restoration before ordinary row parsing. A malformed project must not fall through and become arbitrary JSON data. Preserve raw-row embedding APIs. Full-analysis JSON currently has a separate paste/restore route; file upload must not silently flatten it or be described as existing restore support. [E10] [E21] [E22] [E23] [E27]

### Detection and atomicity

Test mixed-case extensions, absent/unhelpful MIME types, conflicting extension/magic, renamed non-workbook ZIP, renamed JSON, empty files, truncated headers, unreadable File input, and a .gsheet pointer. Expected outcomes are a recognized supported profile or a clear UNSUPPORTED_FORMAT/TYPE_MISMATCH/READ_FAILED; no guessing through an unrelated decoder until something succeeds.

Start slow import A, then successful import B; complete A last. Only B may publish. Cancel during preview and after parsing starts: the prior workspace stays byte-for-byte equivalent in its saved structure, aside from documented transient UI. If a decoder cannot interrupt work, cancellation must at least invalidate publication and release resources when it finishes; do not report true CPU interruption without evidence.

The first proof includes no app implementation in this research package. Future implementation owns these proposed changes.

M0 documentation: propose an “Import interpretation and limits” section in apps/demo/src/docs/pages/load-data.mdx, plus a small TSV fixture and expected-values explanation under apps/demo/public/datasets. Document a limitation before shipping it.

## M1 — shared TSV, then strict JSON Lines

Wire the proposed reader to both existing initial-import surfaces, CsvUpload.tsx and landing/PageFileDrop.tsx, and the separate Add source path in SavedViewsWorkspace.tsx. Keep LandingPage.tsx, savedViewsSession.ts, and savedViewsHistory.ts in the regression path. TSV must use an explicit tab delimiter; a comma inside a value must remain content. A custom delimiter is an explicit later option, not a hidden fallback.

Add fixtures for quoted tab/newline, escaped quotes, BOM, line endings, whitespace, trailing blank records, inconsistent widths, unterminated quotes, duplicate headers, and non-UTF-8 bytes. Each profile must declare which encodings and blank-record rules it accepts. Structural failures abort the entire import with line/field context; no partial rows or silently dropped malformed records. Preserve the existing project restore affordance.

After TSV passes, add strict JSON Lines/NDJSON: UTF-8; one top-level object per line; flat admitted scalar values; LF/CRLF; optional final newline; no BOM or empty lines. These are intentionally narrower than every valid JSON value and optional NDJSON empty-line behavior. [P05] [P08]

Proposed success file: three objects with id values a, b, c; amount values 1.25, null, -0.5; and note values an empty string, "one" + LF + "two", and "雪". Expected three records and finite sum 0.75. Encode the LF with the normal JSON string escape; it becomes a newline within b's note, not an extra record.

Reject an array/null/scalar record, multiline pretty JSON, nested object, malformed second line, duplicate member name, and unsafe integer token 9007199254740993. The latter must never first round to a different accepted value. A lossless parser can be evaluated, but its wrapper values must not escape into analysis and its numeric conversion must satisfy admission. [P09] [P10] [P11] [P12] [P13]

M1 docs and examples: extend load-data.mdx with TSV and strict JSON Lines profiles, line errors, and both entry points. Proposed fixtures live under apps/demo/public/datasets. When adding a demo/live example, use the established apps/demo/src/demos/examples.ts and apps/demo/src/docs/live/examples.ts registrations; these paths are referenced by repository guidance, not all inspected in the packet. [E05] [E30] Include required example coverage in the same change.

## M2 — bounded XLSX and local Sheets exports

Produce small Excel-, LibreOffice-, and manually Sheets-exported workbooks with equivalent selected logical scalar data where the producer supports it. Put producer-specific features in separate reviewed fixtures; do not require every producer to preserve every Excel-specific feature. Declare 32 data records × 12 columns on each of two populated sheets plus one empty sheet. Give the sheets disjoint IDs, e.g. first-a01…first-a32 and second-b01…second-b32. Importing the second sheet must produce exactly those 32 second-* records and one new source.

Select `A4:L36`, including header worksheet row 4 and data rows 5–36; the proposed `headerRow` is a one-based worksheet coordinate. Place the title outside that rectangle. Include a separate named table, a named range, and a second data region; sheet selection must not silently combine them. A named-table picker requires reliable table metadata proof; otherwise retain explicit sheet/range/header selection. [W02] [W11] [W20]

Edge fixtures require:

- Exact selection matrix: `A4:L36` produces 32 records and 12 fields. Hide row 10 and column L: retain all 32 records and 12 fields, including `second-b06`, and disclose one hidden selected row/column. A duplicate B4/A4 header rejects with both coordinates; a blank header requires repair or explicit selection of a valid header.
- A merge `B5:C5` intersecting the selection rejects with its range; no fill-down or omission. One physically absent cell and one explicitly stored empty-text cell have distinct decoder/admission expectations; an unsupported persistence distinction rejects before publication. In a separate variant, make one interior selected row fully empty: retain the 32 selected records under the declared default and report one empty row. An optional drop-empty choice would require an explicit changed count of 31.
- Hidden/very-hidden worksheets require explicit selection. Inflated format-only ranges must not cause uncontrolled allocation. Put a well-formed error cell, absent-cache formula, and merge wholly outside the selected rectangle/on another sheet: they do not invalidate its admitted values. This is selection locality, not recovery from malformed container/XML or exemption from global resource limits. [W12] [W13] [W14] [W15] [W16]
- Raw number 0.125 displayed as 12.5% remains numeric 0.125; a text cell "00123" remains exact under enforced categorical handling or rejects. Formatting does not add numeric precision.
- Stored formula results 7, 0, false, and an explicit empty text result remain exactly those scalar values with a stored-result warning. A fixture with formula `1+1` but stored result 7 must retain 7 with the warning, proving no recalculation. An absent cache is distinct from those falsey values and rejects as proposed `MISSING_FORMULA_CACHE`; selected #N/A/#DIV/0! cells reject as `SPREADSHEET_ERROR` with exact addresses. External-reference formulas never trigger network activity. [W03] [W12] [W17]
- Pair a 1900-system and 1904-system workbook for 2011-07-05: serials 40729 and 39267 must produce the same accepted date interpretation. Serial 60 in the 1900 system must not become a fabricated Gregorian day. Add date-only, local date-time, time-only, elapsed duration, and submillisecond cases; each preserves a declared meaning or rejects. [W04] [W18]
- Macro-enabled/encrypted/unsupported workbook subtypes fail clearly. No password collection, formula or macro execution, external refresh, or added calculation engine.
- A recognized package with a malformed selected sheet fails atomically; SheetJS's default suppression must not conceal the failure. [W10]

Run timezone cases in UTC, America/Indiana/Indianapolis, and Asia/Tokyo. Confirm date filters, day boundaries, field type, and saved restore. Formatting a Date object through toISOString is not a universal civil-time policy.

For Sheets, obtain user-prepared manual XLSX, ODS, CSV, and TSV exports of the same two-tab dataset, with the second tab active for text exports. For XLSX/ODS, compare the selected region, admitted raw cells, relevant formats, and stored formula results within the produced workbook capabilities. For CSV/TSV, compare exact exported text tokens, quoting, blanks, Unicode, tab selection, and record count; separate cell types/formats/formula caches are absent from the text table. Record the actual tab included: official TSV guidance says current sheet; the current manual CSV choice remains a producer check. ODS remains evaluation unless separately promoted. This verifies manual export; no service API, OAuth, published-link fetching, or live sync enters the application. Reject .gsheet/cache input with export guidance. [W25] [W26] [W27] [W28] [W29] [W30] [W31] [W32]

M2 docs: add worksheet/range/header selection, cached-formula and date limits, and “From Google Sheets: download, then open locally” to load-data.mdx. Include a proposed workbook example and tab-specific expected-values file under datasets; update the established demo/live-example registrations as needed.

## M3 — flat single-file Parquet, conditional promotion

Start with direct hyparquet; compare parquet-wasm only if producer fidelity or access to exact source values defeats the smaller route. Pin actual published artifacts and inspect licenses/build behavior; research source versions are not a tested dependency lock. [B07] [B08] [B09] [B10] [B11] [B12] [B13] [B14] [B15] [B16]

Create equivalent 257-record, eight-column PyArrow and DuckDB files. Require multiple row groups for the PyArrow member only. Add a separate 4,097-row DuckDB fixture with `ROW_GROUP_SIZE 2048`, inspect its produced metadata, and require multiple groups. DuckDB documents 2,048 as the minimum setting; do not infer group count solely from an option. [B45] Fields cover string, boolean, safe signed integer, floating value, nullable value, empty string, numeric-looking text, and Unicode. Define id i, integer i-128, floating i/4 for i=0…256: expect 257 IDs, integer sum 0, floating sum 8224. The independent manifest defines all remaining cells.

Test uncompressed and Snappy first. Gzip/Zstd or other codecs become promises only after their actual browser implementation passes. Cover dictionaries, nullable columns, page versions, and chosen encodings independently from compression. Repeat complete-row comparisons across row groups.

A separate 17-record semantics corpus isolates int64 boundaries, decimal(38,9), dates, UTC/local timestamps in millisecond/microsecond/nanosecond units, binary, nested values, and nonfinite numbers. Out-of-safe-range integers, unapproved decimals/time semantics, binary/nested data, unfamiliar annotations, encryption, external column-file references, and multi-file datasets reject before lossy conversion. Default decimal-to-Number and timestamp-to-Date behavior must not run before the rejection can protect values. [B06] [B09]

Review small files from Apache parquet-testing: alltypes_dictionary.parquet, datapage_v2.snappy.parquet, concatenated_gzip_members.parquet, byte_stream_split.zstd.parquet, int64_decimal.parquet, and nested_lists.snappy.parquet are candidate inventory entries. Pin exact refs, validate actual sizes, and derive expectations before executing; inventory alone is not a passed fixture. Avoid blindly running large or adversarial corpus members. [B39]

Structural corruption tests cover truncated footer/page, invalid dictionary IDs, and unavailable codecs: require a specific error and no partial source. Decide checksum policy before testing a small checksum-only corruption. If verification is a promised guarantee, it must reject or the reader fails promotion; otherwise record behavior and an explicit unverified-integrity limitation. A successful parse is never evidence of checksum verification. A complete local File proof does not claim remote ranges, predicate pushdown, or streaming-engine behavior.

M3 docs/examples ship only the accepted subset: update load-data.mdx and add proposed representative Parquet fixtures/expected-values records under datasets. If the subset excludes an important real producer, choose expansion, replacement, or conversion explicitly.

## M4 — Arrow/Feather and Avro only on demand

For Arrow, obtain PyArrow-produced 257-row IPC files and saved streams, with multiple record/dictionary batches. Test uncompressed, LZ4-frame, and Zstd independently; missing codecs must fail clearly. Feather V2 follows the file route; a Feather V1 fixture must produce an explicit unsupported-version/conversion message. Validate int64, decimal, date, timestamp units/timezones, extension fields, and nested-type rejection. Use a reviewed small Apache arrow-testing malformed fixture. [B26] [B27] [B28] [B29] [B30] [B31] [B32] [B41]

For Avro OCF, begin with Apache weather.avro, weather-deflate.avro, weather-snappy.avro, weather-zstd.avro, and weather.json. Pin source refs and independently establish exact expected records. Add a 17-record Java/Python-produced corpus for nullable/ambiguous unions, long boundaries, logical types, nested values, and codec/checksum/sync failures. Raw messages, schema-only input, and fingerprint-only single-object encodings reject as incomplete local tables. [B17] [B40]

Before either promotion, prove the chosen released package in the actual browser build. In particular, avsc's inspected generated reader uses new Function; moving it to a worker does not by itself satisfy strict no-eval CSP. If a released OCF route needs broad shims, custom container code, or policy weakening, prefer manual conversion. [B19] [B20] [B21] [B22] [B23] [B24] [B25] [B38]

Each promoted format adds a precise load-data.mdx section and datasets/example registrations. Unpromoted research does not become an advertised extension.

## Shared browser, layout, and persistence gates

Use the actual demo and library, not only mocks. SavedViewsWorkspace.test.tsx mocks ExplorEda; it can establish host workflow behavior but cannot prove decoder fidelity, real inference, filters, charts, or trace results. [E29]

At 1280, 783, and 390 CSS pixels, exercise upload control and landing drop, then Add source from a populated saved session. Verify readable filename/errors, keyboard-accessible selection, no horizontal overflow, and selected region/record count. Fresh sources begin with summary and rows. Existing saved tabs, chart positions, selected tab, filters, and annotations remain intact after cancel/failure and retain their intended state after adding a source.

Record before/after saved structures and actual visible data. Switch tabs, undo/redo, reload, restore project JSON, and trace a known record. A preview must never publish sampled rows as the full dataset or save its temporary layout. Include storage quota failure: report it truthfully without claiming a persisted source.

Test lazy assets and CSP in a production build. CSV-only sessions must not fetch workbook/Parquet/Arrow/Wasm chunks. Binary loading must use approved local assets; disallowed worker/eval/Wasm initialization errors become actionable reader-load failures. No row data or workbook links cause external requests.

## Declared performance experiments

Use deterministic fixtures with these logical shapes; capture actual encoded bytes and decoded string lengths before execution:

| Workload | Purpose |
| --- | --- |
| 10,000 × 12 fields | Ordinary mixed local table |
| 100,000 × 12 fields | Row-count scaling |
| 10,000 × 100 fields | Wide-table inference/index cost |
| 10,000 × 20 fields, including four 1,024-character ASCII fields per row | String residency and copy/serialization cost |

The last workload contains exactly 40,960,000 ASCII characters in those four fields before container/row overhead. These sizes are experiments, not capacity promises. Compare equivalent content across formats without assuming equal compressed file size.

Record browser/device, cold/warm load, parser/version/options, compressed bytes, decode time, admission/materialization time, ready-to-interact time, main-thread long tasks, cancellation response, chunk transfer, save/restore time, and peak memory where observable. Include parser-native structures, row copies, inferred fields/indexes, and retained history. Do not equate compressed bytes with resident cost.

Provisional product targets, **proposals only**: visible busy/cancel feedback within 100 ms of a main-thread opportunity; cancelled jobs can never publish; a worker-backed cancellation acknowledges within 250 ms; investigate main-thread tasks exceeding 50 ms. These are decision budgets to refine on declared devices, not measured achievements or universal browser guarantees. If smaller fixtures violate them, change execution placement/scope before raising arbitrary size ceilings.

## Future command run sheet — not executed

Run in a complete isolated checkout with its installed/pinned dependencies, following repository instructions. Do not run these against the packet.

```bash
# Targeted parser and workspace host checks.
pnpm --filter demo exec vitest run src/parsers.test.ts src/SavedViewsWorkspace.test.tsx

# Library types, UI rules, and documentation coverage.
pnpm --filter exploreda check-types
pnpm check:ui
pnpm --filter demo docs:check

# When new registered examples are added.
pnpm --filter demo exec vitest run src/demos/coverage.test.ts src/dashboardText.test.ts

# Production documentation/browser path described by the agent guide.
pnpm --filter demo build
pnpm --filter demo docs:verify

# Start the real demo; then perform the declared import/browser cases.
pnpm dev:agent

# Final repository gate after relevant targeted checks pass.
pnpm check
```

New real-format tests and browser scenarios must be added to the appropriate suite during implementation; the existing command names do not imply those tests already exist. The repository screenshot route pnpm shot supports the required widths, but static screenshots supplement actual file-input/state assertions.

## Completion record

For each milestone, save the fixture hashes, exact package/build identities, commands actually run, browser traces/screenshots, expected-versus-observed values, and the promotion decision. Explicitly list rejected subtypes and any unrun gate. Stop broadening tests once a concrete gate is resolved; stop promoting formats when semantic or maintenance costs exceed the small local-reader goal.

Keep live Sheets, database execution, remote URL imports, server streaming, arbitrary archives/lakehouses, exports/writes, application implementation in this research turn, and review-PR creation out of scope.


## Source references

Stable IDs use the same [sources.json](sources.json) ledger as the report.

[E01]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/AGENTS.md "Project rules"
[E02]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/README.md "Project overview"
[E03]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/package.json "Root package manifest"
[E04]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/pnpm-workspace.yaml "Workspace manifest"
[E05]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/docs/agent-guide.md "Agent guide"
[E06]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/docs/ui-defaults.md "UI defaults"
[E07]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/README.md "Library README"
[E08]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/package.json "Library package manifest"
[E09]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/apps/demo/package.json "Demo package manifest"
[E10]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/ExplorEda.tsx "ExplorEda component"
[E11]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/ExplorEdaProject.tsx "ExplorEdaProject component"
[E12]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/types/AnalysisProject.ts "Analysis project types"
[E13]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/types/ChartTypes.ts "Chart types"
[E14]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/types/SavedDataStructure.ts "Saved structure types"
[E15]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/lib/valueParsing.ts "Value parsing"
[E16]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/lib/analysis/sources.ts "Analysis source helpers"
[E17]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/lib/analysis/projectFile.ts "Project file codec"
[E18]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/providers/DataLayerProvider.tsx "Data layer provider"
[E19]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/apps/demo/src/readDataFile.ts "Local file dispatcher"
[E20]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/apps/demo/src/csvParser.ts "CSV parser"
[E21]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/apps/demo/src/jsonParser.ts "Raw JSON parser"
[E22]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/apps/demo/src/CsvUpload.tsx "Upload UI"
[E23]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/apps/demo/src/LandingPage.tsx "Landing page"
[E24]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/apps/demo/src/SavedViewsWorkspace.tsx "Saved views workspace"
[E25]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/apps/demo/src/savedViewsSession.ts "Saved views session"
[E26]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/apps/demo/src/savedViewsHistory.ts "Saved views history"
[E27]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/apps/demo/src/landing/PageFileDrop.tsx "Page file drop"
[E28]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/apps/demo/src/parsers.test.ts "Parser tests"
[E29]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/apps/demo/src/SavedViewsWorkspace.test.tsx "Workspace tests"
[E30]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/apps/demo/src/docs/pages/load-data.mdx "Load data documentation"
[E31]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/docs/intent/database-adapters/intent-brief.md "Database adapters intent"
[E32]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/docs/intent/database-adapters/shape-brief.md "Database adapters shape"
[E33]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/docs/intent/columnar-data-transport/intent-brief.md "Columnar transport intent"
[E34]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/docs/intent/columnar-data-transport/shape-brief.md "Columnar transport shape"
[E35]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/docs/intent/database-query-contract/intent-brief.md "Database query contract intent"
[E36]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/docs/intent/date-time-handling/intent-brief.md "Date/time intent"
[E37]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/lib/fieldSettings.ts "Field settings and conversion"
[E38]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/providers/lib/dataLayerState.ts "Data layer initialization"
[E39]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/SummaryTable/utils/dataTypeDetection.ts "Column type detection"
[P01]: https://www.papaparse.com/docs "Papa Parse documentation"
[P02]: https://github.com/mholt/PapaParse/blob/5.7.0/papaparse.js "Papa Parse 5.7.0 source"
[P03]: https://github.com/mholt/PapaParse/blob/5.7.0/package.json "Papa Parse package metadata and releases"
[P04]: https://github.com/mholt/PapaParse/releases "Papa Parse releases"
[P05]: https://jsonlines.org/ "JSON Lines format"
[P06]: https://www.rfc-editor.org/info/rfc4180/ "RFC 4180: Common Format and MIME Type for CSV Files"
[P07]: https://www.iana.org/assignments/media-types/text/tab-separated-values "IANA text/tab-separated-values registration"
[P08]: https://github.com/ndjson/ndjson-spec "NDJSON specification 1.0.0"
[P09]: https://www.rfc-editor.org/info/rfc8259/ "RFC 8259: The JSON Data Interchange Format"
[P10]: https://tc39.es/ecma262/multipage/structured-data.html#sec-json.stringify "ECMAScript JSON parse and stringify algorithms"
[P11]: https://github.com/josdejong/lossless-json "lossless-json maintainers' documentation"
[P12]: https://github.com/josdejong/lossless-json/blob/main/package.json "lossless-json package metadata"
[P13]: https://github.com/josdejong/lossless-json/blob/main/CHANGELOG.md "lossless-json changelog"
[P14]: https://www.papaparse.com/faq "Papa Parse FAQ"
[B01]: https://parquet.apache.org/docs/file-format/ "Parquet File Format"
[B02]: https://parquet.apache.org/docs/concepts/ "Parquet Concepts"
[B03]: https://parquet.apache.org/docs/file-format/data-pages/compression/ "Parquet compression definitions"
[B04]: https://parquet.apache.org/docs/file-format/data-pages/encodings/ "Parquet Encodings"
[B05]: https://parquet.apache.org/docs/file-format/nestedencoding/ "Parquet Nested Encoding"
[B06]: https://github.com/apache/parquet-format/blob/master/LogicalTypes.md "Parquet Logical Type Definitions"
[B07]: https://github.com/hyparam/hyparquet "hyparquet README"
[B08]: https://github.com/hyparam/hyparquet/blob/1eb9fe4607d9a53d68803b8ecfa1936720e47968/package.json "hyparquet package manifest at observed commit"
[B09]: https://github.com/hyparam/hyparquet/blob/1eb9fe4607d9a53d68803b8ecfa1936720e47968/src/convert.js "hyparquet value conversion source at observed commit"
[B10]: https://github.com/hyparam/hyparquet/blob/master/CHANGELOG.md "hyparquet changelog"
[B11]: https://github.com/hyparam/hyparquet-compressors "hyparquet-compressors README"
[B12]: https://github.com/hyparam/hyparquet-compressors/blob/master/package.json "hyparquet-compressors package manifest"
[B13]: https://kylebarron.dev/parquet-wasm/ "parquet-wasm v0.9.0 documentation"
[B14]: https://github.com/kylebarron/parquet-wasm/blob/v0.9.0/Cargo.toml "parquet-wasm v0.9.0 Cargo manifest"
[B15]: https://kylebarron.dev/parquet-wasm/classes/esm_parquet_wasm.ParquetFile.html "ParquetFile API"
[B16]: https://github.com/kylebarron/parquet-wasm/releases/tag/v0.9.0 "parquet-wasm v0.9.0 release"
[B17]: https://avro.apache.org/docs/1.12.0/specification/ "Apache Avro 1.12.0 specification"
[B18]: https://avro.apache.org/blog/2026/08/12/avro-1.12.2/ "Avro 1.12.2 release announcement"
[B19]: https://github.com/mtth/avsc/blob/91d653f72906102448a059cb81692177bb678f52/package.json "avsc package manifest at observed master commit"
[B20]: https://github.com/mtth/avsc/wiki "avsc wiki browser support"
[B21]: https://github.com/mtth/avsc/wiki/API "avsc API"
[B22]: https://github.com/mtth/avsc/wiki/Advanced-usage "avsc Advanced usage"
[B23]: https://github.com/mtth/avsc/blob/91d653f72906102448a059cb81692177bb678f52/lib/types.js "avsc generated record source at observed commit"
[B24]: https://github.com/mtth/avsc/blob/91d653f72906102448a059cb81692177bb678f52/etc/browser/avsc.js "avsc browser Blob entry point"
[B25]: https://api.github.com/repos/mtth/avsc/commits/91d653f72906102448a059cb81692177bb678f52 "avsc observed master commit metadata"
[B26]: https://arrow.apache.org/docs/format/Columnar.html "Arrow Columnar Format"
[B27]: https://arrow.apache.org/docs/python/feather.html "Feather File Format"
[B28]: https://arrow.apache.org/js/current/ "Apache Arrow JavaScript current documentation"
[B29]: https://github.com/apache/arrow-js/releases "Apache Arrow JS release list"
[B30]: https://github.com/apache/arrow-js/blob/v21.2.0/src/ipc/compression/registry.ts "Arrow JS 21.2.0 compression registry source"
[B31]: https://github.com/apache/arrow-js/blob/v21.2.0/src/ipc/reader.ts "Arrow JS 21.2.0 IPC reader source"
[B32]: https://github.com/apache/arrow-js/blob/v21.2.0/src/visitor/get.ts "Arrow JS 21.2.0 value getter source"
[B33]: https://duckdb.org/docs/current/clients/wasm/overview "DuckDB Wasm Client overview"
[B34]: https://duckdb.org/docs/current/clients/wasm/data_ingestion "DuckDB-Wasm Import Data"
[B35]: https://duckdb.org/docs/current/clients/wasm/deploying_duckdb_wasm "Deploy DuckDB-Wasm"
[B36]: https://github.com/duckdb/duckdb-wasm/blob/main/packages/duckdb-wasm/package.json "DuckDB-Wasm package manifest"
[B37]: https://github.com/duckdb/duckdb-wasm/releases/tag/v1.33.0 "DuckDB-Wasm observed GitHub release metadata"
[B38]: https://www.w3.org/TR/CSP3/ "Content Security Policy Level 3"
[B39]: https://github.com/apache/parquet-testing/blob/master/data/README.md "Apache Parquet compatibility test data"
[B40]: https://github.com/apache/avro/tree/main/share/test/data "Apache Avro shared test-data inventory"
[B41]: https://github.com/apache/arrow-testing/tree/master/data "Apache Arrow test-data inventory"
[B42]: https://github.com/apache/avro/blob/main/lang/js/package.json "Apache avro-js package manifest"
[B43]: https://github.com/apache/avro/blob/main/lang/js/etc/browser/avro.js "Apache avro-js browser entry point"
[B44]: https://api.github.com/repos/hyparam/hyparquet/commits/1eb9fe4607d9a53d68803b8ecfa1936720e47968 "hyparquet observed master commit metadata"
[B45]: https://duckdb.org/docs/current/data/parquet/tips "Parquet Tips"
[W01]: https://ecma-international.org/publications-and-standards/standards/ecma-376/ "ECMA-376: Office Open XML file formats"
[W02]: https://learn.microsoft.com/en-us/office/open-xml/spreadsheet/structure-of-a-spreadsheetml-document "Structure of a SpreadsheetML document"
[W03]: https://learn.microsoft.com/en-us/office/open-xml/spreadsheet/working-with-formulas "Working with formulas"
[W04]: https://support.microsoft.com/en-us/excel/date-systems-in-excel "Date systems in Excel"
[W05]: https://docs.sheetjs.com/docs/miscellany/formats/ "File Formats"
[W06]: https://docs.sheetjs.com/docs/getting-started/installation/frameworks/ "Frameworks and Bundlers"
[W07]: https://docs.sheetjs.com/docs/getting-started/installation/standalone/ "Standalone Browser Scripts"
[W08]: https://git.sheetjs.com/sheetjs/sheetjs "SheetJS Community Edition official source repository"
[W09]: https://docs.sheetjs.com/docs/miscellany/license/ "SheetJS Community Edition license"
[W10]: https://docs.sheetjs.com/docs/api/parse-options/ "Reading Files"
[W11]: https://docs.sheetjs.com/docs/csf/book/ "Workbook Object"
[W12]: https://docs.sheetjs.com/docs/csf/cell/ "Cell Objects"
[W13]: https://docs.sheetjs.com/docs/api/utilities/array/ "Arrays of Data"
[W14]: https://docs.sheetjs.com/docs/csf/features/merges/ "Merged Cells"
[W15]: https://docs.sheetjs.com/docs/csf/features/visibility/ "Sheet Visibility"
[W16]: https://docs.sheetjs.com/docs/csf/features/rowprops/ "Row Properties"
[W17]: https://docs.sheetjs.com/docs/csf/features/formulae/ "Formulae"
[W18]: https://docs.sheetjs.com/docs/csf/features/dates/ "Dates and Times"
[W19]: https://docs.sheetjs.com/docs/demos/bigdata/worker/ "Web Workers"
[W20]: https://docs.sheetjs.com/docs/csf/features/names/ "Defined Names"
[W21]: https://docs.sheetjs.com/docs/csf/features/vba/ "VBA and Macros"
[W22]: https://github.com/exceljs/exceljs/blob/v4.4.0/README.md "ExcelJS README at v4.4.0"
[W23]: https://github.com/exceljs/exceljs/blob/v4.4.0/package.json "ExcelJS package.json at v4.4.0"
[W24]: https://api.github.com/repos/exceljs/exceljs/releases/latest "ExcelJS latest release metadata and v4.4.0 release"
[W25]: https://support.google.com/docs/answer/49114?hl=en "Create, view, or download a file"
[W26]: https://developers.google.com/workspace/drive/api/guides/ref-export-formats "Export MIME types for Google Workspace documents"
[W27]: https://support.google.com/manufacturers/answer/6124098?hl=en "Supported file formats: Google Sheets TSV export"
[W28]: https://support.google.com/docs/answer/6388102?hl=en "Work on Google Docs, Sheets, & Slides offline"
[W29]: https://developers.google.com/workspace/drive/api/guides/about-files "Files and folders overview"
[W30]: https://support.google.com/drive/answer/10838124?hl=en "Use Google Drive for desktop"
[W31]: https://chromium.googlesource.com/chromium/src/+/9d94097261b83d3fe2af86de8b22a81da603c0ea/components/drive/file_system_core_util.cc "Chromium hosted-document pointer serialization"
[W32]: https://chromium.googlesource.com/chromium/src/+/1b93c87e38de8f82e35efd150d6db17dcccfaa17/components/drive/drive.proto "Chromium hosted-spreadsheet extension metadata"
[W33]: https://support.google.com/a/users/answer/9330963?hl=en&ref_topic=9296611 "Export spreadsheets"
[L01]: https://pandas.pydata.org/docs/user_guide/io.html "IO tools (text, CSV, HDF5, …)"
[L02]: https://pandas.pydata.org/docs/getting_started/install.html "Installation: optional dependencies"
[L03]: https://docs.pola.rs/api/python/stable/reference/io.html "Input/output"
[L04]: https://docs.pola.rs/user-guide/io/excel/ "Excel"
[L05]: https://duckdb.org/docs/current/data/overview "Importing Data"
[L06]: https://haven.tidyverse.org/ "Import and Export SPSS, Stata and SAS Files"
[L07]: https://readr.tidyverse.org/ "Read Rectangular Text Data"
[L08]: https://help.tableau.com/current/pro/desktop/en-us/examples_text.htm "Text File"
[L09]: https://help.tableau.com/current/pro/desktop/en-us/examples_statfile.htm "Statistical File"
[L10]: https://learn.microsoft.com/en-us/power-query/connectors/ "Power Query connectors"
[L11]: https://github.com/perspective-dev/perspective "Perspective README"
[L12]: https://observablehq.github.io/framework/lib/duckdb "DuckDB | Observable Framework"
[L13]: https://arrow.apache.org/docs/python/dataset.html "Tabular Datasets"
[L14]: https://stat.ethz.ch/R-manual/R-devel/library/base/html/readRDS.html "Serialization Interface for Single Objects"
[L15]: https://docs.python.org/3/library/pickle.html "pickle — Python object serialization"
[L16]: https://docs.h5py.org/en/stable/high/dataset.html "Datasets"
[L17]: https://pandas.pydata.org/docs/reference/api/pandas.read_hdf.html "pandas.read_hdf"
[L18]: https://docs.unidata.ucar.edu/netcdf-c/current/netcdf_data_model.html "The NetCDF Data Model"
[L19]: https://docs.xarray.dev/en/stable/user-guide/io.html "Reading and writing files"
[L20]: https://zarr-specs.readthedocs.io/en/latest/v3/core/index.html "Zarr core specification"
[L21]: https://numpy.org/doc/stable/reference/generated/numpy.lib.format.html "numpy.lib.format"
[L22]: https://numpy.org/doc/stable/reference/generated/numpy.load.html "numpy.load"
[L23]: https://docs.scipy.org/doc/scipy/reference/generated/scipy.io.loadmat.html "scipy.io.loadmat"
[L24]: https://www.rfc-editor.org/info/rfc7946/ "RFC 7946: The GeoJSON Format"
[L25]: https://github.com/topojson/topojson-specification "TopoJSON Format Specification"
[L26]: https://gdal.org/en/stable/drivers/vector/shapefile.html "ESRI Shapefile / DBF"
[L27]: https://gdal.org/en/stable/drivers/vector/gpkg.html "GPKG — GeoPackage vector"
[L28]: https://gdal.org/en/stable/drivers/vector/kml.html "KML — Keyhole Markup Language"
[L29]: https://docs.astropy.org/en/stable/io/fits/index.html "FITS File Handling (astropy.io.fits)"
[L30]: https://readr.tidyverse.org/reference/read_log.html "Read common/combined log file into a tibble"
[L31]: https://orc.apache.org/specification/ORCv1/ "ORC Specification v1"
[L32]: https://arrow.apache.org/docs/python/orc.html "Reading and Writing the Apache ORC Format"
[L33]: https://github.com/msgpack/msgpack/blob/master/spec.md "MessagePack specification"
[L34]: https://github.com/msgpack/msgpack-javascript "MessagePack for JavaScript and TypeScript"
[L35]: https://bsonspec.org/spec.html "BSON Specification"
[L36]: https://github.com/mongodb/js-bson "BSON Parser for node and browser"
[L37]: https://protobuf.dev/programming-guides/encoding/ "Encoding | Protocol Buffers Documentation"
[L38]: https://github.com/protobufjs/protobuf.js "protobuf.js README"
[L39]: https://www.sqlite.org/fileformat.html "Database File Format"
[L40]: https://sqlite.org/wasm/doc/trunk/index.md "sqlite3 WebAssembly & JavaScript Documentation Index"
[L41]: https://duckdb.org/docs/current/sql/statements/attach "ATTACH and DETACH Statements"
[L42]: https://iceberg.apache.org/spec/ "Apache Iceberg Table Spec"
[L43]: https://github.com/delta-io/delta/blob/master/PROTOCOL.md "Delta Transaction Log Protocol"
[L44]: https://hudi.apache.org/docs/table_types/ "Table & Query Types"
[L45]: https://www.rfc-editor.org/rfc/rfc1952.html "RFC 1952: GZIP file format specification version 4.3"
[L46]: https://compression.spec.whatwg.org/ "Compression Standard"
[L47]: https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT "APPNOTE.TXT: ZIP File Format Specification"
[L48]: https://www.rfc-editor.org/rfc/rfc8878.html "RFC 8878: Zstandard Compression and application/zstd"
[L49]: https://pandas.pydata.org/docs/reference/api/pandas.read_xml.html "pandas.read_xml"
[L50]: https://pandas.pydata.org/docs/reference/api/pandas.read_html.html "pandas.read_html"
[L51]: https://duckdb.org/docs/current/core_extensions/excel "Excel Extension"
[L52]: https://pandas.pydata.org/docs/reference/api/pandas.read_spss.html "pandas.read_spss"
[L53]: https://help.tableau.com/current/pro/desktop/en-us/examples_excel.htm "Excel"
[L54]: https://help.tableau.com/current/pro/desktop/en-us/examples_json.htm "JSON File"
[L55]: https://help.tableau.com/current/pro/desktop/en-us/maps_shapefiles.htm "Create Tableau Maps from Spatial Files"
[L56]: https://docs.pola.rs/api/python/stable/reference/api/polars.read_delta.html "polars.read_delta"
[L57]: https://docs.pola.rs/api/python/stable/reference/api/polars.scan_iceberg.html "polars.scan_iceberg"
