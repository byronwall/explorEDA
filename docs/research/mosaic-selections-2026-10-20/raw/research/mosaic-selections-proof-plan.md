# Mosaic Selections: bounded proof and decision plan for explorEDA

**Repository baseline:** `byronwall/explorEDA@9b16d78e3ed0742ed4d5858c1939fec9e758b510`  
**Research date:** 2026-10-21  
**Status:** proposed implementation and validation plan. **No application implementation, test suite, UI interaction, benchmark, dependency installation, commit or PR was performed.** The fixture's expected sets were independently calculated during research; that calculation is an oracle, not an explorEDA integration result.

This plan accompanies `mosaic-selections-report.md`, the recommendations and source registers, and `source-material/research-notes/proof-fixture.json`. Bracketed source IDs resolve in `mosaic-selections-sources.json`. MOS identifiers refer to the report's stable recommendations.

## 1. Decision being tested

The first decision is whether a **small internal exact selection contract over existing Crossfilter and React/TypeScript renderers** can improve the select → read → inspect → export → restore workflow. It does not require Mosaic packages, DuckDB, a query framework or a renderer replacement. Preserve the current implementation as the comparison baseline. [MOS-001, MOS-003, MOS-010, MOS-011]

The useful first milestone fixes/proves numeric histogram boundary semantics. The next new interaction is a bounded **exact lasso on linear numeric Scatter axes**, publishing one committed selection to a histogram, Scatter, evidence table and an authored selected-count finding. A rectangle is a comparison case, not completion of the lasso requirement. Tuple unions and facet-local selection receive semantic probes without a general Boolean editor. [R-INTENTS, R-BAR, R-MARGINAL; MOS-002, MOS-004, MOS-013]

The proof has two independent outcomes:

- **Semantic GO:** all twelve semantic gates pass, with exact row identities, provenance, scope, lifecycle and usable inspection. This can ship without acceleration.
- **Acceleration GO:** a later candidate passes five additional gates and demonstrates a reproducible benefit. A semantic GO does not authorize a backend adoption or claim paper speedups for explorEDA.

Every procedure below is **unrun** unless explicitly identified as independently calculated fixture arithmetic. Codex owns source reconciliation, application implementation, test execution, integration and review.

## 2. Reproducible setup and authority

Use a complete checkout at the immutable baseline and the repository's pnpm workflow. The supplied packet is a selected source snapshot and must not be represented as a runnable checkout. Record commit, dependency lockfile, browser/build mode and any application changes before executing tests. Keep the original comparison available in an isolated checkout. [SRC-PACKET, SRC-BASELINE, R-PERF]

Create one analysis/view named `mosaic-proof`, revision `1`. Use stable source identities scoped by analysis/view/chart: source **A** is the histogram; source **B** is Scatter. Source **C** is a separate source used in the same-field test, not an alias for A or its field name. **W** is a workspace population predicate. Never persist a Mosaic runtime object or React mount ID as semantic source identity. [R-CF, R-IDENTITY, R-PROVIDER]

The fixture's public `id` column is the row key and must remain visible in the evidence export. In this isolated ordering, `r01` corresponds to internal `__ID=0`, through `r12` at `__ID=11`. Compare public key sets; do not rely on screenshots or counts. Reordering must preserve logical keys or invalidate revision-bound internal membership explicitly. Existing project identity adaptation is relevant and should be extended, not bypassed. [R-TABLE, R-IDENTITY; MOS-007]

**Pin raw/prepared semantics before interpreting results.** The JSON oracle preserves numeric and string scalars. Numerical intervals and lasso deliberately use `finiteNumber`; typed equality preserves scalar type. Record the provider's raw→prepared projection. If automatic numeric conversion normalizes `x="2"` to number 2, the typed-x oracle is a raw-contract/evaluator probe, not the expected result after that conversion. Run the integrated typed-identity test on a field whose mixed types are preserved, including `tag`, and separately assert the documented conversion result. Do not silently alter the fixture or compare unlike representations. Any unresolved representation choice blocks that check. [R-VALUES, R-PROVIDER; MOS-008]

