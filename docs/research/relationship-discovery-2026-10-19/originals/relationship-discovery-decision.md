# Relationship discovery after the mixed-type scatter matrix

Research decision · 2026-10-19 · explorEDA

## Access, baseline, tools, and limitations — before the analysis

**Access status: qualified GO for a source-based research decision. Implementation and product acceptance remain NO-GO pending local evidence.**

- **Authorized owner and baseline:** the supplied packet identifies `https://github.com/byronwall/explorEDA` and `9b16d78e3ed0742ed4d5858c1939fec9e758b510`. These labels agree with the controlling prompt. They were not independently authenticated against GitHub.
- **Accessible files:** all 25 requested repository excerpts plus two explicitly identified local research additions, the embedded prompt and queue, were fully read. The source inventory below lists all 27. The standalone prompt is byte-identical to its extracted packet section after removing the packet separator newline.
- **GitHub limitation:** retrieval of the exact commit tree and exact raw `ScatterMatrix/matrixPlan.ts` returned `DisabledError`. This does not establish that the repository is private, missing, or on a different commit. The prompt explicitly authorizes this selected-text fallback.
- **Integrity limitation:** the packet says each file has a SHA-256 manifest, but no source-hash manifest is actually included. Receipt fingerprints were computed; no expected upstream hashes existed to compare. These fingerprints document the received bytes, not their authenticity as Git objects.
- **Working context:** a nonrunnable text snapshot, not a checkout. Its package manifest declares `exploreda` 0.2.0; the root declares pnpm 11.9.0. React/TypeScript remains the project context. No branch was created. `codex/relationship-discovery-research-2026-10-19` is the destination named for later Codex integration.
- **Tools used:** local text search/read and extraction; independent Python arithmetic using exact rational sums and rank calculations; web retrieval of primary documentation and release notes; UTF-8, JSON, SHA-256, and ZIP verification for the deliverables.
- **Unavailable evidence:** application execution, author observation, browser interaction, performance measurement, downstream provider/creation/history integration, and exact source-to-GitHub authentication. No package tests, type checks, builds, exports, undo/reopen proofs, PR operations, or repository changes were performed.

Receipt fingerprints:

| Received attachment | SHA-256 |
| --- | --- |
| `source-packet(6).txt` — 229,929 bytes | `584ff9284e520ab3451d4626ef21194a71d4f3e0c8a048ab6f4e89260dd2a4d5` |
| `pro-prompt(9).md` — 8,892 bytes | `87fdd4b4ac1e2f4c13363b3b8a4c785e3e021288af8f8f8f9fa8aba5f1888b35` |

Evidence labels used throughout: **Source fact** means inspected supplied code or documentation; **Computed** means independently calculated synthetic expectations; **Inference** means a reasoned implication; **Proposed** means an unexecuted product task or future change. No label implies observed application behavior.

## Decision

**Keep the delivered matrix. Adopt a focused docs/example proof as the next relationship-discovery step, after the already-prioritized local trust journey. Investigate a small pair-to-existing-Scatter handoff only if an author repeatedly finds the right pair but cannot efficiently continue with the correct population. Defer a separate coefficient view and bounded ranking; reject a universal mixed-type relationship score.**

The durable question has changed from whether explorEDA needs a relationship matrix to whether its existing controls are sufficient for a real task. Source shows mixed-type cells, distributions, pooled/per-color Pearson correlations, row/cell tracing, and an existing detailed Scatter workflow. It also shows a short matrix docs page that does not explain the full task. That is concrete evidence for a teaching gap; it is not evidence of demand for another chart. [R07–R21]

The strongest potential product increment is preserving the identity of an already-chosen pair when opening detailed analysis. Even that is conditional: copying two field names does not settle selection, other filters, facet scope, color grouping, or numeric eligibility. If current controls plus one example let the author finish comfortably, **stop with docs/example work and no new discovery UI**.

Confidence is high that a matrix rebuild would duplicate delivered capability; moderate that an example is the cheapest useful proof; low that any new UI will provide incremental value. The packet assumes no demonstrated demand, and this research did not create any.

## What exact choice remains difficult?

The following are separate tasks. Only observation can establish which one is actually blocked.

