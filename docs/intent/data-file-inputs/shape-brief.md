---
title: "Local data file inputs — shape brief"
slug: "data-file-inputs"
phase: shape
status: draft
last_updated: "2026-10-12"
---

# Local data file inputs — proposed scope

**Outcome:** Open useful local formats without changing the meaning of their table data.

**Primary flow:** Choose or drop a file → select workbook data when needed → validate the complete table → explore and save it.

## Feature scope

```text
Local file import
├── PLANNED ADDITIONS
│   ├── One import path for initial load and Add source
│   │   ├── Keep CSV, JSON, and separate project restore behavior
│   │   ├── Show useful file, field, row, and unsupported-value errors
│   │   └── Apply a complete table once; preserve the prior view on failure
│   ├── TSV with an explicit tab delimiter and quoted-field support
│   ├── JSON Lines / NDJSON: one flat object per record line
│   │   └── Reject blank records, duplicate keys, and unhandled nested values
│   ├── XLSX: one selected worksheet, range, and header row
│   │   ├── Preview values and selection before import
│   │   └── Import stored formula results; do not calculate formulas
│   └── Matching load-data docs and an example for each enabled format
├── EVALUATE BEFORE ENABLING
│   ├── Parquet: one complete flat local file, proven types and codecs
│   ├── Avro: object container files with an embedded writer schema
│   └── Google Sheets exports: real XLSX, CSV, and TSV producer fixtures
└── LATER POSSIBILITIES
    ├── Arrow IPC / Feather V2, ODS, XLSB, and a separate gzip wrapper
    ├── Specialist statistical, scientific, and spatial inputs
    └── Live Sheets, databases, remote connectors, and lakehouse readers
```

## Behavior

| Situation | Expected result |
| --- | --- |
| A workbook has several sheets or table regions | Select one table. Do not merge sheets automatically. |
| A formula lacks a stored result, or selected cells contain unresolved errors or merges | Explain the affected cells. Require a clean selection or corrected export. |
| A value exceeds the supported numeric, time, binary, or nested representation | Preserve it through a proved explicit mapping, or reject it before lossy conversion. |
| A read fails, exceeds a measured limit, or is cancelled | Keep the prior analysis. Never publish a truncated preview as a complete import. |
| A user imports a Sheets export | Treat it as a local snapshot. The source document does not stay connected. |

## Decisions and boundaries

**Appetite:** Propose one small reader function shared by the demo's import surfaces. Add optional format modules as each proof passes. Keep the library row based. Do not create a public adapter package, registration system, SQL engine, or Arrow intermediate representation.

The simplest alternative is to recommend CSV conversion for every file. That remains useful for specialist formats, but misses the requested direct imports. A shared dispatcher removes the current CSV-only Add source split without requiring a framework. Return rows plus the field information needed by actual consumers. Add workbook discovery and selection only to that reader's flow.

Use Papa Parse for TSV with explicit delimiter and value rules. Consider SheetJS CE for XLSX, from a verified official artifact. Evaluate hyparquet first for Parquet; try parquet-wasm only if a required case fails. Avro needs an independent browser build, codec, and content security policy proof. None of these candidate choices is a shipped support claim.

**First proof:** Establish value fidelity before adding workbook or binary dependencies.

**Try:** Import a small adversarial TSV through initial load and Add source. Include quoted tabs, leading-zero identifiers, missing cells, date-like text, a large integer, and a field populated after row 500.

**Observe:** Compare expected fields and values through summary, rows, filtering, trace records, project promotion, session reload, history, and project-file restore. Verify the existing layout survives Add source and a rejected import.

**Decide:** Continue only when admitted values retain their meaning in every exercised consumer. If metadata is ignored or inference changes values, fix that narrow path first. Keep unsupported formats disabled. Do not introduce a general type system to pass the first proof.

Each later format slice includes its load-data documentation and one working example. Workbook proof covers sheet selection, dates, formulas, and hidden-content policy. Binary proof uses independently produced fixtures, selected codecs, exact values, and the production browser build. Choose practical file limits from measured fixtures; the research's benchmark sizes are suggestions.

**Cut line and rollback:** Defer automatic nested flattening, multi-file datasets, workbook editing, arbitrary archives, and browser cache decoding. Do not import executable object serialization. Preserve existing CSV/JSON behavior without building parallel version support. A failed format proof can remove that reader from selection while existing readers remain usable.

The [intent](intent-brief.md) and [evidence review](evidence/recommendation-review.md) explain the scope. The [full research](raw/2026-10-12-pro/exploreda-data-file-inputs-research/report.md) retains detailed alternatives. Implementation has not started.