## 3. The twelve-row fixture

Quotes below denote strings; `null`, booleans and unquoted numbers retain their JSON types. Blank strings are `""`.

| ID | x | y | region | amount | date | tag |
|---|---:|---:|---|---:|---|---|
| r01 | 0 | 0 | East | 10 | `2025-01-01T00:00:00Z` | 1 |
| r02 | 1 | 1 | East | 20 | `2025-01-01T23:59:59.999Z` | `"1"` |
| r03 | 2 | 2 | West | 30 | `2025-01-02T00:00:00Z` | 1 |
| r04 | 3 | 1 | East | 0 | `2025-01-02T12:00:00Z` | `"1"` |
| r05 | 4 | 0 | West | 40 | `2025-01-03T00:00:00Z` | 2 |
| r06 | 2 | 3 | East | null | `2025-01-02T23:59:59.999Z` | null |
| r07 | `"2"` | 1 | East | `""` | `2025-02-30` | `""` |
| r08 | null | 1 | East | 50 | `2025-01-01T04:00:00Z` | 3 |
| r09 | 1 | `"bad"` | West | 60 | `""` | false |
| r10 | 2 | 0 | West | `"bad"` | `2025-01-01T19:00:00-05:00` | 0 |
| r11 | 2 | 1 | East | 5 | `2025-01-02T00:00:00Z` | true |
| r12 | 5 | 5 | North | 15 | `2025-03-01T00:00:00Z` | `"North"` |

Let **D** be all twelve keys in this table. Define:

- **A:** `finiteNumber(x) >= 1 AND finiteNumber(x) < 3`. This is a **proposed half-open interval [1,3)**. The baseline `RangeFilter` is inclusive and cannot express this upper-open bound unchanged.
- **B:** the inclusive source-unit triangle with vertices `(0,0),(3,0),(0,3)`. For this fixture, finite coordinates pass exactly when `x>=0`, `y>=0`, and `x+y<=3`. Invalid/missing coordinates fail. Points on edges and vertices are included.
- **C:** a different source's interval `finiteNumber(x) >= 2 AND finiteNumber(x) < 4`.
- **W:** typed region equality `region === "East"`.
- **Z:** an active valid interval `99 <= finiteNumber(x) < 100`, matching zero rows. Z replaces A when the zero-source case is tested.

### 3.1 Exact set oracle

These sets are independently calculated. Every application comparison against them remains unrun.

| Case | Expected public IDs |
|---|---|
| No clauses | D = r01, r02, r03, r04, r05, r06, r07, r08, r09, r10, r11, r12 |
| A | r02, r03, r06, r07, r09, r10, r11 |
| B | r01, r02, r07, r10, r11 |
| A AND B | r02, r07, r10, r11 |
| A OR B, evaluator probe only | r01, r02, r03, r06, r07, r09, r10, r11 |
| C | r03, r04, r06, r07, r10, r11 |
| A AND C | r03, r06, r07, r10, r11 |
| W | r01, r02, r04, r06, r07, r08, r11 |
| W AND A | r02, r06, r07, r11 |
| W AND B | r01, r02, r07, r11 |
| W AND A AND B | r02, r07, r11 |
| West facet AND A AND B | r10 |
| Z, or Z AND B | ∅ |
| True-zero amount row | r04 |
| Explicit empty facet | ∅ |

The lasso's bounding rectangle would admit r03, r04 and r06 as well as B. Those off-triangle rows are the decisive rejection case for a rectangle substituted for a lasso. r07 and r11 share the same numerical coordinates and must both remain selected; overlap is not deduplication. r08 and r09 establish invalid-coordinate exclusions.

### 3.2 Typed, tuple and date oracles

| Predicate on the declared fixture representation | Expected IDs |
|---|---|
| `tag` typed number 1 | r01, r03 |
| `tag` typed string `"1"` | r02, r04 |
| `x` typed number 2, before any normalization | r03, r06, r10, r11 |
| `x` typed string `"2"`, before any normalization | r07 |
| `(region=East AND x=number 1) OR (region=West AND x=number 2)` | r02, r03, r10 |
| Independent typed lists `region IN {East,West}` AND `x IN {number 1,number 2}` | r02, r03, r06, r09, r10, r11 |
| UTC January2: `[2025-01-02T00:00:00Z,2025-01-03T00:00:00Z)` | r03, r04, r06, r10, r11 |