| Task | Current source-supported route | Residual question |
| --- | --- | --- |
| Find a useful pair | Choose/reorder fields; compare point cells, numeric correlations, boxes, tiles, and shares. | Does the author lack a candidate, or merely lack a taught way to scan? A maximum coefficient is not automatically useful. |
| Understand its population | Alt-click/Alt-Enter a cell; read its pair count, live count, per-field exclusions, and pooled/group correlation. Trace individual rows. | Can the author distinguish eligible rows, selected rows, valid pairs, and per-field exclusions? Exact pair-ID and group-n surfaces are not established by this packet. |
| Inspect its shape | Read the counterpart point cell; color by a meaningful group; reorder/reduce fields for space. | Is matrix resolution actually insufficient? Weak Pearson r can coexist with an obvious curve. |
| Open detailed analysis | Configure existing Scatter X/Y; optionally enable paired summaries, fits, marginals, or density displays as appropriate. | Does repeated field setup or context transfer produce real errors or effort? There is no local pair-open action in the supplied matrix renderer. |

The current-controls comparator must be given a fair chance. Use default mixed cells first. For an exact-number task, use numeric fields, upper **Corr**, lower **Blank**, and continuous diagonal **Name**. This already approximates a coefficient-focused view. Then manually configure one existing Scatter for the chosen fields. Field setup must be measured separately from interpretation time. [R07, R08, R13, R15, R16]

**Disproof of a new feature's value:** after one short teaching example, the author completes a real task with correct pair, population explanation, shape interpretation, and detailed continuation, without recurring setup mistakes, and considers the effort acceptable. A successful synthetic demonstration alone does not establish usefulness or demand.

## What the current source actually establishes

### Delivered strengths and bounded claims

- **Mixed types:** `matrixFieldKind` treats numeric and datetime as continuous and the rest as bands. `continuousValue` uses `finiteNumber` or `timestampOf`; dates are not an invitation to redo the time-series-axes work. [R08, R17]
- **Two through ten fields in the settings UI:** constants and add/remove controls enforce that editing range. `validateSettings` only checks at least two truthy names; it does not itself enforce a maximum or uniqueness. Do not describe the ten-field limit as a proved invariant of all saved/imported settings. [R07, R13]
- **At most twelve categorical bands in the supplied assertions:** the 20-distinct-category test expects eleven explicit bands plus an `Other` band containing nine values. The `matrixBands.ts` implementation is absent, so tie order, label collisions, and all missing/Other edge cases were not audited. [R07, R14]
- **Independent triangle choices:** defaults are lower numeric points, mixed points, categorical shares; upper numeric correlations, mixed boxes, categorical tiles. Both triangles can be blank by pair type. Continuous diagonals support density/histogram/name; categorical diagonals bars/name. [R07–R09, R13]
- **Color and trace:** correlation cells calculate pooled r and per-color-group r. The visible group list can truncate and omits undefined group lines; the trace can show undefined group results. Supplied group trace records contain label/color/r, not per-group valid-pair counts. [R08, R10–R12]
- **Detailed Scatter already has an interface:** `summary`, `regression` with linear/polynomial/LOESS choices, `marginals`, and point/density/hexbin/contour displays are declared. `planPairedSummary` supplies pooled and categorical-group summaries. Full downstream renderer/fit execution was not included or observed. [R15, R16, R20]

### Exact correlation press behavior

This is a source audit of `ScatterMatrix.tsx`, not a browser test. [R12]

1. Every nonblank cell has a transparent focusable SVG rectangle. Its `onPointerDown` calls `startDrag`; correlation drawing underneath uses `pointerEvents="none"`.
2. Nonprimary buttons return. **Alt-primary has precedence:** it prevents the default and requests the correlation cell's trace. For a point cell only, a nearby point can instead request a row trace.
3. An ordinary primary press on a correlation or name cell is explicitly treated as empty space. If `settings.filters` is nonempty, it calls `setFilters([])` and returns without creating a drag. Ctrl, Meta, and Shift have no distinct local branch.
4. `setFilters` calls `updateChart` with `replaceSelection(settings, [])`. That helper removes filters on the matrix's displayed fields and `__ID`, while preserving filters on other fields. Therefore the action does **not necessarily clear every filter owned by the chart**. [R08]
5. The later `endDrag` ordinarily returns because no drag was started. There is no pair-to-Scatter `onClick` or opening callback in the complete supplied renderer.
6. Neither the Alt nor correlation pointer-down branch stops propagation. Missing ancestor handlers mean full browser event consequences remain unverified.
7. The cell keyboard handler supports **Alt+Enter** for tracing and **Escape** for the same selection-clearing rule. Plain Enter/Space have no local opening action.

