# Evidence and comparisons: engineering histogram boundaries

- **Repository:** https://github.com/byronwall/explorEDA
- **Source baseline:** `9b16d78e3ed0742ed4d5858c1939fec9e758b510`
- **Research date and external-source retrieval date:** 2026-10-21, America/Indianapolis
- **Integration owner:** Codex; proposed collection branch `codex/engineering-bins-research-2026-10-21`
- **Scope:** Research only. No application implementation, repository mutation, merge, deployment, or product approval.
- **Related documents:** [Decision report](decision-report.md), [Proof plan](proof-plan.md), [Revised research queue](research-queue.md).

## 1. Evidence outcome

**[Inference / decision] Keep the current histogram controls and use existing exact range filters, ECDF analysis, or upstream categories for the declared engineering task. Defer authored width/origin and explicit edges.** The material supplies a plausible repeated task, existing code contracts, and a bounded consistency concern. It supplies neither a named analyst whose task defeats the current comparators nor an executed runtime failure. Existing behavior and deferral therefore remain substantive outcomes.

**[Proposal] Four recommendations are carried consistently across this package:** EB01 retains current controls and threshold routes; EB02 runs an independent current-selection consistency proof with any repair assessed separately; EB03 permits a focused existing-docs lesson and paired runnable example only when its gate is met; EB04 reopens boundary controls only through a named-task comparator test. None approves implementation.

The comparison task **T1** is a repeated engineering record review: for a supplied measurement field in a declared unit, count and inspect finite measurements below a lower specification limit `L=2`, within the inclusive acceptance interval `[2,4]`, and above the upper limit `U=4`; report missing/invalid records separately; repeat after peer filtering and a source refresh. These numbers define a discriminating research task, not observed user demand, a process-capability model, or a batch-release authorization. [Proof plan](proof-plan.md) fixes the rows and exact expected arithmetic.

### Evidence labels

| Label | Meaning | What it cannot establish |
| --- | --- | --- |
| **Source fact** | A statement directly supported by the pinned repository files or authenticated packet contents. | Runtime behavior, browser success, user demand, or performance. |
| **External fact** | A statement from current primary product documentation or statistical guidance, with direct URL and retrieval date. | explorEDA product value or an implementation mandate. |
| **Arithmetic** | An independently computed consequence of the declared fixture and membership rules. | That the product executed those rules. |
| **Inference** | A conclusion drawn from the facts, with assumptions stated. | An observed fact. |
| **Proposal** | A possible proof, lesson, gate, or later design choice. | Approval, completed work, or a shipped feature. |

## 2. Access preflight and integrity

### 2.1 Research access gate: GO, with execution limits

**[Source/access fact]** The repository, exact baseline, supplied local additions, historical refs, and decisive source are identifiable. All **34 packet entries** reproduce their declared byte counts and SHA-256 hashes: **30 baseline files, two local additions, and two historical files**. The packet is a selected text snapshot, not a runnable checkout.

- Packet: `source-packet(20261021-070110).txt`
  - Bytes: **299,953**.
  - SHA-256: `649b0669aa76e63058edf709cdbf54bf56a54f543855cc88ea6333653d2aec34`.
- Attached execution prompt: `pro-prompt(20261021-070110).md`
  - Bytes: **9,112**.
  - SHA-256: `146dd45c90dec8817f023db80d93826a86b0e7cd0e91d718fefa94203b77dc9a`.
  - It matches the packet's separately identified local prompt addition.

**[Access fact]** Public web retrieval of canonical GitHub/raw source paths returned `DisabledError`, but the authenticated, read-only GitHub connector subsequently retrieved the pinned baseline and additional essential files. This is a limitation of one retrieval route, not evidence that the repository was unavailable or that omitted packet dependencies do not exist.