The tuple probe must reject the extra r06/r09/r11 introduced by independent lists. It does not require a new multicell UI. The date probe includes r10 because its offset timestamp is January 2 UTC, includes r06 at the last millisecond, excludes r05 at the next day's start, and rejects impossible/blank dates r07/r09. Add an empty February history period; do not convert absence to a zero observation. Existing `timestampOf`, `dateBound` and period helpers have differing numeric-date eligibility, which must be declared and checked. [R-VALUES, R-DATES, R-HEATMAP; MOS-008, MOS-013]

For the existing missing-value policy, a null/missing `tag` selection matches r06 and r07, while invalid numeric text is not a missing category. Add a pure-evaluator probe over null, undefined, empty string, whitespace and `"bad"`: the first four follow the documented missing rule; `"bad"` does not. Also test an absent field reference separately from a present field's missing values: it must become unavailable or explicitly fail closed, never an implicit all-rows population. Compare category-mark contributors with the predicate's declared missing set, because current category grouping and missing-filter matching are not identical. [R-FILTER, R-VALUES, R-POP]

### 3.3 Measures and denominators

For **E=A∩B**, row count is 4. Valid amount inputs are r02=20 and r11=5; sum 25, valid-input count 2, mean 12.5. r07 and r10 remain selected evidence but are excluded from numeric accumulation with reasons. A count finding can read **“4 of 12 eligible rows are selected.”** Its share is 1/3, and inspection names D as baseline.

With W active, E becomes r02/r07/r11: count 3, sum 25 and mean 12.5. The **proposed workspace-eligible finding** uses W's seven rows as baseline, so its count share is 3/7. **Existing MetricCard differs:** `useGetAllIds(settings)` applies chart `localFilters` but not workspace filters; with no local restriction it compares that numerator with D's twelve rows, giving 3/12. Preserve this existing meaning. Compare count numerators across consumers; compare percentages only when denominator scopes explicitly match. [R-LIVE, R-METRIC]

For `{r06,r07,r10}`, count 3 remains valid while sum/mean are unavailable. For `{r04}`, count 1 and sum/mean 0 are valid. For ∅, count 0 is valid; sum/mean are unavailable under the current reducer's no-valid-input semantics. Existing MetricCard may label that state “No rows”; the proposed count finding must still represent the valid zero count. A zero denominator yields an unavailable percentage, never infinity or a fabricated 0%. [R-AGG, R-METRIC]

## 4. Target-resolution truth tables

The following are **proposed contract expectations**, not claims that baseline APIs expose a self-filter toggle. Every set includes the target's declared population. In the primary fixture, all four consumers use D and no local table restriction.

“Self-filter off” means a source's context omits only its own source clause. “Self-filter on” includes it. Its selected overlay/evidence always uses the exact applicable intersection. A display toggle must not change table/export/finding membership. Source exclusion is by source identity, never by field name. [R-CF, R-LIVE; MOS-003]

| Active state | Histogram A context: self off | Histogram A context: self on | Scatter B context: self off | Scatter B context: self on |
|---|---|---|---|---|
| None | D | D | D | D |
| A | D | A | A | A |
| B | B | B | D | B |
| A+B | B | A∩B | A | A∩B |
| W+A+B | W∩B | W∩A∩B | W∩A | W∩A∩B |
| Z+B | B | ∅ | ∅ | ∅ |
| Clear A, retain B | B | B | D | B |
| Clear B, retain A | D | A | A | A |

| Active state | Evidence table and CSV, Q absent | Count numerator: metric / proposed finding | Proposed finding baseline |
|---|---|---:|---|
| None | D | 12 | D:12 |
| A | A | 7 | D:12 |
| B | B | 5 | D:12 |
| A+B | r02, r07, r10, r11 | 4 | D:12 |
| W+A+B | r02, r07, r11 | 3 | W:7 |
| Z+B | ∅ | 0 | D:12 |
| Clear A, retain B | B | 5 | D:12 |
| W+A+B, then clear only A/B | W | 7 | W:7 |
| Existing global `clearAllFilters`, including W | D | 12 | D:12 |

