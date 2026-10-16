# Editorial and integration report

## Outcome and interpretation of “complete”

The artifact-production target is met as authored source: 40 notebooks, 25 compositions and 10 dashboards. All 75 have physical entry files, local real data, two evidence-backed findings, source records and discovery metadata. They are not outlines or proposed chart inventories. No incomplete artifact file is included in the delivered counts. The remaining gate is executable/native validation and public-demo integration, not data or prose generation.

Readiness is deliberately `pending-local-compiler-verification` for every entry. Successful Python computation, structural checks and the real notebook fence-parser run do not establish that a renderer accepts every setting, that an artboard is legible, or that a linked selection behaves correctly. The two-level status—authored content versus native verification—must survive integration.

## Source baseline and access

The authorized repository is `byronwall/explorEDA` at `ea8b52ff742f11d1fb89457acabbcd27b0bd04e7`. The packet is selected source, not a dependency-complete checkout. Its 37 manifest hashes are verified in `evidence/source-inspection.json`. Inspection covered repository guidance; notebook/project/dashboard/composition documentation; forecast data and notebook; notebook parser/compiler/reader and tests; DSL project/composition/compile/setting/reference implementation and relevant tests; demo catalogue, coverage, saved settings and analysis loading; dataset provenance and reserve-source research; and the DSL CLI. Large implementation files were inspected in relevant sections rather than represented as a line-by-line code review.

Read-only GitHub access confirmed the baseline package manifests and supplied small real external data records. No repository write was attempted. Direct compute-environment Internet and binary downloads were unavailable, so acquisition used installed historical data snapshots with dataset-specific rights, exact authorized CSV bytes, and disclosed selected-field captures through GitHub. The optional reference acquisition scripts document those routes rather than claiming failed downloads succeeded. Original upstream retrieval dates are not inferred from local file-copy times.

`apps/demo/src/demos/coverage.test.ts` was requested in the reading route but was not in the selected packet and was not separately inspected. The applicable test command is retained as an unrun integration check; it is not listed as a read file.

## Editorial strategy

The release sequence alternates dataset families and then formats. It avoids publishing a run of near-identical plots from one benchmark. Each family has a specific observation unit: hour, weekly atmospheric reading, month, operating day, household, strike, firm-year, country-year, flower, wine assay, match, team appearance or catalogue record. A change of unit is explicit in a prepared table and query, never an implicit denominator switch.

“Different questions, same data” is used for ERCOT, CO2, ocean temperatures, fertility and football. The series does not promise fifty arbitrary views. For example, the ERCOT notebooks distinguish signed from absolute error, relative error from level, and clock patterns from coverage; the dashboard investigates individual hours while the composition explains the zero baseline. These are different reading tasks with shared source provenance.

“Improve this visualization” is an original design series, not a recreation of a protected reference layout. Its references are the baseline's supported primitives and the actual source dictionaries. The substantive changes are documented in each design companion:

| Problem in a basic view | Change and benefit | Information relinquished |
|---|---|---|
| Two high demand lines make a small miss difficult to read. | Subtract forecast from served demand and retain a constant zero guide. | The original demand level disappears; the notebook keeps the original pair. |
| A long-term CO2 rise hides the within-year pattern. | Subtract each year's available-week mean before comparing months. | Absolute atmospheric concentration and incomplete-year weighting are no longer visible in the centered panel. |
| An extreme duration compresses shorter strikes. | Use a documented logarithmic duration view and retain the original-unit table. | Equal screen distances no longer mean equal numbers of days. |
| Different firm sizes dominate a shared absolute scale. | Rebase investment to a common starting index while keeping shared axes. | Indexing hides absolute financial magnitude and can magnify small denominators. |
| Multiple chemical assays are placed on one raw ruler. | Give each assay a labeled scale and compare within that assay. | Cross-assay line height cannot be read as a common physical quantity. |

The notebooks state observations, not causal mechanisms. A boundary in the Nile series is not a causal experiment; an influential plant observation is not automatically erroneous; cultivar classification is not a wine tasting score; metadata date spans are not automatically lifespans; and group-stage performance is not a tournament-wide result. Static conclusions are accompanied by filters, eligible counts and exclusions in the evidence files.

## Data, licenses and reproducibility

Seventeen families are delivered, with fourteen conservatively new relative to the inspected catalogue. Thirty-two CSV tables contain 9,627 rows across multiple grains; these include derived summaries, long forms, lookups and repeated observations and must not be added as a population. The five root companion files and the manifest retain source credits so Codex can show them on the eventual page.

Every dataset has source and license URLs, a documented acquisition method, a local capture time with its meaning, coverage, missingness, units, transformations, row counts, raw SHA-256 and prepared-table SHA-256. Installed snapshots retain their package versions and dataset-specific copyright declarations. A package code license is not used to override a data license. In particular, barley was removed when the current Vega dataset metadata identified its rights as unspecified; it is not present as a ready file or a fallback fixture. Copper, Scotland and STAR98 were also excluded where their local notices required permission.

The ERCOT CSV is byte-identical to the authorized forecast sample. Its original EIA request and upstream retrieval time are not in the packet and remain a provenance limitation rather than fabricated metadata. The football and Tate snapshots are selected-field transcriptions of actual readable repository records. Their capture scripts, recorded upstream Git blob SHA-1 values and captured-byte SHA-256 values make the transformation auditable; they do not establish the SHA-256 of an unavailable original whole file. Tate's full-source count is explicitly null. An independent field-by-field reconciliation is recommended before publishing those two families.