**[Source/access fact]** The connector confirmed [the baseline commit](https://github.com/byronwall/explorEDA/commit/9b16d78e3ed0742ed4d5858c1939fec9e758b510), dated `2026-10-19T02:56:32Z`, with tree `1662ed9af54f5735d8d700241670fbb8fd48593e` and merge subject “Progressive built-ins 4/4: Heatmap histories, date bins, and fixed color ends.” GitHub reported the commit signature verified. An independent connector fetch of `BarChart/bins.ts` matched the packet byte for byte. Twelve supplemental files were retrieved at that exact baseline, with Git blob identity checks recorded. A thirteenth file, the historical catalogue, was retrieved at its own pinned ref to verify only the continuing queue IDs.

### 2.2 What authentication establishes

- **Packet integrity:** Every entry matches the hash declared in its envelope. Parsing preserved the original content bytes, including each file's final newline, instead of hashing the enclosing separators.
- **Repository provenance cross-check:** The baseline commit and one decisive packet file were corroborated through GitHub. Supplementary source was fetched directly at the baseline or the explicitly stated historical catalogue ref, and its returned Git blob identity verified.
- **Remaining limit:** The packet's self-consistent hashes are not an independent signature over all 34 entries. Not every packet entry was refetched remotely, and the two local additions are not claimed to exist in the baseline commit. GitHub's commit-signature status is a reported property, not independent signature verification performed by this research package.
- **Historical isolation:** R008 belongs to `476a1be3544f93baf7c4732a436163609fbbd02f`; the preceding retention queue belongs to `a915f6965055d1b69f9bccfaddf50e4b5986468a`. Their relative links are not resolved against the new package. Canonical pinned links appear below.

**[Decision]** Source-based research is **GO**. Application execution and product acceptance are **not established**. No decisive source remains absent in a way that prevents this recommendation. Any later proof must use a runnable checkout and its actual dependencies; there is no reason to request an entire replacement repository merely to complete this research decision.

### 2.3 Execution ledger

| Check | Status | Meaning |
| --- | --- | --- |
| Packet entry byte counts and SHA-256 | **Executed; 34/34 matched** | Integrity relative to the packet declarations. |
| Baseline commit lookup and pinned supplementary retrieval | **Executed** | Repository identity and additional source recovered through the connector. |
| Independent `bins.ts` packet/source comparison | **Executed; exact match** | One decisive packet file independently corroborated. |
| Primary-source documentation retrieval | **Executed** | The pages cited in §5 were accessible on 2026-10-21. |
| Fixture arithmetic | **Separately reported in proof-plan.md** | Mathematical checks are not product execution. |
| Repository Vitest suites and type checks | **UNRUN** | No test-pass claim. |
| `pnpm check` and `pnpm check:pr` | **UNRUN** | No integration or PR gate result. |
| Browser click/brush/trace/export/undo/reopen checks | **UNRUN** | No executed browser defect or success claim. |
| Named analyst comparator study | **UNRUN; no named demand supplied** | Benefit and setup-effort scores remain judgments. |

## 3. Repository evidence and what it supports

The reading route covers working rules, README, package manifest, agent guide, coding standards and UI defaults; then current-analysis trust and population-baseline intent; R008 at its historical ref; bin, bar, filter, population/provider and ECDF implementation/tests; existing documentation and verified example registrations. Pinned source links below identify the actual symbols used in the reasoning.

### 3.1 Current bins and selection

| Evidence | Source facts | Interpretation and unresolved proof |
| --- | --- | --- |
| [`bins.ts`](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/BarChart/bins.ts), `numericBins` | Full supplied `all` values establish extents; requested count is rounded and clamped to 2–100. All-integer input uses boundaries offset by 0.5, an integer step, and potentially fewer bins. Noninteger constant input expands by 0.5 on each side. | Requested count is a shape-control input, not an authored engineering boundary contract. Histogram geometry is global even when a local population changes its displayed counts; stability during peer filtering does not imply stability after source replacement. |
| [`definition.ts`](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/BarChart/definition.ts), `BarChartSettings`; [`BarChartSettingsPanel.tsx`](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/BarChart/BarChartSettingsPanel.tsx), bin-count slider | The default count is 20; the visible slider spans 2–50. The setting interface has no authored width, origin or edge array. | The wider helper clamp is not evidence of an existing hidden width/origin UI. A new control would extend saved analytical settings. |
| [`barPlan.ts`](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/BarChart/barPlan.ts), `binRows`, `planBarChart` | Binned values use finite numbers. Bin count and contributor membership follow the same floor-based half-open partition, with the final bin closed. Members retain source IDs and raw input. | Count–contributor parity is directly intended in source. Arithmetic at representable edges and integration effects still need the bounded proof. |
| [`BarChart.tsx`](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/BarChart/BarChart.tsx), numeric brush/click handlers and bin-change effect; `snapRangeToBins`, `sameRange`, `binInRange` in `bins.ts` | Clicks write `min=bin.start`, `max=bin.end`. Brushes snap to nearest edges; exact midpoint ties move outward. Narrow spans can expand to one bin. The effect re-snaps a stored range when current edges change. `sameRange`/`binInRange` use a span-scaled comparison tolerance. | A stored selection can move following count, extent, or integer-treatment changes. The tolerance concerns edge/range comparison, not general fuzzy numeric membership. Do not promise fixed specifications from a bar-owned range. |
| [`applyFilter.ts`](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/hooks/applyFilter.ts), `applyFilter`; [`FilterTypes.ts`](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/types/FilterTypes.ts), `RangeFilter` | Numeric ranges use `>= min` and `<= max`; absent bounds are open-ended. The range type does not carry endpoint-closure flags. | A nonfinal bin's upper-bound ties can belong to the next bar while matching the clicked bar's inclusive linked range. This is a **source-predicted discrepancy requiring proof**, not an executed defect. Changing range semantics globally would affect other charts and restoration. |
| [`barTrace.ts`](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/BarChart/barTrace.ts), `resolveBarTrace`; [`BarTraceBody.tsx`](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/BarChart/BarTraceBody.tsx) | A trace resolves a planned mark by ID and exposes its contributors and scope information. | Trace rows and linked selected rows must be compared independently at exact ties. “Trace exists” is not proof that the two predicates agree. |

### 3.2 Existing threshold routes, populations, and restoration

| Evidence | Source facts | Interpretation and unresolved proof |
| --- | --- | --- |
| [`ecdfPlan.ts`](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/Ecdf/ecdfPlan.ts), `buildSteps`, `shareAt`, `countInRange`, `idsThrough`, `thresholdFilter`, `planEcdf` | Repeated values share a step. Directions mean at-or-below and at-or-above; interval counts are inclusive. Threshold filters are ordinary range filters. Group curves have their own eligible-measurement counts. | Existing ECDF can answer inclusive `[L,U]` counts and threshold shares without histogram geometry. Strict tails must account for ties; subtracting one inclusive share from another naively can exclude a limit that should be accepted. |
| [`EcdfChart.tsx`](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/Ecdf/EcdfChart.tsx); [`ecdfTrace.ts`](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/Ecdf/ecdfTrace.ts), `resolveEcdfTrace` | The chart wires thresholds/spans to linked ranges and resolves step contributors using the plan. | Numeric settings and source inspection remain legitimate comparators. Pointer placement by itself is not an exact-input guarantee. |
| [`FiltersSettingsTab.tsx`](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/settings/FiltersSettingsTab.tsx), `chartFilterFields`, `FiltersSettingsTab`; [`ColumnFilter.tsx`](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/DataTable/components/ColumnFilter.tsx), `ColumnFilter`, `updateRange` | Once an ECDF selection exists, its field appears in the generic Filters tab. Numeric minimum/maximum inputs accept finite bounds, including unobserved limits, and permit absent bounds. | Create an ECDF selection, then edit its At least/At most fields to the exact limits. ECDF gestures snap to observed values; typed inputs establish the exact comparator. Avoid a bar-owned specification range because its effect re-snaps. Browser discoverability, precision and persistence remain UNRUN. |
| [`useGetLiveData.tsx`](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/useGetLiveData.tsx), `useGetLiveIds`, `useGetAllIds`; [`useGetColumnData.tsx`](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/useGetColumnData.tsx); [`chartPopulation.ts`](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/chartPopulation.ts), `restrictToPopulation` | Live IDs incorporate current filtering and a nonempty facet-ID restriction. `useGetAllIds(settings)` honors chart-local filters. However, the histogram passes no IDs to its all-column helper, so its geometry remains global; ECDF uses locally restricted all IDs for X extent. | Histogram all-values and ECDF all-IDs are different scopes. Histogram counts/traces honor local/facet context while its edges remain global. A range click does not automatically add local/facet conditions to linked selection. Empty facet-ID handling needs explicit coverage. |
| [`DataLayerProvider.tsx`](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/providers/DataLayerProvider.tsx), `getLiveItems`, `setData`, `restoreFromStructure`, `restoreAnalysisFromStructure`; [`CrossfilterWrapper.ts`](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/hooks/CrossfilterWrapper.ts) | Ordinary data-prop replacement resets charts when no saved settings are supplied; replacement with `savedData` reapplies that provided snapshot. The crossfilter group omits its own chart selection while peers/workspace filters constrain it, unless local-selection mode disables peer linkage. | Use `localSelections=false` for the primary proof. Refresh must name the entry point and captured settings; a supplied snapshot need not contain the latest transient edits. Local/facet trace scope may intentionally differ from global selected rows. |
| [`valueParsing.ts`](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/valueParsing.ts), `parseNumber`, `finiteNumber`, `finiteNumbers`, `isExactNumberText`, `numericExclusionReason` | Blanks, booleans, radix-prefixed text and nonfinite results do not become finite measurements. Eligible numeric text can be read as a finite number. `isNumericBarField` in `barPlan.ts` also requires every nonmissing source value to be number-like. | A raw `bad` string or boolean can switch the entire bar field to categorical mode; numeric NaN/Infinity remain number-like but excluded. Use deliberate numeric-mode invalids and test mixed ingestion separately. Per-bin traces do not contain all excluded records; obtain exclusion counts through appropriate source/ECDF inspection. |
| [`saveDataUtils.ts`](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/utils/saveDataUtils.ts), `isFilter`, `isChart`, `validateSavedData`; [`dataLayerState.ts`](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/providers/lib/dataLayerState.ts) | `initializeData` overwrites internal `__ID` with the imported index. Existing saved settings validate filters and chart configuration, but do not persist authored bin edges. | Authored grids/edges, endpoint metadata, units, and selection meaning would require a coherent saved contract and validation. Use a separate `record_key` column for replacement proofs; internal row indices are not durable identities after reordering. |

**[Source fact]** Existing tests are supplied: `bins.test.ts`, `barPlan.test.ts`, `BarChart.select.test.tsx`, `applyFilter.test.ts`, and `ecdfPlan.test.ts`. They provide evidence of intended cases, including integer spacing, snapping, inclusive filters and ECDF ties. The supplied bar selection tests concern grouped categorical interactions rather than the required numeric-edge bridge. They were **read, not run**. A test file's existence does not establish the exact cross-view tie/refresh scenario required here.

### 3.3 Existing intent, docs, and examples constrain scope

- **[Source fact]** [`population-baselines/intent-brief.md`](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/docs/intent/population-baselines/intent-brief.md), “Boundaries,” explicitly separates distribution refinements from named baselines. Byron's low interest in named comparisons is neither approval nor rejection of custom histogram boundaries.
- **[Source fact]** [`current-analysis-trust/intent-brief.md`](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/docs/intent/current-analysis-trust/intent-brief.md), “Next step after confirmation,” keeps the first local task focused on category membership, measures, exported rows, undo and restoration. Another survey cannot accept that task.
- **[Source fact]** [R008 at its supplied historical commit](https://github.com/byronwall/explorEDA/blob/476a1be3544f93baf7c4732a436163609fbbd02f/docs/intent/research-ideas-100/ideas/R008-engineering-bin-boundaries.md) is a candidate with medium confidence, not implementation approval. Its rejection comparator expressly permits retaining current controls.
- **[Source fact]** [`bar.mdx`](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/src/docs/pages/bar.mdx) and [`ecdf.mdx`](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/src/docs/pages/ecdf.mdx) already exist. [`docs/live/examples.ts`](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/src/docs/live/examples.ts) and [`demos/examples.ts`](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/src/demos/examples.ts) register delivered runnable examples, including the ECDF product-activity example. Any EB03 lesson extends these established surfaces; it does not create their initial documentation.
- **[Source fact]** [`AGENTS.md`](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/AGENTS.md) requires docs and a demo example in the same milestone when planning user-visible work. The research request itself forbids implementation. [The historical retention queue](https://github.com/byronwall/explorEDA/blob/a915f6965055d1b69f9bccfaddf50e4b5986468a/docs/research/retention-observation-2026-10-21/research-queue.md) and supplied current queue identify completed surveys and adjacent owners; the revised queue preserves them.

## 4. Five alternatives compared against T1

**[Inference; ordinal judgment, not measured usability]** Scores use **1–5, higher is better**. The vector is **A / S / R / I / M**: decision accuracy for T1; setup ease; repeatability; row inspection; maintenance ease. “Accuracy” rates the method's ability to express the stated answer when correctly used, not a claim that the current application has passed runtime verification. No totals are calculated: an unproven selection contract cannot be offset by a pleasant setup score.

| Alternative | A / S / R / I / M | Basis and limitation |
| --- | --- | --- |
| No product change plus a conditional focused lesson | **4 / 4 / 4 / 4 / 5** | Lowest product cost. A lesson can route threshold work to delivered tools and explain ties/denominators. It cannot fix a runtime disagreement or prove that readers can repeat the task. No lesson is automatically commissioned. |
| Current numeric range filters and ECDF | **5 / 4 / 4 / 5 / 5** | Directly express inclusive `[2,4]`, cumulative shares and contributor inspection without choosing bins. Strict tails require correct tie handling. Existing selection/restore proof remains necessary; bar-owned snapping is avoided. |
| Upstream authored categories | **5 / 2 / 5 / 5 / 4** | A versioned rule can distinguish `<2`, `[2,4]`, `>4`, and invalid values exactly. Categories retain original row identity and can use equal-width count bars. Preparation and schema ownership add effort; refreshed data must rerun the same rule. |
| Fixed width plus origin | **3 / 3 / 4 / 3 / 3** | A stable grid can repeat half-open geometric bands and preserve finite widths. It does not, by itself, express both inclusive acceptance endpoints; a cut at 4 assigns ties to the next bin. Exact linked membership, refresh, empty bands and persistence remain new obligations. |
| Explicit ordered edge list | **3 / 2 / 4 / 3 / 1** | Can locate irregular cuts precisely, but still does not solve inclusive acceptance classification merely by placing 2 and 4 in the array. Adds validation, unequal-width encoding, tails, editing and persisted-selection costs. Its row-inspection contract is proposed, not demonstrated. |

The first row is a **product disposition**, while the second is a **workflow already available under that disposition**; they are not mutually exclusive feature menus. The different scores reflect that a focused lesson's actual success has not been observed. The final two rows could score better for an observed task requiring recurring **half-open band counts** across many batches. No such named blocked task is supplied here.

**[Inference]** An observed inability to set arbitrary histogram boundaries is not enough to defeat the current comparators. The question is whether those comparators fail the engineering decision, its repeatability, or its row-inspection requirement at an agreed effort threshold. If a named analyst completes T1 accurately with an existing range or prepared category, EB04 rejects the extension.

### 4.1 Boundary obligations, regardless of alternative

| Issue | Current/comparator route | Conditional authored-boundary contract; not approved |
| --- | --- | --- |
| Underflow and overflow | ECDF and exact range analysis can retain the full finite population; upstream categories can explicitly label `<L` and `>U`. Missing/invalid rows stay separate. | Never silently drop values outside explicit outer edges. Retain named underflow/overflow counts and contributor sets. A width/origin grid may expand only by whole grid steps under a declared rule; it must not shift the grid. |
| Empty bands | A category absent from input may need a declared level/order if a visible zero is essential; that is part of the preparation contract. | Preserve authored empty intervals with zero counts. A grid's extent/range rule must bound potential empty-bin growth. No automatic coarsening that moves authored cuts. |
| Endpoint ties | Inclusive `[L,U]` accepts both limit values. Strict tail counts must exclude those ties. | State every interval's closure. A standard `[a,b)` partition plus a final closed bin does not equal a three-way inclusive engineering acceptance rule. Use categories for such rules unless a separate observed task justifies more semantics. |
| Unequal widths and height | Equal-size categorical bars can display band counts honestly without implying numeric widths. | Specify count, count per unit, or normalized density and label units/denominator. Do not silently reinterpret counts. Open-ended tail bands require separate counts, not fabricated density widths. |
| New source extremes | A persisted numeric predicate can remain the same while the contributing rows change. Automatic histogram extents can change after replacement. | Persist the definition, not merely derived bars. A former final closed edge can become interior after extension and reassign an unchanged tied maximum. For the width-grid candidate, require a covering upper edge strictly greater than source max and half-open `[a,b)` closure for every interval, including the terminal one. This also prevents a saved former-terminal selection from acquiring a newly appended edge tie. Fixed explicit-edge lists retain final-closed membership and disclosed tails. Reevaluate membership from values; snapshot membership is a separate decision. |
| Units | Declare the field's physical unit and the meaning of 2 and 4. A category-preparation rule records its unit assumptions. | Save or validate the relationship between field, unit and boundaries. A source change from millimeters to micrometers cannot reuse the same literal boundaries without a declared conversion. No new unit-conversion platform is proposed. |
| Representable boundaries | Use raw finite numbers and explicit input. The fixture uses binary-exact fractions for its main oracle and separately challenges adjacent values. | Reject duplicate, nonfinite, descending or collapsed edges; require positive finite width and distinct generated neighbors. Preserve exact parsed numeric values and display enough precision to distinguish them. Do not repair strict tails by subtracting an arbitrary epsilon. |
| Count edit, selection, restoration | Source shows bar-owned filters can re-snap when edges change. Existing exact-filter comparators need their own persistence proof. | Choose value-predicate or band-identity semantics and test edits, undo, save/reopen and source replacement together. Do not silently broaden global inclusive range semantics to make histogram selection convenient. |

These are design obligations, not a request to ship a general histogram editor. Explicit edges are deferred because their potential benefit is unobserved and their analytical contract is materially larger than the current count setting.

## 5. Current primary-source comparisons

All following pages were retrieved on **2026-10-21**. They are product-owner documentation or NIST guidance. These comparisons support semantic choices and costs; popularity, ecosystem size and competitor parity are not evidence of explorEDA value. No external product was executed.

### E01 — D3 bin API

**[External fact]** D3's [`bin(data)`, `bin.domain`, and `bin.thresholds`](https://d3js.org/d3-array/bin) retain original records in bins, use lower-inclusive/upper-exclusive interiors and include the final upper endpoint. Default extent and a numeric threshold hint can be niced; explicit thresholds are internal cuts, with outer bounds supplied by the domain. Null/noncomparable and out-of-domain values are ignored.

**[Inference / limit]** This supports row-preserving authored cuts, but not silent removal of engineering extremes. A D3-style threshold list is not a complete edge array. Documentation does not prove explorEDA behavior, and adopting D3 is not proposed.

### E02 — Vega-Lite and Vega binning

**[External fact]** [Vega-Lite's bin parameters](https://vega.github.io/vega-lite/docs/bin.html) provide exact `step`, boundary-aligning `anchor`, `extent`, optional nicing, and an array of allowable **step sizes**. `step` overrides options such as `maxbins`; `steps` is not an irregular edge list. Pre-binned data can provide start/end fields. [Vega's transform](https://vega.github.io/vega/docs/transforms/bin/) additionally exposes the derived start/stop/step through a signal.

**[Inference / limit]** These APIs substantiate a smaller width/anchor language. The public pages do not fully specify exact-edge/final-boundary or overflow behavior. Implementation fetches were blocked, so those details remain unverified; no convention is borrowed from NumPy or D3 to fill that gap.

### E03 — NumPy histogram

**[External fact]** [`numpy.histogram`](https://numpy.org/doc/stable/reference/generated/numpy.histogram.html) accepts a monotonically increasing full edge sequence, including the rightmost endpoint, and permits unequal widths. It uses half-open interiors with the last interval closed. Out-of-range values are ignored. Density values normalize integrated area to one over the histogram range; their heights need not sum to one.

**[Inference / limit]** This is a useful arithmetic comparator after matching edge/denominator rules. It does not define linked selections, saved-workspace behavior, or suitable handling of engineering tails. The fetched page labels itself NumPy v2.5; no installed/deployed version is asserted.

### E04 — R histogram

**[External fact]** R's [`hist` manual](https://stat.ethz.ch/R-manual/R-patched/library/graphics/html/hist.html) accepts explicit breakpoints but treats a scalar bin count as a suggestion. Defaults are right-closed interiors with the lowest endpoint included. Its `fuzz` applies a width-scaled tolerance when counting near boundaries. Equal-width plots default to frequencies; unequal-width plots default to area-one density.

**[Inference / limit]** R is not a strict-floating-point oracle unless closure and tolerance are deliberately aligned. Its opposite default orientation demonstrates that endpoint policy must be explicit. The retrieved patched manual labels graphics 4.5.2. No R execution occurred. The argument named `density` controls shading; probability density is controlled through `freq`/`probability`.

### E05 — Observable Plot bin transform

**[External fact]** [Plot's bin options](https://observablehq.github.io/plot/transforms/bin) omit empty bins by default and permit retaining them with `filter:null`. Numeric `interval` gives consecutive multiples; the default domain can extend to interval boundaries. Threshold arrays are documented as `n` values for `n−1` bins. Overall and facet-proportion reducers have different denominator scopes.

**[Inference / limit]** Empty intervals, grid origin and population denominator are independent product decisions. Numeric interval alone does not establish arbitrary origin support. These defaults are comparison evidence, not recommendations for engineering review; no Plot execution occurred.

### E06 — NIST histogram interpretation

**[External fact]** [NIST's histogram guidance](https://www.itl.nist.gov/div898/handbook/eda/section3/histogra.htm) treats the histogram as a distribution summary and distinguishes relative frequency `count/N` from density `count/(N × class width)`.

**[Inference / limit]** A supplied-limit record-review task can be solved exactly without estimating shape. If a numerical axis depicts unequal widths, height semantics need explicit treatment. This guidance does not validate product usability or justify population-probability claims from the synthetic fixture.

### E07 — NIST engineering limits, tolerance intervals and inference

**[External fact]** [NIST's tolerance-interval discussion](https://www.itl.nist.gov/div898/handbook/prc/section2/prc263.htm) distinguishes externally prescribed engineering acceptance limits from statistical intervals that cover a stated population proportion with stated confidence. Confidence intervals concern population parameters.

**[Inference / limit]** T1 uses supplied specifications and descriptive counts. Its edges are not estimated tolerance limits, confidence limits or automatic defect labels. Statistical model selection and tolerance-interval calculation are outside this proposal.

### E08 — NIST process control and capability

**[External fact]** [NIST's control-chart description](https://www.itl.nist.gov/div898/handbook/pmc/section3/pmc31.htm) uses time or sample sequence and control limits. [NIST's process-capability introduction](https://www.itl.nist.gov/div898/handbook/pmc/section1/pmc16.htm) compares a stable/in-control process to specifications and states assumptions for common capability indices.

**[Inference / limit]** Rebinning a histogram does not establish process stability or long-term capability. No statistical process-control suite, capability indices, acceptance-sampling rules or weighted-histogram platform is proposed.

### 5.1 Conflicting conventions that matter

| Contract | Verified variation | Decision consequence |
| --- | --- | --- |
| Which values an array contains | D3 internal cuts; NumPy complete edges; Plot documents full threshold boundaries. | Name and validate the stored representation explicitly if later approved. |
| Which side owns an interior tie | D3/NumPy assign it to the following interval; R defaults to the preceding interval. | Neither convention automatically expresses inclusive acceptance at both specification limits. |
| Numerical tolerance | R has a documented fuzz policy; current explorEDA range comparisons and membership serve different purposes. | Match the oracle to the declared semantics. No silent epsilon repair or borrowed tolerance. |
| Outside values | D3/NumPy can omit values outside an explicit range. | Engineering review must count/disclose extremes under its own requirement, rather than copying exclusion blindly. |
| Unequal widths | NumPy specifies integrated density; R chooses density for irregular widths. | Explicit edges entail a rendering/denominator choice in addition to parsing. |

## 6. Recommendation evidence and falsification

| Stable ID | Evidence and smallest next action | Falsification / cost |
| --- | --- | --- |
| **EB01 — Retain controls; defer boundaries** | T1 is expressible through existing inclusive range and ECDF functions; prepared categories cover asymmetric tie rules. No named comparator failure is supplied. | Reopen only if a named recurring task cannot be completed accurately or within an agreed setup budget using those routes. Cost: continued preparation for specialized bands; benefit: avoids an unsupported saved-contract expansion. Confidence: high in deferral, conditional in workflow usability. |
| **EB02 — Prove current consistency independently** | `binRows` membership, bar-owned inclusive range construction and `applyFilter` predict a discriminating exact-edge case. Preserve local trust first, then compare bar count, trace contributors and linked IDs under the concrete fixture. | If all paths agree under the declared source and settings, withdraw the mismatch hypothesis. If they disagree, investigate a bounded repair separately from new controls. Cost: a focused source/runtime/browser proof and any evidenced regression coverage. Confidence: high in need for proof; no confirmed defect. |
| **EB03 — Conditional focused lesson and example** | Delivered bar/ECDF docs and example infrastructure exist. Ties, valid denominators and bar snapping can plausibly confuse a threshold task. | Add only an observed missing explanation, in the exact docs section and runnable example milestone specified in proof-plan.md. Reject if existing material already enables the task or if the lesson conceals a real mismatch. Cost: keeping one example and its expected rows aligned. Confidence: medium; educational benefit unobserved. |
| **EB04 — Named-task comparator gate** | R008 itself asks for reduced effort/errors versus existing methods. API parity supplies possible contracts but no local demand. | Reject a control if current tools or categories solve the task equally well; reopen only with repeated task evidence, measured benefit and coherent tie/selection/restore semantics. Cost: one bounded comparison, not a broad survey. Confidence: high in the gate; unknown which later option would win. |

## 7. Full authenticated packet inventory

Each row below matched both declared byte count and SHA-256. Links for baseline and historical entries use their own pinned commits. Local additions are identified as attachment content, not asserted to be committed repository files.

### 7.1 Baseline files — 30

| Path | Bytes | SHA-256 |
| --- | ---: | --- |
| [AGENTS.md](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/AGENTS.md) | 4,033 | `802990c1bacd76b4b867239da78fd011fb32653f891d4a88560e9ee629979a33` |
| [README.md](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/README.md) | 10,263 | `1f05b6c4992b07d1fc2b38d7bf9273db9e4a3a0d94513b7265e13b81cd7c5e28` |
| [package.json](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/package.json) | 1,258 | `f9b14daf225872f605d9435ddfb46fdede88b203c87a0e8507fe20743536f6e3` |
| [CODING_STANDARDS.md](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/CODING_STANDARDS.md) | 2,213 | `b4358fe75d063d53aea1edbc58d0dc6fd8df6e6165aa5792d8d2aa35eefe7ac5` |
| [docs/agent-guide.md](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/docs/agent-guide.md) | 19,779 | `0992949f205d1ae72a8249c69bccb33f1eb70763b14a526a6384a7a91f9c9f00` |
| [docs/ui-defaults.md](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/docs/ui-defaults.md) | 19,093 | `93ee25ebd3917a1e56d7db818ff4b6edcfe7e063f390ff9d5e9b83a0cc32f84a` |
| [docs/intent/population-baselines/intent-brief.md](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/docs/intent/population-baselines/intent-brief.md) | 3,508 | `9e4045b93ccb770fae6ea13988db3c25f78856ac6b80203574e0d2e81166d483` |
| [docs/intent/current-analysis-trust/intent-brief.md](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/docs/intent/current-analysis-trust/intent-brief.md) | 3,006 | `d6b2d620753c1ea532fffcb1cb43cc42711e03daa898e989a7f283f475186bd7` |
| [packages/explorEDA/src/components/charts/BarChart/bins.ts](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/BarChart/bins.ts) | 3,723 | `fb6428b2dd359f2f104666ea203c6a6d393415c89e9405709ad04ec1c34d3bcb` |
| [packages/explorEDA/src/components/charts/BarChart/bins.test.ts](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/BarChart/bins.test.ts) | 2,613 | `03e40d5f4d38c9ae3e118fb93f902e696a6c752ce8b5df2c2c2307665149a8fd` |
| [packages/explorEDA/src/components/charts/BarChart/barPlan.ts](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/BarChart/barPlan.ts) | 23,319 | `79933db557b72b3326342b1eb3e0667f4f2a1ce924093f17e3939f78e0399834` |
| [packages/explorEDA/src/components/charts/BarChart/barPlan.test.ts](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/BarChart/barPlan.test.ts) | 7,480 | `de17c61d954e1bdff69b07eb5447bbe0f2224f6e06aef2519139a29ff5bf5726` |
| [packages/explorEDA/src/components/charts/BarChart/BarChart.tsx](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/BarChart/BarChart.tsx) | 19,773 | `a4805c5391d3707a1c799e48dd2764b3ddec0ea2bf485bed3813619dedc186c7` |
| [packages/explorEDA/src/components/charts/BarChart/BarChart.select.test.tsx](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/BarChart/BarChart.select.test.tsx) | 3,600 | `17341d0a06854ed3fb5feef1c440617dbe4b738a5dfbb106e57aebd20f8a75a1` |
| [packages/explorEDA/src/components/charts/BarChart/definition.ts](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/BarChart/definition.ts) | 2,722 | `7567d38cf9a8b52d65cffa387a38e61cdab6a3c19f9c60302c4999899a62293e` |
| [packages/explorEDA/src/components/charts/BarChart/BarChartSettingsPanel.tsx](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/BarChart/BarChartSettingsPanel.tsx) | 15,063 | `cd9c1429b73ea42628c1c39ca2a76237e9475d8fc9ea37635ac0de669b0ce04c` |
| [packages/explorEDA/src/components/charts/BarChart/BarTraceBody.tsx](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/BarChart/BarTraceBody.tsx) | 6,280 | `ec6c8519e5f34921a05266864c921b0a69acc5341a630a4c2dde507782e4ccac` |
| [packages/explorEDA/src/hooks/applyFilter.ts](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/hooks/applyFilter.ts) | 1,974 | `d8f0610999aa93372bbbb29d9811d9106b71e1c40675b5bc3f3714ea5bbc3953` |
| [packages/explorEDA/src/hooks/applyFilter.test.ts](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/hooks/applyFilter.test.ts) | 2,513 | `d534a71213abbe95fd982f275a3dc0069aabb474f0653eb5ca158a9c1f89756e` |
| [packages/explorEDA/src/types/FilterTypes.ts](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/types/FilterTypes.ts) | 1,207 | `5779e19b22a73dbfc6c9c66b7d12f5b7cba149b5da7e1cfa1ed316afe3a9011f` |
| [packages/explorEDA/src/components/charts/useGetLiveData.tsx](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/useGetLiveData.tsx) | 2,222 | `6222156b36ba1d8accc05fd01888543a5bd4dc07b0673db01f74e27570a04478` |
| [packages/explorEDA/src/lib/chartPopulation.ts](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/chartPopulation.ts) | 1,425 | `3108817ced390197b9b90708d5ee76386c992470716d9326adbc12ce1d0bab86` |
| [packages/explorEDA/src/lib/valueParsing.ts](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/valueParsing.ts) | 10,226 | `18793ed3c9f09e3ac6c184fd658ad68b88f564c5c2d800bac7108188afd845d6` |
| [packages/explorEDA/src/providers/DataLayerProvider.tsx](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/providers/DataLayerProvider.tsx) | 55,689 | `c0ab7260c912fb628d393e7cbae1c752e44db4a20e347d9ec07f755b3ae7771d` |
| [packages/explorEDA/src/components/charts/Ecdf/ecdfPlan.ts](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/Ecdf/ecdfPlan.ts) | 14,306 | `3814a434bcec72e222f3b5dbc1c3f570a51bc7c73fc9e37754051121127af142` |
| [packages/explorEDA/src/components/charts/Ecdf/ecdfPlan.test.ts](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/Ecdf/ecdfPlan.test.ts) | 5,499 | `081459fc279711ea31b82a10b1d86d6ef617c9f3414538223e7ceee0a47daa24` |
| [packages/explorEDA/src/components/charts/Ecdf/definition.ts](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/Ecdf/definition.ts) | 2,036 | `ac5b154835778aec2ea727f618718134e6961b60e48d5d8441f124cf12ff7ce2` |
| [packages/explorEDA/src/components/charts/Ecdf/EcdfChart.tsx](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/Ecdf/EcdfChart.tsx) | 23,725 | `7c904c193448078c28f24261ead61690b88efba2f16156e73a8a9825f8ddb159` |
| [apps/demo/src/docs/pages/bar.mdx](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/src/docs/pages/bar.mdx) | 2,464 | `a78c8f1b5572944e0fdba332ad56b3942eaac9625dc12bc6658bc3fd5dab626d` |
| [apps/demo/src/docs/pages/ecdf.mdx](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/src/docs/pages/ecdf.mdx) | 583 | `409a22e4b066eb6f3277ba9ec997c1fef8b409b41f4a1137f8ad99b6250be040` |

### 7.2 Local additions — two

| Path | Bytes | SHA-256 |
| --- | ---: | --- |
| `docs/research/engineering-bins-2026-10-21/pro-prompt.md` | 9,112 | `146dd45c90dec8817f023db80d93826a86b0e7cd0e91d718fefa94203b77dc9a` |
| `docs/research/engineering-bins-2026-10-21/research-queue.md` | 2,828 | `bdfb4e2b31d96053d7ca8fa7c1d42794bf0a9a2ee87dde78898be82959034267` |

### 7.3 Historical files — two

| Path | Bytes | SHA-256 |
| --- | ---: | --- |
| [docs/intent/research-ideas-100/ideas/R008-engineering-bin-boundaries.md](https://github.com/byronwall/explorEDA/blob/476a1be3544f93baf7c4732a436163609fbbd02f/docs/intent/research-ideas-100/ideas/R008-engineering-bin-boundaries.md) | 3,162 | `f17f257c7a22f1c692f7be6a396cf28cba655425456dd4ec4cfcc3fbc2893125` |
| [docs/research/retention-observation-2026-10-21/research-queue.md](https://github.com/byronwall/explorEDA/blob/a915f6965055d1b69f9bccfaddf50e4b5986468a/docs/research/retention-observation-2026-10-21/research-queue.md) | 4,161 | `586ef86892c42d80be53d8bb30e0af91245bfb2534e02e07cff490d316213cf4` |

## 8. Supplementary pinned source inventory

These 13 files were retrieved through the authenticated GitHub connector: 12 at the baseline and the catalogue at historical ref `476a1be3544f93baf7c4732a436163609fbbd02f`. A returned Git blob SHA is Git's blob identity; the SHA-256 below was independently computed from the retrieved content. `bins.ts` is intentionally repeated here because it independently corroborates a packet entry. The remaining baseline supplementary files close source/restore/trace/example dependencies omitted from the selected packet. The historical catalogue checks only R008, R018, R043, R077, R073 and R011; it is not another broad survey.

| Pinned path | Bytes | SHA-256 |
| --- | ---: | --- |
| [packages/explorEDA/src/components/charts/useGetColumnData.tsx](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/useGetColumnData.tsx) | 1,765 | `03ad6ffe51073a3db4a95786f597c8b1833257c64d6fdbbc0b8d07a496f60f01` |
| [packages/explorEDA/src/hooks/CrossfilterWrapper.ts](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/hooks/CrossfilterWrapper.ts) | 6,855 | `444f228baffb694c82f7826da6a2eee88ce0296b47ec5e3f59c36b0d1070b483` |
| [packages/explorEDA/src/utils/saveDataUtils.ts](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/utils/saveDataUtils.ts) | 38,882 | `aad0e318e8453f09980ce6627c0dd7c4e314de4f220a78dc0fd52f90f468a4d8` |
| [packages/explorEDA/src/components/charts/BarChart/barTrace.ts](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/BarChart/barTrace.ts) | 1,725 | `7b19e7f433ffc0acf2ae57a4fc68359eafa4ce32b3aff45f0ed97cb9ef40b6e8` |
| [apps/demo/src/docs/live/examples.ts](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/src/docs/live/examples.ts) | 22,298 | `206e73137d436350ef5edbee610139a209f21f5786b1b7e5313a676becb5ee3f` |
| [apps/demo/src/demos/examples.ts](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/src/demos/examples.ts) | 56,494 | `b67518e290d939f719babdb5dc2723649701f8b60e4601f9a1d041b2aa8dfb93` |
| [packages/explorEDA/src/components/charts/BarChart/bins.ts](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/BarChart/bins.ts) | 3,723 | `fb6428b2dd359f2f104666ea203c6a6d393415c89e9405709ad04ec1c34d3bcb` |
| [packages/explorEDA/src/providers/lib/dataLayerState.ts](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/providers/lib/dataLayerState.ts) | 804 | `2469556f6e39537ff394ff4b242cd0da5aee866907568f0f2685e87525ec1569` |
| [packages/explorEDA/src/components/ChartSettingsContent.tsx](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/ChartSettingsContent.tsx) | 7,450 | `dacdd56f15a69bb9b94d683adc2f4669f29acabc7a9ec5a5fe7b1d249cd7d993` |
| [packages/explorEDA/src/components/charts/Ecdf/ecdfTrace.ts](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/Ecdf/ecdfTrace.ts) | 2,198 | `b7e1a14694202cf13984e0bbd6d22ce1a39d4fb923213dd8543622824a7e7b0e` |
| [packages/explorEDA/src/components/settings/FiltersSettingsTab.tsx](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/settings/FiltersSettingsTab.tsx) | 9,701 | `bb5eb95708e2a42ce97d46d432693d58ddc34bb0936479dffb3892ee8e460e20` |
| [packages/explorEDA/src/components/charts/DataTable/components/ColumnFilter.tsx](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/DataTable/components/ColumnFilter.tsx) | 16,961 | `41bd81c4ca5fc39a00ace5543e296b941e699d87463369b981400accace7a886` |
| [docs/intent/research-ideas-100/catalogue.md — historical ref 476a1be3544f93baf7c4732a436163609fbbd02f](https://github.com/byronwall/explorEDA/blob/476a1be3544f93baf7c4732a436163609fbbd02f/docs/intent/research-ideas-100/catalogue.md) | 23,594 | `b17ba05624aff799b2d998c0b779bfe73c7bcc0ef99ebd5bf93f011585b8f853` |

**[Source/access fact]** [PR463 metadata](https://github.com/byronwall/explorEDA/pull/463), retrieved 2026-10-21, identifies the same baseline and historical head. It was open and unmerged at retrieval, and describes research candidates rather than approved implementations or confirmed defects. Test results recounted by that PR are not results of this research run.

## 9. Limits that remain consequential

- **Demand remains unknown.** No named analyst, repeated operational task observation, or comparison timing was supplied. The fixture discriminates semantics; it cannot generate demand.
- **The source snapshot is not a runtime.** Peer filtering, own selection, trace inspection, restoration and replacement need the explicit proposed proofs. All application/test/browser checks remain UNRUN.
- **A source concern does not authorize a new control.** Any exact-edge disagreement, if reproduced, belongs to a separate repair decision. A global inclusive-range change has a broad compatibility cost and is not approved here.
- **External sources disagree by design.** No single comparator supplies an authoritative universal histogram contract. Requirements for endpoints, numeric precision, tails, empty bands and denominators must come from the task.
- **Refresh must name its entry point and identity rule.** “Replace source” is not enough to determine preserved settings, regenerated row IDs or selected membership. The proof plan explicitly treats these separately.
- **Documentation and examples are already delivered.** EB03 is an optional focused addition after evidence, paired in one milestone. PR463 remains a candidate catalogue; local trust and adjacent ownership stay in the revised queue.

**[Decision]** These limitations support retaining current behavior and deferral while authorizing no product work. Codex independently reviews, collects, reconciles, validates and opens a review PR under its assigned workflow. This research recommendation does not authorize product implementation.