The diagnostic metric can be an assertion or existing MetricCard; it need not become a fifth new product feature. The final column belongs to the proposed finding: an existing MetricCard without local restrictions keeps D as its denominator even when W is active. A context histogram may intentionally count more rows than the selected evidence. Inspect the selected overlay as E and a context mark as its own declared context; do not fail an honest scope difference or hide a dishonest one.

### 4.1 Two sources on the same field

Run A+C with distinct source IDs. Histogram A self-off context is C; source C self-off context is A; exact evidence is r03/r06/r07/r10/r11. Clear A and expect C's six IDs. Restore A+C, clear C and expect A's seven IDs. Replacing source A's interval changes only A. Workspace replacement by field remains its existing separate policy. [R-CF, R-PROVIDER]

### 4.2 Facets, local populations and notebook mode

With target facet East, A+B evidence is r02/r07/r11; with West it is r10; explicit empty facet is ∅. An absent facet restriction is not the same as an empty set. Current generated facet groups are ordinarily nonempty; the empty-array widening is a contract edge to test, not a reproduced routine UI failure. [R-FACETS, R-LIVE]

In a source chart restricted to East, test two explicitly labeled meanings: **global field condition A** may select matching West rows in sibling targets; **East-bound A** includes the typed East guard and yields r02/r06/r07/r11 globally. Do not switch between these meanings because the source facet is hidden. The first lasso milestone uses an unfaceted common population; facet-local publication is deferred until this product choice is accepted. [R-POP, R-SCATTER, R-DENSITY; MOS-014]

In notebook `localSelections`, selecting A must leave default peer/Rows/metric consumers at the workspace population. A finding explicitly bound to source A may read A locally; with W it reads W∩A. B in another notebook chart must not silently intersect that binding. Clear A returns it to its bound population; W still constrains every chart. The baseline global filtered-ID helper does not automatically implement these local bindings. [R-CF, R-METRIC]

## 5. Procedures for the four consumers

### 5.1 Boundary proof first: three rows

Use separate rows `edge0=0`, `edge1=.5`, `edge2=1`, with two fractional histogram bins. Expected partition: first `[0,.5)` → `{edge0}`; final `[.5,1]` → `{edge1,edge2}`. Click each bin, then brush across both. Compare exact IDs from the writer, selected overlay, neutral table/export and count inspection. Repeat the interior-edge check for Scatter marginals.

The static baseline counterexample is known: the first emitted inclusive range includes edge1. First reproduce/document it in the complete checkout; then prove the correction. Preserve legacy manually entered closed ranges and existing saves. Express closure or precise membership explicitly; never subtract epsilon. A test asserting only `{min:0,max:.5}` would enshrine the error. [R-BAR, R-MARGINAL, R-FILTER; MOS-002]

### 5.2 Lasso, commit and cancellation

Begin without clauses. Draw B on linear axes and commit once. Check the five B keys. Start a second polygon then cancel: B, export, finding and history checkpoint remain unchanged. Reverse polygon winding and expect identical B membership. Cover edge/vertex points, overlapping coordinates and invalid coordinates. Reject degenerate/self-intersecting geometry with an explicit unsupported/unavailable state unless a reviewed fill rule is supplied; do not improvise one during implementation.

Apply A, then B; reverse their order and expect A∩B both times. Toggle source-self display on/off and compare the tables above. Distinguish transient pixels from committed source-unit vertices. Resize, change point size and toggle a density rendering without redefining E. If a candidate cannot inspect exact members after aggregation, stop. [R-BRUSH, R-SCATTER, R-DENSITY; MOS-004, MOS-012]

### 5.3 Table scope, hidden columns and export

With A+B active and no table-local restriction, CSV IDs must be exactly r02/r07/r10/r11, including rows outside the virtual window. Sort ascending/descending and change row height: membership stays fixed. Keep `id` visible; current CSV exports configured columns and need not synthesize a hidden row key. Parse exported CSV for comparison rather than counting displayed rows. [R-TABLE]