A future navigation action must be explicitly named and independently keyboard-accessible. The source convention says mark clicks select and empty-space clicks clear; it does not justify silently replacing the existing correlation press. Its precise placement and any ancestor event interaction require the actual local integration context. [R03, R12]

### Population and numerical parity are not automatic

| Quantity | Meaning that must survive the explanation |
| --- | --- |
| Source rows | `allIds`; source-wide reference for axes/bands. |
| Eligible/live rows | `liveIds`; matrix source describes these as rows after other filters and facet scope. Full eligibility hooks are absent. |
| Selected rows | Live rows passing the matrix's own filters. Selection is an overlay; its count is not a pair count. |
| Valid pair / numeric contributors | Rows with both required continuous values for that pair. Another pair may have a different set, even at the same n. |
| Category-pair members | Rows with both usable bands; categorical missing can itself be a band. Share denominators use pair-valid column totals. |
| Axis bounds | A viewing range. It is not a row filter or a new missing-value rule. The matrix plans source-wide axes with default settings. |

The matrix reuses its layout while its own selection changes: total `cell.n`, r, group r, and bin definitions remain fixed, while selected overlays change. A separately linked Scatter may then see that source selection as an external filter. **The possible destination-population change is an integration inference**, not an observed defect; `useGetLiveData` and the provider are not supplied. [R08–R12]

Three source-level differences must be named before promising equal summaries:

- Matrix `pearson` withholds r for fewer than **three** pairs. Scatter `pairedStats` permits **two** nonconstant pairs. This is a convention difference, not a proved bug or permission to change either threshold. [R08, R11, R15]
- Matrix cell trace counts the two field exclusions independently. Scatter's `missingX`/`missingY` buckets are exclusive: X invalid first, otherwise Y invalid. Both-invalid rows therefore appear in both matrix marginals but only the Scatter X bucket. [R10, R15]
- Matrix dates become timestamps. Scatter paired statistics call `finiteNumber` on snapshot X/Y. The missing downstream preprocessing prevents a parity claim for date-text axes. The first conditional handoff proof should use true numeric/numeric pairs. [R08, R15, R17]

## Alternatives, with their strongest cases

| Route | Strongest case for it | Decision and rejection gate |
| --- | --- | --- |
| Keep current matrix; improve docs and one example | Existing shape, coefficients, mixed-type summaries, and traces may already finish the task. Cheapest way to discover the actual residual. | **Adopt as research direction.** Stop expansion if the author succeeds and accepts the effort. If no real task can be named, keep the seed dormant. |
| Small pair-to-existing-Scatter handoff | Author already finds the right pair but repeatedly miscopies fields or loses context when opening detail. High reuse of existing Scatter. | **Investigate conditionally.** Reject if manual setup is adequate, no detail is needed, or correct population transfer requires a general navigation/filter framework. |
| Separate compact numeric coefficient view | A repeated task needs readable exact coefficients/counts and the current coefficient-focused configuration remains cumbersome. | **Defer.** Reopen only on a measured scanning/readability failure. Keep a user-chosen numeric subset and direct shape access; do not assume a larger field cap is free. |
| Bounded same-method ranking | A real task has many unknown candidate pairs and a declared relevance objective, making manual scanning the bottleneck. | **Defer.** Require a named task, finite search scope, method/population labels and shape follow-through. Reject if ranking saves no useful task effort. |
| One combined mixed-type association ranking | One list could ostensibly span all field types without choosing a measure. | **Reject.** Similar numerical ranges do not make different statistics comparable. No universal usefulness criterion or demand is established. |

Scores are **ordinal local judgments, not observations, performance results, demand scores, or delivery estimates**. Five is more favorable. Task ease estimates effort for the stated pair-choice-to-detail task; cost means lower implementation/maintenance burden. Local evidence rates incremental value, not documentation quality. No weighted total is used.

