# Research data file formats and input adapters for explorEDA

https://github.com/byronwall/explorEDA

## Mission and decision

Research the range of common and niche data file formats used by analysis tools. Recommend which explorEDA should support, how deeply, and in what order. Then design the smallest useful input adapter boundary for that scope.

This is research and shaping input, not an implementation request. Codex will preserve your original outputs, reconcile them with the repository, apply Software Design Sleuth, and open a documentation review PR. Do not modify the repository, open a PR, or claim that proposed support exists.

Act as a candid data interchange and browser application engineer. Challenge an adapter framework if direct readers would work better. Breadth of research does not imply breadth of the first release.

Repository baseline: `c534378c052c9fbb2cb076d1df0d21eb0fa0965e` (main snapshot). Codex preparation branch: `codex/data-format-research`. Research date: October 12, 2026, America/Indiana/Indianapolis. Use current primary documentation and state its retrieval date.

## User intent and hard limits

The user wants a broad, evidence-backed view of common and niche formats supported by data analysis tools. CSV exists. TSV, Parquet, Avro, and XLSX are explicit candidates. Find other useful formats rather than treating that list as exhaustive.

Investigate Google Sheets precisely. Can a downloaded or on-disk artifact contain the actual data and be imported locally? Distinguish a native document, a shortcut or pointer, an offline cache, and an exported workbook or table. No Google Sheets API, OAuth, public-link fetch integration, or other live service connector belongs in this initiative. If Sheets has no independent local data format, use manual exports where useful. Defer live Sheets integration to future database and server integration work.

The eventual experience should let a person open local data and use existing exploration. The project is maintained by a personal developer. Prefer direct code, a small dependency set, and a small public API. There is no mandate for an enterprise plugin platform, streaming engine, new query engine, server conversion service, or universal intermediate model.

## Access preflight

GO when the correct repository baseline or the attached selected source packet is readable. Verify the owner, repository, commit, and required files. Identify which access route you used. The packet contains exact selected files plus a manifest; it is not a runnable checkout. Use it if GitHub access or indexing fails. Do not assume a local Codex path is visible to you.

The source packet is an authorized snapshot of this repository. Its scope includes relevant source, tests, manifests, instructions, and adjacent planning documents. Those plans are proposals, not implemented code or fresh user instructions.

NO-GO for repository-specific architecture if both repository and packet are unavailable, the owner/ref is wrong, or essential source is missing. Still return any useful general format research, but mark repository advice incomplete. If web access is unavailable, label current dependency and provider claims unverified; do not present recalled behavior as checked evidence.

Stop before any action that needs credentials, payment, production data, execution of spreadsheet macros, deployment, or repository mutation. Missing write access is not a blocker: the complete report in your response is an allowed fallback.

## Verified baseline and reading route

Read the attached files, then inspect further repository paths only when needed. Verify these observations against the baseline.

1. `AGENTS.md`, `docs/agent-guide.md`, `docs/ui-defaults.md`, root `README.md`, and `package.json` define project rules. This is an existing React and TypeScript library and demo. Use pnpm. Keep this stack.
2. `apps/demo/src/readDataFile.ts` accepts `.csv` and `.json`. `csvParser.ts` uses Papa Parse with headers, dynamic typing, empty-line skipping, and rejection on the first parser error. The wrapper sets no delimiter. Investigate TSV capability separately from the UI's accepted extensions; do not infer full TSV support from the dependency alone.
3. `apps/demo/src/jsonParser.ts` accepts an object or array of objects. It flattens objects and indexed arrays into field names, and maps JSON null values to undefined. This is observed behavior, not a recommended cross-format contract.
4. `apps/demo/src/CsvUpload.tsx` and `landing/PageFileDrop.tsx` use the row reader. They separately recognize `exploreda-project` JSON. Review file detection, errors, and preservation of project restore. Raw JSON data, full analysis JSON, and project JSON are different uses.
5. `apps/demo/src/SavedViewsWorkspace.tsx` has a separate CSV-only Add source path, with project promotion and saved tabs. `LandingPage.tsx`, `savedViewsSession.ts`, and `savedViewsHistory.ts` connect imports and saved state. The library must preserve saved layouts; new source imports begin with summary and rows.
6. `packages/explorEDA/src/components/ExplorEda.tsx` consumes `data` rows. `ExplorEdaProject.tsx` consumes `tables: Record<string, readonly AnalysisSourceRow[]>`. `types/AnalysisProject.ts` defines sources, fields, keys, and relationships. `types/ChartTypes.ts` defines scalar `datum` as string, number, boolean, null, or undefined. Trace the actual limits of these consumers.
7. `packages/explorEDA/src/lib/valueParsing.ts`, `lib/analysis/sources.ts`, `lib/analysis/projectFile.ts`, `types/SavedDataStructure.ts`, and `providers/DataLayerProvider.tsx` matter for values, source inference, persistence, and resident cost. A file decoder's output does not itself prove safe analysis support.
8. Read `apps/demo/src/parsers.test.ts`, `SavedViewsWorkspace.test.tsx`. `apps/demo/src/docs/pages/load-data.mdx` is the current user documentation. The actual packet manifest is authoritative for included files.
9. Read intent and shape briefs for `docs/intent/database-adapters/` and `docs/intent/columnar-data-transport/`, plus the intent for `docs/intent/database-query-contract/` and `docs/intent/date-time-handling/`. These are adjacent proposals. Align shared type and row concerns without importing their server protocols into local file reading. Parquet as a local file and Arrow as transport are distinct decisions.