Now apply an explicitly table-local East restriction Q, or a local search equivalent with pinned searchable columns. Table/export become r02/r07/r11; a workspace-bound finding stays 4. A finding explicitly rebound to that table's declared scope becomes 3. The UI must name the scope. Clear Q and return to four. A table search is not currently a linked workspace predicate. [R-TABLE, R-ROWS; MOS-005, MOS-006]

Separately reproduce the hidden-filtered-column path: set an actual DataTable column filter, then hide its column. The local table evaluator retains filters that its outgoing definition may ignore once the column is absent. Choose one reviewed policy: retain the predicate everywhere with a visible active-filter explanation, or clear it atomically everywhere. No pass is possible while display alone silently changes outgoing membership. Do not confuse this linked column-filter probe with intentionally local Q/search. [R-TABLE; MOS-005]

### 5.4 Trace and finding evidence

For a count selection at equal scope, selected IDs, table IDs, CSV IDs, finding inspection IDs and union of selected count contributors must equal E. Reject any extra/missing key even if counts match. A context bar trace is compared with that mark's declared context instead. For measures, retain E as evidence, report included `{r02,r11}` separately from excluded `{r07,r10}`, and verify 25/2=12.5. [R-TRACE, R-AGG]

The authored live binding is proposed: a literal statement plus one selected-count value, selection reference, baseline and inspect action. Persist author text/binding, not a stale rendered number. Test 0, unavailable source, no-valid-measure and zero-denominator states distinctly. **Do not wire the existing daily finding evaluator unchanged into this path.** It has its own condition language, coercion/missing rules and empty-result behavior, and no established workspace subscription. Published daily findings remain their separate workflow unless a reviewed adapter proves equivalence. [R-FINDINGS; MOS-006, MOS-013]

## 6. Lifecycle, persistence and interaction checks

Save A+B under revision 1, clear, restore and expect r02/r07/r10/r11. Save W+A+B and expect r02/r07/r11. From that state, the proof's distinct **clear interactive A/B** action retains W and yields its seven rows. The existing **global `clearAllFilters`** action clears chart and workspace filters plus DataTable/Rows searches and Rows filters, yielding D's twelve rows here; chart `localFilters` remain. Do not change that existing command's meaning. Undo one committed B action returns to A; redo restores A+B. Cancellation creates no semantic history step. When editing authored note text, ordinary text undo remains owned by the editor. [R-PROVIDER, R-SAVE, R-HISTORY]

Delete B: A remains. Duplicate a source/view: it receives a distinct scoped identity, with an explicitly chosen copy-selection policy; changing or clearing the copy cannot mutate the original. Reorder rows and restore through logical keys: membership remains the same public keys. If only revision-bound positional membership exists, mark it unavailable or remove it with an explicit notice; never attach old indices to new rows. Data replacement, missing fields, changed numeric/date/null-token conversion and calculated-field edits must revalidate predicates/populations and caches. [R-IDENTITY, R-PROVIDER; MOS-007]

JSON and DSL round trips must preserve typed values, interval closure, scope and source identity, or return a clear unsupported-export diagnostic. Extend traversal across chart, Rows, workspace, local-population and new geometry locations. A successful parse is insufficient if a predicate was omitted. Legacy inclusive ranges must retain their meaning. Multiple datasets with coincident field names remain outside the first proof unless existing logical provenance supplies a verified mapping. [R-SAVE, R-DSL, R-IDENTITY]

Run each user-visible milestone at **1280, 783 and 390 CSS pixels**. The library currently documents desktop support at 1024+; intermediate/narrow checks assess resilience and accessible fallback, not an unannounced mobile-editor promise. Check readable selection summary, discoverable clear/inspect/export, focus retention, no trapped popovers, and non-color-only empty/selected states. [R-UI; MOS-015]