| Route | Task ease | Statistical honesty | Low cost | Reuse | Local evidence |
| --- | ---: | ---: | ---: | ---: | ---: |
| Existing matrix + docs/example | 3 | 4 | 5 | 5 | 3 |
| Conditional pair handoff | 4 | 4 | 3 | 5 | 2 |
| Separate numeric coefficient view | 3 | 3 | 2 | 3 | 1 |
| Bounded same-method ranking | 4 | 3 | 1 | 2 | 1 |
| Combined mixed-type ranking | 4 | 1 | 1 | 2 | 1 |

The docs route loses points because manual detail setup and unproved population comprehension remain. Handoff's cost is only moderate: chart creation, reuse, filtering, facets, history, and event propagation are uninspected dependencies. Ranking's task-ease advantage is conditional on a discovery bottleneck that has not been demonstrated.

**API impact:** docs/example work needs no public API or saved-settings change. A conditional handoff should first reuse existing chart creation/settings, with no new public settings contract assumed. A new registered coefficient chart would introduce registry, settings, validation, persistence, docs, and maintenance obligations. Ranking additionally needs explicit method, eligibility, grouping, search-scope, and reproducibility semantics. None of that broader API design is authorized by this research.

## Statistical traps that change the decision

### Use a coefficient for the question it answers

Pearson r summarizes linear association. Spearman rho summarizes monotonic rank association; average ranks must handle ties. Neither is a general detector of every useful relationship. Normality is not required merely to calculate a descriptive coefficient; inferential tests have additional assumptions. Constant inputs are undefined, and two nonconstant pairs necessarily give an algebraic correlation of +1 or −1. [S01, S02]

The computed fixture makes these distinctions concrete:

| Trap | Consequence for this product decision |
| --- | --- |
| Pooled versus grouped reversal | The fixture gives pooled r = −164/199 while each group gives +1. Preserve a meaningful color/group comparison and inspect the points before interpreting the pooled sign. Grouping does not establish a causal adjustment. |
| Nonlinear relationship with weak Pearson r | Eleven symmetric points on a parabola give Pearson and Spearman both exactly zero. The existing point triangle contains essential information that another coefficient grid would discard. |
| Outlier leverage | Adding one large-coordinate row raises the fixture's Pearson r to about 0.939 while the other eleven rows have r = 0. Inspect the influential row and compare explicitly labeled populations; do not delete it automatically. |
| Constant or insufficient pairs | Show unavailable with a reason. Do not turn undefined into zero, rank it as weak evidence, or treat n = 3 as a reliability guarantee. Expose the current n = 2 convention difference when comparing views. |
| Pairwise missing populations | A 12-row fixture has a pair with only four contributors. Equal-looking coefficients can describe different ID sets. Label eligible and pair counts; keep overlapping field-exclusion counts distinct from unique excluded rows. |
| Category cardinality | `Other` makes a readable display but changes categories if used in a statistic. Any future association must declare whether it uses original typed categories or displayed bands, plus cardinalities and treatment of missing. Identifier-like fields can look maximally associated in sample. |
| Filtering and scale bounds | External filtering changes the analyzed population; the matrix's own selection changes its overlay; viewing bounds change the picture. Handoff must identify which population is being continued. |
| Scanning many pairs | Ten fields already yield 45 unordered pairs. Choosing the largest value after scanning is descriptive selection, not independent confirmation. A significance sort is not a usefulness ranking. |

NIST's scatterplot guidance supports looking for nonlinear patterns, conditioning, and outliers, and does not treat association as causal proof. The synthetic values above were independently computed; no app rendered them. [S04]

### Why mixed measures do not make one honest ranking

For a later, demonstrated mixed-type task, **Cramér's V** could summarize a nominal/nominal contingency table. It has no signed numeric direction. For category/numeric comparisons, **eta squared** can express the between-category share of observed numeric variation. These answer different questions from Pearson's signed linear relation and Spearman's ordering. Their common 0–1 magnitudes do not supply a common task value, sampling behavior, or category-complexity adjustment. [S03, S05]