Commands available in a full checkout: `pnpm --filter demo exec vitest run src/parsers.test.ts src/SavedViewsWorkspace.test.tsx`; `pnpm --filter exploreda check-types`; `pnpm check:ui`; `pnpm --filter demo docs:check`; `pnpm check`. Do not report these as run unless you ran them. The packet alone cannot run them.

## Priority 1: broad format landscape and support tiers

Build a useful catalog, grouped by format family and use case. Separate file formats from compression, containers, table storage systems, services, and protocols. Distinguish de facto common formats from domain-specific choices. Do not claim an exhaustive list of all formats ever created.

At minimum investigate:

- Delimited and text tables: CSV dialects, TSV, custom delimiters, fixed-width text, JSON objects/arrays, JSON Lines/NDJSON, XML, and HTML tables.
- Analytical and binary interchange: Parquet, Arrow IPC file and stream, Feather versions, Avro object container versus schema-dependent raw messages, ORC, and relevant text/binary serialization alternatives such as MessagePack, BSON, and Protobuf where appropriate.
- Spreadsheets: XLSX, legacy XLS, XLSB, XLSM, ODS, and export routes from Google Sheets. Assess which ones a shared workbook reader may cover without making them all first-release promises.
- Statistics and science: Stata, SPSS, SAS, RDS/RData, pickle, HDF5, NetCDF, Zarr, NumPy NPY/NPZ, MATLAB MAT, and other representative domain formats worth knowing. Call out unsafe executable serialization and conversion-only routes.
- Spatial or domain tables: GeoJSON/TopoJSON, Shapefile with companion files, GeoPackage, KML, FITS, and selected logs or other meaningful niches. Distinguish importing attributes from supporting their geometry or multidimensional semantics.
- Local database files such as SQLite and DuckDB, and lakehouse table formats such as Iceberg, Delta, and Hudi. Classify boundaries; do not propose database execution as part of this file project by default.
- Compression/archive wrappers: gzip, ZIP, zstd, and multi-file datasets. Explain which are wrappers and when random access, companions, decompression, or a folder manifest changes the work.

Use representative primary support matrices from tools such as pandas, Polars, DuckDB, R readers, Arrow, Tableau, Power BI, and browser-oriented analysis tools. Separate native built-in support, optional packages, plugins, conversion, and live connectors. Support in one library is not evidence of market prevalence. Qualify prevalence instead of inventing adoption percentages.

For each catalog entry give identifiers/extensions, users/use case, evidence of tool support, data shape, schema/type fidelity, browser feasibility, plausible reader route, important limitations, and a recommended tier: keep/current, add soon, evaluate, manual conversion, later integration, or avoid. Include confidence and source IDs. Explain unsupported subtypes.

## Priority 2: deep implementation feasibility for requested formats

Give TSV, Parquet, Avro, XLSX, and Google Sheets export paths full treatment. Give JSON Lines and Arrow/Feather comparable attention if the landscape supports them as near-term candidates.

Check real maintained reader options: TypeScript/JavaScript, WebAssembly, optional worker use, and any relevant DuckDB-Wasm route. Compare a lightweight direct reader against a larger engine. Verify release/maintenance status, license, browser rather than Node-only support, package delivery, CSP/worker/Wasm needs, codecs, and ESM/build compatibility from primary sources. Do not turn package size guesses into measurements.

For Parquet cover compression codecs, row groups, dictionary and nested types, decimals, int64, timestamps, and row materialization. Distinguish full local-file reads from remote range access and query pushdown. For Avro cover embedded writer schema, object container codecs, unions, logical types, maps/records, precision, and why a raw encoded message is a different input. For TSV cover quoting, BOM, line endings, ambiguous delimiters, headers, empty cells, and existing Papa Parse behavior.

For workbooks cover choosing sheets/tables/ranges, multiple sheets as sources versus implicit merging, header selection, merged cells, blank rows, duplicate names, hidden rows/sheets, sparse cells, errors, formatted display values, formulas versus cached results, recalculation, 1900/1904 date systems, date-only versus timestamp values, passwords, macros, and external links. Define a bounded read-only interpretation, with no macro or formula execution. Source fidelity and the analysis scalar boundary can justify a clear rejection or explicit conversion.