Provide a keyboard equivalent for B. A small coordinate-entry control accepting the three source-unit vertices, with Enter to commit and Escape to cancel, can produce the identical polygon without pointer drawing; alternatively a reviewed exact row-selection control must explicitly identify its equivalent membership. Reach source, clear, summary, evidence and inspect actions by keyboard. Existing ordinary canvas points do not inherit all bubble keyboard behavior. Test Escape draft cancellation separately from clearing a committed selection, preserve focus after restore/remount, and announce count/unavailable changes accessibly. [R-SCATTER, R-BRUSH, R-HISTORY]

## 7. Semantic acceptance gates

All gates are **proposed/unrun**. Preserve failure artifacts: fixture/revision, committed predicate, target scope, expected/actual sorted keys, source owner and relevant screenshot/trace. No performance result can waive one failing key.

| Gate | Pass condition | Recommendations |
|---|---|---|
| **S-01 — Baseline and identity** | Exact baseline recorded; raw/prepared representation pinned; D/revision/public keys and scoped source identities established | MOS-001, MOS-007, MOS-008 |
| **S-02 — Interval parity** | Three-row histogram/marginal probes pass; A is half-open; legacy closed ranges unchanged | MOS-002, MOS-003 |
| **S-03 — Resolution** | A/B, A/C, W, zero and clear-one tables pass; self-display changes no exact evidence | MOS-003, MOS-014 |
| **S-04 — Geometry and composition** | B includes boundaries/overlaps, excludes rectangle extras; tuple probe preserves pairs; unsupported shapes fail explicitly | MOS-004, MOS-012, MOS-013 |
| **S-05 — Exact evidence/export** | Equal-scope table/export/selected trace/finding key sets match; virtual window/sort/hiding cannot silently change linked scope | MOS-005, MOS-012 |
| **S-06 — Analytical binding** | Selected count, valid-input mean, explicit denominators, zero/unavailable and inspect behavior match oracle; daily findings remain separate | MOS-006, MOS-008, MOS-013 |
| **S-07 — Values and time** | Typed values, missing/invalid data, UTC boundaries, absent periods and true zero remain distinct | MOS-008 |
| **S-08 — Population and notebook** | Global vs facet-bound meaning explicit; empty facet stays empty; notebook peers/local bindings obey declared policy | MOS-014 |
| **S-09 — Lifecycle** | Clear/delete/duplicate/undo/redo/cancel/field edits preserve or explicitly invalidate meaning without collateral changes | MOS-007 |
| **S-10 — Durable round trip** | JSON/project identity/DSL preserve meaning or reject unsupported cases; stale revision never silently widens/selects new rows | MOS-007 |
| **S-11 — Rendering independence** | Resize/viewport/size/bin/color/preview changes do not redefine committed evidence; delivered density/Heatmap meaning preserved | MOS-008, MOS-012 |
| **S-12 — Usable proof** | Keyboard equivalent and three widths checked; source/context/evidence status readable; docs and reachable example agree | MOS-015 |

## 8. Optional reproducible performance experiment

Begin only after semantic gates pass. Measure the production build on named hardware/OS/browser with fixed viewport/device-pixel ratio and renderer. Record package versions, commit, backend/thread settings where applicable, and whether browser/OS caches are warm. Historical repo long-task totals and paper benchmarks are motivation, not baseline numbers for this experiment. [R-PERF, PAPER-V1; MOS-009]

**Use two explicitly named comparisons.** The immutable baseline measures existing gestures, existing consumers and regression/overhead costs; it does not have the proposed lasso or live finding, so do not report baseline timings as if those features already existed. Once the semantic gates pass, the exact internal-contract branch becomes the control for optional acceleration, with identical four-consumer work, predicates, populations and settings in control and candidate. If a baseline harness injects an equivalent exact ID set to approximate the workload, label it **separate instrumentation**, record its added work, and report it separately from native baseline interactions. This prevents added finding/interaction work from being misattributed to predicate or backend performance.

### 8.1 Data and workload