An exact algebraic counterexample is an identifier category with one group per row: the within-category sum of squares is zero, so eta squared is one for any nonconstant numeric response. A raw record-ID-by-two-group contingency table can likewise have Cramér's V = 1. Those values do not make record IDs a useful analytical explanation. This is a counterexample to the proposed score semantics, not an observed explorEDA result. [S05, S06; computed fixture appendix in `proof-plan.md`]

No additional method is needed for the recommended docs proof. Spearman should be considered only if a real monotonic nonlinear task defeats Pearson and inspecting the shape is insufficient. If ranking eventually proves useful, compare candidates within one declared method, compatible type family, population policy, and search scope; retain signs, counts, exclusions, and direct point inspection. Do not synthesize Pearson, Spearman, V, eta squared, and predictive scores into an unlabeled “relationship strength.”

Descriptive exploration can suggest a follow-up question. Confirmation needs a separately defined hypothesis, data/sampling model, and treatment of selection across many comparisons. This mission does not add p-values, automatic significance, causal claims, or a statistical notebook.

## Three primary-source exemplars, verified on 2026-10-19

All comparator behavior here is **source-only**. No application was installed or exercised, and no vendor feature establishes explorEDA demand.

| Exemplar | Version evidence | Relevant lesson |
| --- | --- | --- |
| Orange | Current widget catalogue is unversioned; the official download page advertises 3.40.0. Exact catalogue-to-binary correspondence is unverified. [E01–E03] | Preserve the chosen pair and data context when moving to detailed plotting. |
| JMP | Explicit 19.2 help pages, published 2026-01-13; no installed binary checked. [E04–E07] | Keep coefficients, pairwise populations, shape, grouping, and display scales distinct. |
| KNIME | Official tutorial is dated 2022-09-26. Current 5.9 release notes record relevant UI migrations; 5.12.0 notes date that release to 2026-07-06. [E08–E10] | A short worked workflow is a serious alternative to adding UI. Old screenshots are not current behavior proof. |

**Orange.** Correlations exposes the original data, selected feature pair, and a coefficient table. It offers Pearson/Spearman for continuous numeric features, a field restriction, and pair filtering. Its example sends both Data and Features to Scatter Plot so the chosen pair becomes the plotted axes. Its missing-value population policy is not specified on this page. The transferable concept is a deliberate pair/context handoff, not a new workflow canvas or coefficient widget. [E01]

Orange's separate informative-projection feature scores a two-dimensional projection against the selected color variable. For categorical color the documentation uses ten-neighbor color agreement; numeric color uses a local coefficient-of-determination criterion. That is a target/group-oriented task, not a universal relationship ordering. It does not justify importing VizRank here. [E02]

**JMP.** Its Multivariate options include both coefficient and scatterplot representations. The separately selected Pairwise Correlations report uses Pearson with pairwise deletion, so counts can differ across pairs. A worked example opens that report through the platform menu and sorts significance probabilities. Documenting that interaction does not endorse significance sorting for explorEDA. [E04, E05]

JMP's matrix options separately expose Group By, Lock Scales, and a local data filter. That separation reinforces the need to distinguish a changed view from a changed population. explorEDA's existing triangles already juxtapose shape and summary; no second matrix, inferential suite, or imputation feature follows from this comparison. [E06, E07]

**KNIME.** Its official teaching workflow reads Pearson and Spearman output tables, then inspects a scatterplot colored by species and compares group-specific coefficients. It does not establish automatic pair-to-Scatter navigation. Relevant current Hub node pages and exact source retrieval were unavailable; the tutorial's old UI and current missing-data behavior therefore remain unverified. Subsequent documented Data Explorer and Rank Correlation UI migrations reinforce that caveat. Keep the instructional sequence, not the node framework or old UI. [E08–E10]

Some vendor prose overstates statistical interpretation. This report does not adopt the KNIME tutorial's near-zero-covariance-to-independence implication, Orange's broad wording about the limits of Pearson, or JMP's suggestion that significance sorting necessarily orders correlation strength. Statistical interpretation instead uses the primary mathematical references and explicit fixture calculations.

## Smallest useful falsifiable proof

The full specification is in `proof-plan.md`; its essentials are reproduced here so this decision stands alone.