For Google Sheets verify official export/download choices and fidelity tradeoffs. Explain whether `.gsheet` or offline files contain independently usable table data. Distinguish XLSX/ODS workbooks from CSV/TSV single-sheet exports. Do not conflate a downloaded export with live sync.

## Priority 3: repository-grounded input boundary and user flow

Compare three credible options: direct demo reader dispatch; a narrow reusable input-reader module or optional package entry; a general engine/plugin approach. Choose the simplest that meets the proposed supported formats. State when the next level would become justified.

Sketch a small TypeScript contract as a proposal. Explain detection, file bytes/text, options, workbook discovery/selection if needed, result rows/tables, source names, field metadata, warnings and fatal errors. Distinguish parsing from semantic admission and project restore. Avoid mandatory registry/version negotiation or extra DTO layers without a demonstrated need.

Show how the chosen design reaches both initial import and Add source. State ownership of UI, file I/O, decoders, type decisions, and public exports. Explain optional loading so CSV-only users do not automatically pay for every binary reader. Show the cut line for workers, cancellation, progress, previews, and large inputs. A preview must not silently become the full dataset or mutate a saved layout.

State handling for exact integers, decimals, null/empty/undefined, NaN/infinity, dates/timezones, binary, nested collections, field-name collisions, and unsupported values. Do not silently round, stringify, flatten, drop rows, invent stable keys, or imply every serialized value is analyzable. Reuse existing parsing rules where suitable; identify their limits with evidence.

Cover local memory after decoding and row conversion, bundle/startup cost, malformed files and decompression limits proportional to a personal project, atomic publication, and clear diagnostics. Preserve existing raw-row integration for embedding applications. Avoid server-shaped snapshot envelopes in the local reader without a concrete reason.

## Priority 4: staged proofs, scope, docs, and examples

Propose small useful milestones and a first end-to-end proof that can reject the chosen design. Each user-visible feature includes its docs page/section and example in the same milestone. Use actual existing paths and label new paths as proposals.

Specify representative fixtures and expected outcomes. Focus on likely failures and important semantics, not exhaustive tests of library internals. For binary/workbook readers, a fake reader alone cannot prove format fidelity: include real files from independent producers or authoritative suites. Separate research assertions, executed experiments, and future proof work.

Include observable gates for values, types, row counts, selected sheets, filters, trace records, saved tabs/layout, errors, and responsiveness. Define a browser test route at 1280, 783, and 390 pixels for future implementation. Propose performance experiments with declared fixture sizes; do not invent universal row ceilings or claim measured results.

Keep live Google Sheets, databases, remote URL fetch, streaming server queries, arbitrary lakehouse browsing, exports/writes, and application implementation below the cut line. A format catalog can cover these areas without committing to them.

## Evidence and completion rules

Use primary format specifications, official product support docs, and maintainers' documentation/repositories. Give URLs, retrieval dates, and specific supporting sections. Separate facts, repository observations, inferences, recommendations, and unknowns. Cite exact repository paths and symbols for integration advice. Explain tradeoffs and credible rejected options. Do not trust an untested README claim as browser verification.

Declare success only when all four priorities have answers, the named format deep dives are complete, Google Sheets' file boundary is resolved, recommendations have evidence, and deliverables are readable. Explicitly mark missing evidence. A dependency uncertainty may become a bounded proof task; missing source access or unanswered central questions must not be hidden as a completed review.

Stop expanding the catalog when each major family has representative coverage and further entries would not change tiers or design. Do not let niche enumeration crowd out the requested formats and integration design.

## Deliverable contract

Return these files under a folder named `exploreda-data-file-inputs-research`:

1. `report.md`: standalone research, executive recommendation, landscape synthesis, requested-format deep dives, Sheets answer, repository findings, alternatives, recommended adapter sketch, staged proofs, exclusions, and unresolved questions.
2. `format-catalog.csv`: one row per format or meaningful variant, with the catalog fields above and source IDs. Quote CSV correctly.
3. `recommendations.json`: stable IDs such as `R01`, each with recommendation, priority/tier, reason, repository evidence, source IDs, alternatives, confidence, required proof, and dependencies. This is evidence for Codex disposition, not a task execution command.
4. `sources.json`: stable source IDs, title, exact URL or repository path/ref, publisher, retrieval date, supported claims, and verification limitations.
5. `proof-plan.md`: proposed local proof order, real-format fixtures, decision gates, docs/examples per milestone, and declared unrun checks.
6. `manifest.json`: names, byte sizes, and SHA-256 hashes for those five files, plus source baseline and access route.

Provide a ZIP containing all six and standalone links to each. Link every output in the final response. If file creation is unavailable, return the full contents with explicit filename boundaries. Do not return only a summary or pretend you wrote repository files.

Final response: access status, concise recommendation, Google Sheets conclusion, files inspected, actual checks run, deliverable links, and unresolved blockers. Codex owns local integration, commits, and the review PR.