Use **10k and 100k rows**, optionally 1M if setup/memory remain within the agreed budget. Proposed generator: unsigned xorshift32 with shifts 13/17/5, seed `0x4d4f5301`, and uniform values from state divided by 2³²; pin the implementation/version and publish dataset hashes. Consume a fixed eight draws per row before applying overrides. Use three distributions: independent uniform x/y in `[0,1000)`; an 80% Gaussian cluster centered at `(500,500)` with standard deviation 20 using a declared Box–Muller transform, plus 20% uniform; and repeated grid coordinates `10*floor(100*u^4)` to create skew and exact multiples-of-10 boundaries. Sweep category cardinality 10/100/1000, with category index `floor(K*u)` or the documented skew variant `floor(K*u^4)`.

Assign stable public keys by row index, then deterministic overrides at distinct `index mod 100` residues: 0 makes x null, 1 makes y `"bad"`, 2 stores x as numeric text, 3 makes amount blank, 4 makes amount `"bad"`, and 5 makes the date invalid. Publish the final generator and generated hashes before running comparisons; identical arrays and prepared projections must feed every candidate. This is a proposed benchmark generator, not generated application data or an executed benchmark.

Run **4, 8 and 12 views**. Four is the primary histogram/Scatter/table/finding scenario; added views repeat documented aggregate/context patterns without hidden backend work. Keep source-exclusion and table-local scope constant between candidates. The matrix includes 1D range, 2D rectangle, exact lasso, two simultaneous sources, same-field competition, workspace W, active-source switches, clear and restore. Do not benchmark only compatible warm range queries while reporting a general interaction speedup.

For each configuration, run **five independent runs**. Each warm run uses **10 unmeasured warm-up commits followed by 100 measured commits** from the same published sequence: 40 one-dimensional, 30 rectangular, 20 lasso and 10 clear/restore transitions. Interleave source switching and two-source states. Run cold setup separately from fresh processes/caches five times. Cold measurements include data ingestion, index/materialized-view construction and first coherent result; report them separately from warmed replay. Capture baseline before the candidate, then alternate order across runs to reduce thermal/cache bias.

### 8.2 What to measure and compare

Report per-run and pooled p50/p95 for gesture-commit→coherent-consumers latency, predicate resolution/ID materialization, chart-plan/render completion and **exact evidence-query/export preparation**. State clock boundaries and whether worker/backend/transfer time is included. Pointer draft smoothness is a separate measure because current ordinary brushing commits semantic work on pointer-up. Log counts of recomputed charts, ID scans, backend queries and discarded stale work where instrumentation permits.

Measure setup/construction time, peak and retained heap, worker/DB memory, cache size, number of materialized cells and bytes. Include high-cardinality and source-switch reconstruction costs, cold/warm invalidation after calculated-field or data edits, and break-even interaction count. Avoid calling process memory and JavaScript heap the same metric. Failed/unsupported workloads remain in the results with fallback cost; they are not silently omitted.

Before every timed consumer result is accepted, compare exact sorted public key sets against an independent direct predicate evaluator. Compare numerical measures only after ID parity; declare any floating arithmetic tolerance separately. An aggregate cube may answer a count faster while a raw evidence query still scans rows. Measure both. Averages require valid sum/count; entity deduplication/conflicts and nonadditive statistics need richer state. Lasso boundary bins require exact rechecks or a direct fallback. [R-AGG, PAPER-V1, UP-COORD; MOS-009, MOS-012]

### 8.3 Acceleration gates

All are **proposed/unrun**. Predeclare machine-specific latency/memory/setup budgets before observing candidate results; do not set a favorable threshold afterward.

| Gate | Pass condition |
|---|---|
| **A-01 — Reproducibility** | Full configuration, seeds/hashes, five runs, cold/warm separation, timing definitions and raw samples available |
| **A-02 — Exactness/eligibility** | Every accepted result preserves exact IDs and supported aggregates; lasso/OR/entity cases use proven eligibility or measured exact fallback |
| **A-03 — Useful benefit** | Repeatable p50/p95 improvement exceeds run-to-run noise in the actual bottleneck, with evidence latency and agreed budgets preserved |
| **A-04 — Costs/invalidation** | Construction, memory/cardinality and break-even costs are acceptable; field/data edits invalidate all affected state correctly |
| **A-05 — Real workload** | Source switches, two-source states, clear/restore and stale-result ordering pass; restricted fast paths and regressions are reported |