- **Fixture:** 12 synthetic records, ten selectable matrix fields plus a stable record ID. It covers a positive line, a symmetric U, an influential extra point, two-group sign reversal, a constant field, and two sparse fields. One- and two-pair cases arise through explicit filters, not extra product features.
- **Computed anchors:** positive line r = 1; U r = rho = 0 on records r01–r11; reversal pooled r = −164/199 on all 12 and group r = 1 on each six-record group; constant r unavailable; sparse pair contributors exactly r01–r04. These are arithmetic checks, not product passes.
- **Current comparator:** matrix defaults, focused numeric coefficient configuration, cell/row traces, color grouping, and manually configured existing Scatter. Supply the same short teaching example to every route.
- **Author gate — proposed:** name one real task and use the fixture only to learn/check semantics. Observe three relevant pair-to-detail transitions. Require correct axes, population explanation, and shape interpretation. If current controls suffice, reject new UI.
- **Conditional handoff gate — proposed:** only after repeated transfer friction, compare an explicitly scoped prototype on matched tasks. Require zero population/axis errors and a useful reduction in setup effort accepted by the author. Synthetic timing is not demand proof.
- **Runtime gates — proposed:** verify numeric parsing/counts, Alt/ordinary/keyboard actions, true destination row sets, selection ownership, grouping, return/reuse behavior, and persistence/undo implications in the real checkout. Measure performance only on an agreed device/workload.
- **Docs and example:** update the existing `apps/demo/src/docs/pages/scatter-matrix.mdx`; link the continuation in `scatter.mdx`; clarify `trace.mdx` only as necessary. Add one focused live example through the existing demo system after inspecting its actual registry. No new registered chart page is required for the docs route. [R01, R02, R19–R21]

The local category-selection → bar/card/export → undo/redo/reopen proof remains first and was not run. Preparation PR451, freshness PR452, and missingness PR455 remain completed research cycles; their remaining proof work is not a reason for another survey. PR454 retains time-series axes. These statuses are supplied mission/queue facts, not independently reverified PR state. [R22, R24, R25]

## GO/NO-GO conditions and remaining uncertainty

- **GO now:** use the explicitly authorized packet to retire the matrix-rebuild premise, write this decision and its proof, and retain a docs-first option. All required source sections and decisive current primary references are accessible.
- **Stop/reopen provenance if:** local Codex finds an owner/commit mismatch, contradictory core source, or a required upstream hash mismatch. Smallest unblock: the exact selected files or their trusted owner-generated hash manifest at the named commit. Locally generated receipt hashes cannot supply this assurance.
- **NO-GO for implementation now:** no demonstrated author task, no product run, and no verified chart-opening/filter/history contract. Smallest unblock: complete the first local trust journey, then record one real relationship task using current controls and the teaching example.
- **NO-GO for a handoff scope that promises population parity:** until local code and runtime prove how source selection, other filters, facets, and target filters compose. Start a conditional proof with numeric pairs and no source-owned filters; hold unsupported contexts instead of silently clearing them.
- **NO-GO for a new coefficient view or ranker:** until an author shows a residual scanning problem that docs/current configuration cannot solve. One coefficient example, a benchmark, or another product's existence is insufficient.
- **Useful outcome when uncertainty persists:** preserve the delivered matrix and record the blocked task/proof requirement. No feature needs to be recommended to make this research successful.

Potentially useful additional local sources are `matrixBands.ts`, `matrixCanvas.ts`, `useGetLiveData.ts`, `DataLayerProvider.tsx`, chart creation/panel/grid code, Scatter plan/fit/axis code, saved-state/DSL validators, demo history, the live-example registry, and `docs/ui-defaults.md`. They are implementation-proof prerequisites, not claims of having read a complete repository.

## Completed checks and explicitly unexecuted checks

**Completed:** full selected-text coverage/read audit; owner/baseline label comparison; received-file fingerprints; source click-path and convention inspection; inspection of 16 supplied planner/trace test cases; current primary-source reads/version checks; independent fixture arithmetic and exact set checks; deliverable structure/UTF-8/JSON checks; ZIP membership and byte/hash identity verification reported with the final package.

