# Independent evidence review

Reviewed 2026-10-20. Baseline and current origin/main:9b16d78e3ed0742ed4d5858c1939fec9e758b510.
The checkout was clean before collection. Origin was refreshed with approved access after sandbox DNS failed.

## Originals and access

Pro completed after 23m 12s. Collected ZIP through its normal download control under direct standing human approval.
Published ZIP and manifest hashes match. CRC, safe relative paths, no symlinks, exact inventory and UTF-8 pass.
All four report sizes and hashes match the manifest.
A standalone download opened raw text; its 12 s event timed out. No independent companion equality is claimed.
All required contents are preserved from the verified archive.

Pro reports that Library saving was rejected. Local collection did not require it or retry it.
No downloaded programs were executed. No follow-up was needed.

## Current source checks

All 38 report receipts match the uploaded manifest. All 35 baseline files authenticate against local Git objects.
All 12 supplemental receipts match their baseline bytes, SHA-256 and Git blob IDs.
Supplemental files also match current checkout bytes.
Intent edits below intentionally supersede their baseline snapshots.

- DataTable resolves calculated columns before getFilteredRows and passes matching rows to the toolbar. CSV uses configured field IDs.
- Table search scans resolved properties except \_\_ID, including hidden fields. It differs from linked and Rows-local filters.
- columns.ts performs whole-column inference. valueParsing.ts protects leading-zero and unsafe-integer strings.
  CSV still cannot retain distinct native values that share one serialized cell.
- saveAnalysisToStructure uses rawData. SavedViewsWorkspace exports sourceRows for an ordinary view, with saved settings.
- selectAnalysisProjectView filters source definitions and table names. It keeps whole arrays and the original view.
  It gathers query filter parameters but does not traverse option-only sources or prune bindings.
  Validation checks option sources and binding definitions. P-OPTIONS/P-BINDING remain source-predicted probes.
- savedViewsSession writes project tables with ordinary JSON. Project files use a special-value codec.
  The optional special-value reload probe remains unrun.
- Save modifiedAt and export filenames are activity times. They do not establish source-as-of.
  Native exports do not carry the sender's undo timeline.

These checks support contract distinctions. They do not prove the proposed browser flow or establish a recipient defect.

## Primary sources checked

Opened these official pages on 2026-10-20. Summaries below are facts; destination choices remain local inference.

- [Observable loaders](https://observablehq.github.io/framework/data-loaders) create build-time data. [Deployment](https://observablehq.github.io/framework/deploying) supports static hosting.
- [Jupyter format](https://nbformat.readthedocs.io/en/latest/format_description.html) stores source and outputs. [Execution](https://nbconvert.readthedocs.io/en/latest/execute_api.html) uses a kernel and working path.
- [Tableau packages](https://help.tableau.com/current/pro/desktop/en-us/save_savework_packagedworkbooks.htm) include local resources and require compatible software. Their data remains readable.
- [CSVW](https://www.w3.org/TR/tabular-metadata/) defines datatype and null metadata. Its default null marker is empty text.
- [Data Package](https://datapackage.org/standard/data-package/) permits differing publisher meanings for created. [Table Schema](https://datapackage.org/standard/table-schema/) applies missing-value conversion before type conversion.
- [DuckDB export/import](https://duckdb.org/docs/current/sql/statements/export) writes schema and load SQL with table data. Import expects a fresh database.

Inference: these contracts distinguish presenting, reopening and rerunning a computation.
They do not establish demand or justify importing their machinery into explorEDA.

## Proof limits

Read every substantive report. Parsed the structured manifest and authenticated its complete inventories.
Fifteen independent integer/rational anchors confirm the proposed totals, populations and formula arithmetic.
No downloaded fixture code ran. No new serializer, query, author, browser, recipient or performance proof ran.
Existing test results and the required repository gate appear in [run.md](run.md).
The proposed docs section, runnable example and manual note remain future comparisons.