Failure of A-03/A-04 means **defer acceleration**, retaining the semantic work. Failure of A-02 is a **stop**, even if previews look indistinguishable. Mosaic Selection adoption and DuckDB optimization remain separate decisions, each requiring its own maintenance/API benefit. Unsupported cross-source OR must not enter an AND-oriented preaggregation path without a dedicated parity proof. [UP-SEL, UP-COORD, PAPER-V1; MOS-010, MOS-011, MOS-012]

## 9. Milestones, files and decision outcomes

| Milestone | Bounded reviewable result | Likely implementation/test seams | Required docs section and reachable example |
|---|---|---|---|
| **M1: boundary proof** | Useful correction to clicked histogram/marginal membership; explicit closure and legacy compatibility | `types/FilterTypes.ts`, `hooks/applyFilter.ts`, Bar `bins.ts`/`BarChart.tsx`/plan tests; Scatter `marginalPlan.ts` and tests | `apps/demo/src/docs/pages/filters.mdx`: interval edges and clear-vs-zero; register a three-row **Selection boundaries** example in `apps/demo/src/demos/examples.ts` with settings/fixture in `dashboardSettings.ts` or focused module |
| **M2: exact lasso/four consumers** | One small source-owned contract, linear lasso, shared exact evidence and selected-count inspection | Crossfilter/provider/live hooks; Scatter writer/plans; DataTable scope; bounded finding binding; tests at semantic seams | `filters.mdx`: source context, lasso, exact evidence and keyboard route; precise-selection and narrative intent briefs; reachable **Exact selection proof** using the 12-row fixture and existing density-dashboard arrangement as a starting point |
| **M3: durable lifecycle** | Reviewed persistence/logical identity/field dependencies/history/unsupported DSL behavior | `SavedDataStructure.ts`, `saveDataUtils.ts` and tests; project identity traversal/tests; DSL export/compile tests; existing history | Library README/API save/restore section and `filters.mdx`: revision/unavailable semantics; extend **Exact selection proof** with save/restore, clear, undo and documented scope cases |
| **M4: measured optional acceleration** | Reproducible baseline and any separately earned candidate | `docs/performance-checks.md`, benchmark harness; candidate adapter/cache only if authorized | Performance method/results section; reachable **Selection performance** example with documented seed/row/view controls; preserve shipped Heatmap examples as regressions |

Paths under the package in this table start at `packages/explorEDA/src/`. Update existing live-doc example registration only after inspecting it in the complete checkout; the packet did not include every docs helper. Every user-visible milestone must demonstrate its own docs/example and keyboard behavior, rather than postponing them to a final polish stage. Delivered `message-heatmap`, `measles-heatmap` and election heatmap examples protect PR #450 history/color behavior; they are not redesign work. [R-INTENTS, R-HEATMAP, R-UI; MOS-008, MOS-015]

**GO** after source/identity prerequisites and all semantic gates pass: retain the small internal implementation, existing React renderers and Crossfilter. **NO-GO** if required semantic source, baseline or a dependable exact resolver cannot be established. **Defer** broader tuple/facet UI, Mosaic adapter or backend optimization when the benefit is unproven or the bounded proof does not need them. **Stop the current experiment** on changed exact membership, lost provenance, silent population widening, stale evidence presented as current, lossy restore, or an unresolved product choice about scope/geometry. Record the smallest failing case and seek that specific decision; do not expand into an open-ended rewrite.

## 10. Completion record for this research

Completed here: immutable-source research informing this plan and independently calculated fixture oracle sets, including A/B/C/W, typed/date/tuple cases and selected-measure arithmetic. Completed separately in the research package: source/paper access and artifact integrity checks documented by its manifest.

**Still unrun:** every S-01–S-12 application acceptance check, all keyboard/responsive procedures, runtime reproductions of the identified boundary/hidden-column risks, persistence round trips, all A-01–A-05 performance checks, and every application test or build. The next authorized step belongs to Codex's review of these research artifacts and a bounded implementation proposal—not a claim that this plan itself proves application correctness.