**Not performed:** running those 16 tests, Vitest, type checks, `pnpm check`, demo/docs browser checks, real author comparison, responsive/keyboard interaction, product fixture execution, benchmark, export/history/reopen proof, repository integration, branch creation, PR creation, merge, or deployment. Reading test assertions is not running tests. Proposed acceptance thresholds are decision rules, not measured results.

## Source index

### Authorized repository snapshot — all 27 selected files read

Paths are repository-relative. Symbols identify the inspected evidence; line numbers in the audit are section-relative, not live GitHub permalinks. The final two research files are local additions, not authenticated files at the baseline.

| ID | Exact path and principal evidence |
| --- | --- |
| R01 | `AGENTS.md` — research/planning docs-and-example scope, test/browser/PR rules. |
| R02 | `docs/agent-guide.md` — store/creation/history/docs paths, commands, source-driven demo, known traps. |
| R03 | `CODING_STANDARDS.md` — selection/empty-space/trace conventions and reuse. |
| R04 | `README.md` — workspace integration, view bounds versus filters, project context. |
| R05 | `package.json` — pnpm and root check script. |
| R06 | `packages/explorEDA/package.json` — package version, scripts and React peers. |
| R07 | `packages/explorEDA/src/components/charts/ScatterMatrix/definition.ts` — settings, constants, defaults, `validateSettings`. |
| R08 | `packages/explorEDA/src/components/charts/ScatterMatrix/matrixPlan.ts` — `matrixFieldKind`, `continuousValue`, `pearson`, `pairedCorrelation`, `planMatrixLayout`, `planMatrixSelection`, `replaceSelection`, `withSelectedBars`. |
| R09 | `packages/explorEDA/src/components/charts/ScatterMatrix/matrixCells.ts` — `planBoxGroups`, `planPairs`, `planDensity`, selected statistics. |
| R10 | `packages/explorEDA/src/components/charts/ScatterMatrix/matrixTrace.ts` — `resolveMatrixTrace`, `matrixTraceTargets`, `findMatrixTraceRow`. |
| R11 | `packages/explorEDA/src/components/charts/ScatterMatrix/MatrixTraceBody.tsx` — `formatR`, `RowBody`, `CellBody`. |
| R12 | `packages/explorEDA/src/components/charts/ScatterMatrix/ScatterMatrix.tsx` — `startDrag`, `endDrag`, `setFilters`, `cellKey`, `CorrelationCell`, `CellReadout`, hit rectangles. |
| R13 | `packages/explorEDA/src/components/charts/ScatterMatrix/ScatterMatrixSettingsPanel.tsx` — field cap/uniqueness controls, triangles, diagonals, color. |
| R14 | `packages/explorEDA/src/components/charts/ScatterMatrix/matrixPlan.test.ts` — 16 inspected test cases including population, categories, groups, and tracing; none executed. |
| R15 | `packages/explorEDA/src/components/charts/ScatterPlot/pairedSummary.ts` — `pairedStats`, `planPairedSummary`. |
| R16 | `packages/explorEDA/src/components/charts/ScatterPlot/definition.ts` — `ScatterPlotSettings`, default creation, filter function. |
| R17 | `packages/explorEDA/src/lib/valueParsing.ts` — `isMissingValue`, `parseNumber`, `finiteNumber`, `timestampOf`, date parsing. |
| R18 | `packages/explorEDA/src/lib/fieldProfiles.ts` — univariate profiles, type override plumbing. |
| R19 | `apps/demo/src/docs/pages/scatter-matrix.mdx` — existing 13-line cell/color explanation and example. |
| R20 | `apps/demo/src/docs/pages/scatter.mdx` — current detailed workflow documentation. |
| R21 | `apps/demo/src/docs/pages/trace.mdx` — current tracing instructions. |
| R22 | `docs/intent/current-analysis-trust/intent-brief.md` — first local selection/export/history proof. |
| R23 | `docs/intent/reusable-analysis-metrics/intent-brief.md` — demand unconfirmed; repeated two-consumer metric trigger. |
| R24 | `docs/research/relationship-discovery-2026-10-19/pro-prompt.md` — local research addition, controlling scope. |
| R25 | `docs/research/relationship-discovery-2026-10-19/research-queue.md` — local research addition, continuing queue and completed topics. |
| R26 | `docs/intent/relationship-discovery/intent-brief.md` — partly reconciled current reality and historical proposed next step. |
| R27 | `docs/intent/relationship-discovery/initiative-map.json` — stale negative claim at line 229; current matrix acknowledgement at line 11 and delivered history. |