Preparation is deterministic and offline. Floats are written with 12 significant digits, empty values remain null, and evidence calculations re-read these exact outputs. An expression record names the operation, fields, filters, denominator, numerator where applicable, rounding and contributing row IDs. Means, medians, Pearson correlations, quantiles and shares are computed, not read from chart appearance. Prepared model quantities and standardized fields are identified as offline transformations, not native DSL functions.

Grunfeld and football provide richer related tables. Their lookup keys must be unique and Python joins are audited as many-to-one, preserving the base population. A firm average repeated onto every firm-year is context, not an additive total. A team aggregate repeated onto each appearance likewise must not be summed as though it represented different teams. Native query tracing still needs to be checked in the application.

## Actual format support

The baseline's notebook reader/compiler/component is real. `parseNotebook.ts` separates prose and fenced `eda` blocks; `compileNotebook.ts` combines definitions globally while retaining file-line diagnostics; `readNotebook.ts` evaluates one named project query; `ExplorEdaNotebook.tsx` places charts inline. Notebook clicks and brushes stay local to their chart. A global filter declaration can narrow the notebook, but no invented cross-notebook selection syntax is used.

Dashboard and composition entries are plain `.eda` files. Sources, field contracts, explicit identity queries and relationships live in `exploreda.eda`. Each composition uses fully qualified source fields because the inspected composition lowering does not perform ordinary field-alias rewriting. The corpus uses eight composition mark families—path, point, band, summary, density, strip, horizon and waffle—rather than inventing named finished charts. Supplied bands represent observed ranges, not forecast uncertainty. Summary marks are unweighted. Transformations such as rebasing, anomaly calculation, ranks and standardization remain in prepared CSVs.

Native notebook support does **not**, on its own, establish a public notebook catalogue route. The inspected `apps/demo/src/demos/analyses/types.ts` contract exposes `project`, `tableFiles` and `text`; `loadAnalysis.ts` compiles dashboard views. The inspected `examples.ts` catalogue is the subset of example records marked `listed`. Neither contract establishes a Markdown-notebook catalogue branch. This is a conclusion about the inspected route and loader, not a claim to have searched every router file in a full checkout.

## Smallest demo integration

Preserve the existing React and TypeScript stack. Keep a static catalogue; do not add a CMS, scheduled publisher, framework migration or library redesign.

1. Copy family assets beneath a public corpus directory, preserving the data relationships. Add a small catalogue adapter that maps each root-relative corpus path into the existing demo asset base. Existing dashboard/composition entries should reuse `ExampleAnalysis.project`, `.tableFiles` and `.text` and the loader in `apps/demo/src/demos/analyses/loadAnalysis.ts`. Its sample compilation is not proof that every source row works; use its `sample: false` option for complete-row verification.
2. Add a discriminated notebook branch to the existing catalogue/opening flow rather than pretending a notebook is dashboard text. Reuse `readNotebookText(text, { project, tables, name })` to obtain the chosen query rows, then use `ExplorEdaNotebook` with `text`, `data` and `name`. Preserve field types through the existing loader where applicable. Do not introduce a JSON notebook format. Omitting `onTextChange` prevents persisted text changes but is not itself a claim that every on-screen editor becomes read-only; confirm the desired public interaction policy in the actual host.
3. Reuse the existing examples catalogue and source-credit surfaces. Include the article title, description, reader question, related IDs and source/license links from the corpus catalogue. Register each integrated example in `apps/demo/src/demos/coverage.ts`, update expectations in `coverage.test.ts` where required, and retain the dashboard text round-trip test. Do not mark an example reviewed merely because a capability tag says it is used.

The source snapshot does not supply every public route implementation or a complete current application tree. Codex should inspect the actual routing owner before choosing a precise component filename. This report intentionally names the real inspected integration contracts without inventing an existing route, a prop or a new API.

## Capability opportunities and remaining checks

A static narrative's evidence can diverge from a live filtered chart. A small fixed-snapshot/evidence indicator or reset-to-article-population affordance would help; this corpus provides the metadata but does not invent automatic prose interpolation. Aggregated daily/monthly rows retain offline provenance; a native mark trace reaches the prepared row, not necessarily every original source observation. Keep the raw files and preparation path available rather than promising recursive tracing that was not verified.

Composition documentation notes that some value/strip/size or density extents can rescale with live filters even when position domains remain stable. Shared-scale settings and fixed axes must therefore be tested, not inferred from the design description. Check ordered repeats, missing cells, log-domain exclusions, supplied-range bands, category colors, narrow labels and zoom behavior. No rendered preview image or export comparison was produced. PNG export is the documented composition output; this delivery does not imply SVG, PDF or editable-slide support.

The numeric count floor and target have no gap. Remaining qualitative limits include the historical-benchmark emphasis, a small nonrepresentative culture prefix, incomplete original capture metadata and **no dedicated transport-data story** after the bike-sharing acquisition failed. Those are stated separately from actual blocked artifact candidates in `gaps.json`.

Run the bundled offline audit, then compile all family projects in the baseline checkout. Run notebook/composition/views tests, library type checks, demo coverage and dashboard round-trip tests, and `pnpm check`. Exercise pointer and keyboard flows at 1280, 783 and 390 CSS pixels, including clearing one filter while retaining another, empty results, null values and source tracing. Those native commands and browser checks are explicitly unrun here. Codex owns collection, validation, integration and the review PR; this production run made no repository files or commits.