### Current primary external sources

**Every successful source below was accessed on 2026-10-19.** Version labels describe the documentation or advertised download, not a tested installation. These URLs are sufficient to inspect each external claim without other deliverables.

| ID | Primary source |
| --- | --- |
| E01 | Orange, [Correlations](https://orangedatamining.com/widget-catalog/unsupervised/correlations/) — unversioned current catalogue; pair/data outputs and documented Scatter handoff. |
| E02 | Orange, [Scatter Plot](https://orangedatamining.com/widget-catalog/visualize/scatterplot/) — unversioned current catalogue; projection criterion, grouping, and selected outputs. |
| E03 | Orange, [Download](https://orangedatamining.com/download/) — advertised 3.40.0 files on access date. |
| E04 | JMP 19.2, [Multivariate Platform Options](https://www.jmp.com/support/help/en/19.2/jmp/multivariate-platform-options.shtml) — pairwise deletion/counts, Pearson/Spearman, separate plot representation. |
| E05 | JMP 19.2, [Analyze Patterns and Relationships](https://www.jmp.com/support/help/en/19.2/jmp/analyze-patterns-and-relationships-in-the-multivariate-platform.shtml) — documented launch/menu/sort workflow. |
| E06 | JMP 19.2, [Scatterplot Matrix Platform Options](https://www.jmp.com/support/help/en/19.2/jmp/scatterplot-matrix-platform-options.shtml) — grouping, locked scales, local filter. |
| E07 | JMP 19.2, [Scatterplot Matrix](https://www.jmp.com/support/help/en/19.2/jmp/scatterplot-matrix.shtml) — bivariate plot overview. |
| E08 | KNIME, [Know Your Data with Descriptive Statistics](https://tips-and-tricks.knime.com/blog/know-your-data-descriptive-statistics) — official tutorial dated 2022-09-26, re-accessed; no current UI parity assumed. |
| E09 | KNIME, [5.9 changelog](https://docs.knime.com/ap/latest/changelogs/5.9/) — Data Explorer/Rank Correlation UI migrations. |
| E10 | KNIME, [5.12 changelog](https://docs.knime.com/ap/latest/changelogs/5.12/) — 5.12.0 release dated 2026-07-06. |
| S01 | SciPy v1.18.0 manual, [pearsonr](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.pearsonr.html) — linear coefficient, degeneracy, n = 2, and nonlinear counterexample. |
| S02 | SciPy v1.18.0 manual, [spearmanr](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.spearmanr.html) — monotonic rank coefficient and separate inference. |
| S03 | SciPy v1.18.0 manual, [contingency.association](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.contingency.association.html) — nominal-table association measures. |
| S04 | NIST/SEMATECH, [Scatter Plot](https://www.itl.nist.gov/div898/handbook/eda/section3/scatterp.htm) — shape, conditioning, outliers, causal limitation. |
| S05 | JMP 19.2, [Effect Tests](https://www.jmp.com/support/help/en/19.2/jmp/effect-tests.shtml) — eta squared as effect SS / total SS and category-level parameter counts. |
| S06 | NIST/SEMATECH, [One-way ANOVA overview](https://www.itl.nist.gov/div898/handbook/prc/section4/prc431.htm) — between/within/total sum-of-squares decomposition. |

Failed GitHub and KNIME node/source retrievals support no behavioral claim. The prior queue URL was supplied as historical context; no attempt was made to infer current PR status from it.

## Deliverable relationship

`recommendations.md` turns this decision into seven bounded dispositions with problem, evidence, cost, API impact, confidence, disproof, and destination. `proof-plan.md` contains the exact fixture, computations, comparator, and unexecuted author/runtime gates. `research-queue.md` preserves the first local trust proof and assigns one next action to each useful remaining seed. The ZIP contains identical copies of those three files and this decision plus `manifest.json`; the manifest hashes the four Markdown payloads, avoiding a self-referential manifest or ZIP hash.
