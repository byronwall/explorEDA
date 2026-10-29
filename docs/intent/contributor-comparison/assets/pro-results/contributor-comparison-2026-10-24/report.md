Build **Compare values**: an analyst pins the evidence behind one metric card or bar, traces a second value, and opens a temporary comparison showing **Shared, Left only, and Right only** input rows. Keep **In scope** separate from **Used in calculation**, retain the exact operation and captured filter context beside each value, and expose the recorded reasons for numeric exclusions. This adds a direct explanation workflow to explorEDA without changing chart math or filtering. Ship a complete row-grain version first, then add entity units and denominator-aware marks through explicit adapters. Byron's request establishes the need; external demand, participant studies, and a robustness audit are not prerequisites.

# Compare values: design report

**Baseline:** `95832bd473884aeae23453af0888b4ca5187820d`, named as `origin/main` in the supplied packet. **Mode:** Design. **Research date:** October 23, 2026, America/Indianapolis. The packet's filename uses the following UTC date.

## Access check — passed before research

The supplied packet is a complete UTF-8 snapshot of its declared **39 files**. Its inventory, opening file markers, and matching closing file markers agree exactly, in order, with no missing or duplicate block. The named baseline matches the mission. All 39 blocks were read across the source review. This establishes access to the **complete supplied packet**, not to every file in the Git repository or to a runnable checkout. No full-commit checkout or application execution is claimed.

The packet supplies the decisive inputs for the recommended first release: chart plans, contributor ledgers, trace ownership and entry points, data-layer mutation paths, project row mapping, representative tests, UI rules, and documentation. Files named only by the agent guide are distinguished from inspected implementation files below. The implementation plan avoids depending on an uninspected Rows-drawer override or workspace mark registry.

**Evidence labels used here:** **Fact** means inspected source or a cited primary source; **Inference** means a conclusion drawn from those facts; **Proposal** specifies behavior to build. Repository claims refer to the baseline above. Earlier R051/R043 semantics remain useful; their demand gates and “retain the current interface” conclusions do not govern this mission. `docs/research/DIRECTION.md`, “What Pro is for here,” explicitly supersedes that framing.

## 1. Ranked question 1 — the authoring and inspection workflow

### Decision: pin an exact trace, then compare in one temporary surface

**Proposal, D01–D03.** Combine two complementary ideas: use pinning to acquire the two exact values, and use a focused comparison surface to inspect their relationship. Do not make chart selection carry a second meaning.

| Workflow | What it does well | Decision and cost |
| --- | --- | --- |
| Pin one trace, then inspect another | Starts at the actual value being questioned; reuses Alt-click, Alt-Enter, and header trace browsing. | **Build.** A visible retained-pin summary is necessary because the analyst may scroll between charts. |
| Select two charts | Convenient when each chart happens to contain one value. | **Avoid as the general entry.** A bar chart, facet, or percent chart does not identify one value, and normal mark selection already affects filtering. A card-only shortcut can come later. |
| Open a blank comparison surface and choose both values there | Explicit left/right slots; good for distant charts, keyboard, and touch. | **Explore as an additional entry.** Use this focused presentation for the result now, but defer its global chart/mark picker. The existing per-chart target browser already supplies a complete M1 path. |

The strongest objection to pin-first is the hidden intermediate state. Address that directly: every open trace header shows the retained left label and either **1 value pinned** or **Resume comparison**. After pinning, return focus to the source trace trigger and announce the retained value. No permanently visible comparison tool is necessary for M1. The pair remains available from any surviving chart's existing trace control, including after closing the original chart's trace. M1 accepts lower discoverability while traces are closed; D12 retains a transient workspace launcher as a later option.

The strongest objection to a new comparison surface is that two ordinary row previews might suffice. Those previews reveal each set separately but do not compute its relationship to the other set. Exact shared/only partitions are the new capability. This is a design judgment, not a claim of measured usability improvement.

### What the selected external comparators actually establish

Only comparators that change the decision are included. None is a proposal to import another product's architecture.

| Primary source | Verified behavior or finding | Consequence for explorEDA |
| --- | --- | --- |
| Tableau **View Data** [E1] | Tabular underlying data is scoped by its opening context, including selected marks or the current view. | Capture one exact mark's population. Show full membership counts separately from the bounded rows currently displayed. |
| Tableau **Explain Data** [E2], [E3] | The Data Guide analyzes the selected context; the documentation says multiple marks cannot be selected for comparison with one another. Statistical explanations do not establish causality. | Borrow mark-centered entry and progressive detail. Provide the missing explicit pair comparison; describe supported findings as evidenced differences. |
| Power BI **drillthrough** [E4] | A summary leads to an authored detail page filtered to the selected context, with a return path. | Preserve the originating value and context during evidence navigation. A reusable temporary inspector avoids authoring a separate detail page for each comparison. |
| Power BI **visual interactions** [E5] | Visuals ordinarily cross-filter or cross-highlight other visuals; authors can alter interactions. | Acquisition must use inspection gestures. Ordinary select-two interaction could alter the numbers before they are compared. |
| Mosaic **Selection** [E6] | Selection resolution produces client-specific predicates; cross-filtering can omit a receiving client's own clauses. | Different chart populations are legitimate. Capture each producer's actual scope rather than normalizing both sides to global membership. |
| Gleicher et al., **Visual Comparison for Information Visualization** [E7] | Juxtaposition, superposition, and explicit relationship encodings are complementary comparison strategies. | Pair the value descriptions, then explicitly encode shared/only membership. The taxonomy informs this choice; it does not validate this specific UI. |
| Psallidas and Wu, **Provenance for Interactive Visualizations** [E8] | Record tracing and the forward operations used for highlighting or recomputation can be separated. | Retrieve record evidence without propagating a chart selection. Reuse current trace evidence rather than introduce a general provenance engine. |

### Authoring: existing charts are enough

**Proposal.** An author creates ordinary metric cards or bars with current settings. No comparison chart type, new saved setting, pair definition, query, or dashboard-text syntax is required. The example dashboard deliberately puts a West metric beside a Web-restricted regional bar so its difference is meaningful. Inspection is available to the analyst without editing that dashboard.

M1 compares the main metric total or the foreground bar value. A metric's smaller all-rows comparison line, a faint count reference bar, an axis guide, and a stack endpoint are not interchangeable values. They do not become targets implicitly.

### Complete analyst journey

1. **Enter from a real value.** Alt-click the metric card or bar, or focus it and press Alt-Enter. Touch users and keyboard users can open **Trace chart objects** in the chart header and activate the matching object in the existing browser. Those gestures already exist for the chosen card and bar paths. A plain bar click and plain Enter/Space retain selection behavior; the current MetricCard plain click is inert.
2. **Pin left.** The trace's first action row offers **Pin for comparison**. Capture the value and evidence, close that local trace, restore focus to its trace trigger, and announce the chart/mark name. The captured left value remains available from trace headers.
3. **Choose right.** Inspect another value through the same routes. Opening that trace closes any active comparison/trace host in the comparison session while retaining both snapshots; this must work for keyboard and programmatic entry as well as pointer entry. Its current trace remains readable. An explicit **Compare with [left value]** action commits the right capture. An unsupported candidate names the unavailable evidence type and leaves the retained pin intact.
4. **Inspect the pair.** Switch the same `ChartTraceControl` popover to a comparison body. Its first line contains **Compare values**, **Choose another value**, **Clear**, and **Close**. Paired descriptions identify chart, mark, operation, field, input-row unit, capture context, and value state.
5. **Choose a basis and partition.** Default to **Used in calculation**. Keep **In scope** next to it and visible even when the counts coincide. Under the active basis show **Shared**, **Left only**, and **Right only**, each with an exact count. Select the first nonempty “only” partition initially; otherwise select Shared. Always show all three counts.
6. **Reach exact records.** One paged table shows runtime row ID, selected descriptive fields, and separate left/right status and input details. At most 100 rows are rendered per page; page controls and a labeled search can reach every member. Changing the basis or partition does not alter either chart.
7. **Replace deliberately.** Inspecting a third value offers **Replace left** and **Replace right**, each naming the old value. The old pair survives until the chosen replacement succeeds. **Choose another value** dismisses the comparison and retains the pair; it does not arm a hidden “next click” mode. Swap sides is deferred so M1 has one fixed action set.
8. **Dismiss or clear.** Escape, outside dismissal, or Close hides the surface while retaining the pair. Clear releases both captures. A nested column picker consumes Escape first. Closing returns focus to the originating trace trigger, or a surviving trace trigger if that chart was removed.

The comparison is a transient mode of the existing trace popover, not a second right-edge panel. Its table stays inside that one surface. M1 does not open Rows alongside it. Later navigation into Rows or a project host panel must close the popover and use the existing one-panel replacement rule. This respects `docs/ui-defaults.md`, “Popovers and dialogs” and “Scope and layout,” without assuming an undisclosed Rows API.

**Repository facts:** `MetricCard.tsx` handles Alt-click/Alt-Enter on its focusable card; `BarChart.tsx`, `SingleBarChart`, separates Alt inspection from category selection on its focusable marks. `ChartTracePanel.tsx`, `ChartTracePanel`, supplies row finding and object browsing. `ChartTraceControl.tsx`, `useCloseTrace`, supplies explicit dismissal for navigation.

### Pointer, keyboard, and responsive behavior

- **1280 px:** allow paired headings side by side and a comparison popover up to 48rem wide, bounded by the viewport. Keep table scrolling inside the surface and actions fixed at its top.
- **783 px:** constrain the surface to the available width and height; headings may stack. A chart grid reflow must not discard the pair or move the chart layout in saved state.
- **390 px:** use the available width with a 12px viewport margin. Stack value headings, retain compact one-line scrolling tabs, and provide the header object browser so both charts need not be visible simultaneously. Touch does not depend on hover or Alt.
- **Keyboard:** Tab reaches action buttons before long evidence; arrow keys move within the basis/partition tab lists; Enter/Space activate the chosen control. Alt-Enter on supported marks opens their trace. Escape dismisses the active nested layer first. Announcements name the pinned/replaced side and partition count.
- **No analytical side effects:** pin, compare, replace, page, search, change columns, dismiss, and clear comparison never call chart filter setters, workspace filter setters, Rows settings setters, or `onStateChange`.

These are proposed acceptance requirements, not browser results from this research run.

## 2. Ranked question 2 — what is comparable, and what explains a value?

### Five things that must stay separate

Let `S` be one captured value's in-scope input-row IDs and `I` its included IDs. For the row-grain M1 producers, `I` is a subset of `S`. The comparison partitions either basis explicitly:

`Shared = L ∩ R`, `Left only = L − R`, `Right only = R − L`.

| Concept | Exact meaning | Required interpretation |
| --- | --- | --- |
| Scope members | Every input occurrence represented in that value's contributor ledger, before numeric eligibility. | A null amount can belong to the mark's scope. Scope does not mean “added to the total.” |
| Numerically included rows | Ledger entries with `included === true` for the selected row-grain reduction. | Count and sum can use different subsets of the same scope. Zero is included when valid. |
| Repeated entity witnesses | Additional input rows representing an entity whose value is already counted once. | They are evidence, not extra units and not generic invalid measures. |
| Distinct entities | Typed values of the declared entity field, with their full witness groups. | Compare entity keys, not the runtime IDs of whichever representative happened to be first. |
| Aggregate or query output grain | One row supplied to the workspace may already be a query group, joined occurrence, or other derived result. | “Input rows” identifies what is actually compared; it must not imply original orders or source-table rows. |

**Facts.** `lib/aggregates.ts`, `summarizeGroup`, retains all supplied inputs in `contributors`, including invalid values, missing entity IDs, repeated witnesses, and conflicts. `MetricCardPlan.rowCount` is reducer-unit count, not universally contributor-array length; `excludedCount` omits repeated witnesses. `traceRows.ts`, `traceRowIds`, simply maps contributor IDs for supported aggregate traces and therefore includes excluded rows. It supports only some `ChartTrace` kinds. It is a navigation helper, not the comparison contract.

### Smallest supported M1 contract

**Proposal, D04.** Compare two captures in the **same workspace instance, input relation, and prepared-data epoch**. Runtime `__ID` identifies an input occurrence only within that boundary. Keep duplicate business IDs as separate rows.

Supported values:

- MetricCard `metric-card:total`, with no `entityField`, using count, sum, or average.
- A foreground categorical `bar` from `SingleBarChart`, using category count or a native named aggregate with count, sum, or average and no entity field.
- Both chart sources must be unfaceted for M1. Exclude series, stacks, percent layouts, bins, external/injected `aggregateResult`, and any producer that cannot establish that contributor IDs address the current workspace relation.
- An empty card and a retained zero category-count bar are valid evidence targets. A missing aggregate group or an invalid group in `plan.unplotted` has no drawn bar target; do not invent one.
- In a project, the same current `AnalysisChartContext.resultRows` relation can be compared as **query output rows**. An absent context permits ordinary **workspace input rows**, not a claim of raw-source grain.

The discriminant `kind: "bar"` alone is insufficient. The capture adapter must inspect the real plan and settings, including resolved aggregate spec and whether the `aggregateResult` prop supplied external evidence. Reject unsupported shapes explicitly while retaining the ordinary trace.

### Metadata is part of the evidence

Each capture holds:

- A workspace-instance token, a volatile prepared-data epoch, and an optional current query-output relation identity.
- Chart ID/title, exact trace owner/target locator for display and return, and a typed category descriptor when present.
- Operation and field identity; row or entity unit; displayed value, numeric value, and producer value state.
- The full contributor ledger: runtime input ID, prepared input, raw input when supplied, included flag, and recorded exclusion reason.
- Applicable workspace/peer filters, own-selection treatment, local restrictions, and mark grouping. Capture these as structured facts, not only a prose `scopeNote`.
- Capture time/sequence, actual producer revision, captured formatting definitions, and semantic settings needed to recognize a changed context.

Do not recover this metadata by parsing labels. `BarTrace.aggregation` is display text; `MetricCardPlan.entityLabel` is a label. The producer closures already have the real `AggregateSpec` or settings and must provide them.

### How different operations should read

| Compared values | User-facing reading | Numeric treatment |
| --- | --- | --- |
| Count vs count, same input-row unit | Which rows each counted, including otherwise invalid measures. | A signed count difference is meaningful when both values are available. |
| Sum vs sum, same measure and prepared-data epoch | Which included rows differ, with each side's input values. | Show `left − right`. An additive record explanation requires equal effective inputs on shared rows. |
| Average vs average, same measure | Each average, included-input count, and the underlying captured inputs. | A labeled average difference is permitted. Never equate set difference with an average decomposition. |
| Count vs sum; sum vs average | Both explicitly named operations and units. | No combined numeric delta. Membership remains comparable. |
| Different measures | Both field names and both captured inputs, even if membership is identical. | No cross-measure delta inferred from matching currency or number formatting. |
| Row vs entity unit | Different counting units; later show scope witnesses separately from entity membership. | No representative-row arithmetic masquerading as entity arithmetic. |
| Percentage or stacked part | A part, denominator, and possibly stack baseline are distinct dependencies. | Defer until the adapter exposes all of them. Numerator-only rows cannot explain a displayed percentage. |
| Empty, invalid, or nonfinite result | Preserve the producer's displayed state and evidence. | Suppress numeric delta/decomposition; never turn absence or invalidity into zero. |

For averages, the included count is the denominator; it is not all in-scope rows. M1 can expose a numerator using the existing `reduceNumbers("sum", ...)` over the already included prepared inputs if it is useful, but the displayed result remains the captured producer result. It must not recompute charts or define another reducer. The simplest first display is the captured average plus “3 included input rows” and the exact inputs.

For compatible ordinary sums, the mathematical relationship is:

`valueLeft − valueRight = sum(left-only inputs) − sum(right-only inputs)`

only when the shared inputs are identical and both operations use the same measure and unit. More generally there is also a shared-input-change term. The M1 epoch and producer restrictions eliminate that term for the native same-field case. M1 need not ship a decomposition visualization: a labeled value delta and exact partitions suffice. A future numeric breakdown must use the existing reducer and preserve floating-point behavior rather than demand exact decimal equality.

### Equal sets and equal totals are both insufficient

The eight-row fixture in the plan gives four different readings:

| Comparison | Exact result | Explanation supported by the evidence |
| --- | --- | --- |
| West sum vs West/Web bar sum | `40` vs `30`; included sets `{0,1,2}` and `{0,2}`. | Input `1`, amount `10`, appears only on the left. The right chart has a Web restriction; that row is Store. |
| West/Web vs East/Web sums | `30` vs `30`; included sets `{0,2}` and `{4,6,7}`. | Equal totals with no shared inputs. Valid zeros in the East set remain included. |
| West sum vs West average | `40` vs `40/3`; both include `{0,1,2}`. | Same inputs, different reduction; the average has denominator `3`. |
| West amount sum vs West cost sum | `40` vs `9`; both include `{0,1,2}`. | Same membership, different measures and values. A generic difference of `31` would conceal that distinction. |

### Confirmed reasons versus evidenced differences

**Proposal, D05.** The surface leads with **Differences in the evidence**, not an automatic causal story.

- **Confirmed calculation reason:** preserve a producer's recorded “Missing value,” conversion failure, or later typed entity status. It explains that ledger entry's role in this calculation.
- **Confirmed predicate mismatch:** a row's captured effective field value can be tested against a captured local restriction using the existing predicate implementation. “Store does not satisfy right chart's Channel = Web restriction” is supported. This does not establish that removing that restriction alone would include the row.
- **Observed context difference:** “Right has a Web restriction”; “Left and right were captured under different workspace filters”; “Right averages amount.” These are facts about the two captures.
- **Unknown exclusion path:** outside-scope membership alone does not identify the owner or operator that removed a row. Say “Outside this value's scope,” show available context, and leave the specific path unassigned.

M1 does not need a universal predicate evaluator or a per-row causal ranking. It may show the captured local restriction and row value side by side, while reserving affirmative “fails restriction” wording for a tested predicate. Where several restrictions fail, name the observed failures without inventing one primary cause.

Buneman, Khanna, and Tan distinguish evidence for an output's existence from source locations of its values [E9]. Chapman and Jagadish's why-not model identifies an excluding operation by tracing what entered and failed to survive that operation [E10]. **Inference:** a set subtraction provides useful evidence but cannot, by itself, supply a complete upstream why-not explanation. The first release should make this boundary legible while still giving the analyst exact records.

## 3. Ranked question 3 — captured evidence and change

### Choose frozen captures with explicit invalidation

| Model | Benefit | Decision |
| --- | --- | --- |
| Live handles resolved against current chart plans | Always describe the current chart when the target still exists. | **Defer.** The baseline can move while the analyst navigates, disappearing marks need policy, and all needed sources would have to remain resolvable across panel lifetimes. |
| Full durable data snapshots | Can survive refresh and reproduce old records independently. | **Defer.** Requires storage, retention, and identity decisions beyond a temporary inspection feature. |
| Frozen evidence within one prepared-data epoch | Preserves the observed discrepancy; keeps only two ledgers and reads exact rows while their input relation remains valid. | **Build.** Clear on data/preparation change; label captures when filters or chart semantics have since changed. |

“Frozen” means value, ledger, labels, formatting, and context do not silently change. It does not mean a saved historical dataset. Old and new captures can intentionally use different filters or reductions within the same prepared-data epoch; their different contexts remain visible.

### Lifecycle policy

| Change | What survives or clears | What the analyst sees |
| --- | --- | --- |
| Another chart's selection, workspace filter, own selection, or clear-all | Keep both snapshots; current charts continue updating normally. | “Captured under earlier filters” where the captured applicable filter context differs. No automatic refresh. |
| Local restriction, measure, operation, entity setting, or named aggregate definition changes | Keep the old evidence within the epoch; mark that source's semantic settings changed. | Captured operation and value remain visible; “Chart settings changed — inspect again to replace.” |
| Title, layout, colors, axes, or number formatting changes | Keep captures and captured display metadata. | No numerical-staleness warning solely for cosmetic edits; source navigation uses current chart identity. |
| New input array, including same rows reordered or cloned; field type/null-token/date conversion change; real saved-state restore | Clear both sides and pending evidence work. | “Comparison cleared because the data or prepared values changed. Trace the values again.” Never align old and new `__ID`s. |
| Calculation add/edit/remove or rerun, including a rerun of the same expression | Clear both sides conservatively. | Same clear notice. An unchanged expression does not guarantee unchanged computed values. |
| A captured chart is deleted or replaced with another chart type | Clear the pair; unrelated chart deletion does not clear it. | “Comparison cleared because a source chart was removed or replaced.” This also resolves loss of the last available trace host. Retaining deleted-source evidence is deferred. |
| Panel unmounted for details, reflow, or tab visibility | Retain the pair; close an unmounted anchor. | Resume from another/current trace header. A panel unmount is not proof that a chart was deleted. |
| Query-output relation changes | Reject old relation mappings and clear before rendering or acting on them; a normal data replacement also changes the epoch. | The same retrace notice; never navigate using old result keys. |
| Workspace unmount, reload, or explicit Clear comparison | Release both captures and all retained row references. | No restored comparison. |
| Controlled host echoes its unchanged saved settings | Preserve the pair when the existing fingerprint check skips restore. | No extra clear notice or history entry. |

**Facts.** `ChartTraceScope` owns a panel-local `sources` map and stores `{owner, kind, id, revision}`. It re-resolves current traces and clears stale selection. `ChartTraceControl` opens when a selection arrives; selection clearing is not itself a guarantee that the popover closes. `useTraceRevision` combines `nonce` with a chart live-item nonce. `DataLayerProvider` uses those nonces for multiple kinds of changes, including field formatting and named aggregates. They are useful capture guards but too broad to define input identity.

**Proposal, D06.** Add one internal `comparisonEpoch` to the data layer. Advance it in the same state mutations that replace or reinterpret prepared rows: `setData`, the type-changing branch of `updateFieldSettings`, `restoreAnalysisFromStructure`, and the first observable commit of `refreshCalculations`, where calculations and the calculated-column cache change. Keep it out of `saveToStructure`. Actions must synchronously compare the capture epoch with the current store epoch; a cleanup effect alone leaves a stale-ID window. The exact mutation and UI checks are specified in the plan.

## 4. Ranked question 4 — reuse and integration

### Keep the chart-local registry local

**Proposal, D07.** Add a plain React comparison provider holding at most two immutable captured values and one active comparison host. Nest it under `DataLayerContext.Provider`. Pass its current epoch and a synchronous epoch reader from the data-layer wrapper so the new provider need not import the data-layer module.

Extend `TraceSource` with an optional, lazy capture capability. MetricCard and SingleBarChart implement it using their **existing plan and settings closures**. `ChartTraceScope` exposes a guarded action to capture its current selection. It does not export its registry, retain other charts' plans, or become a workspace-wide target catalogue.

The selected source should first verify its stored base nonce/live-item nonce against the current store and its selection against the currently registered source. It then copies the producer ledger and metadata. If state advanced before the source updated, refuse the capture and offer retracing; do not combine an old plan with new context metadata.

| Integration point | Existing fact | Proposed use |
| --- | --- | --- |
| `traceTypes.ts` — `TraceSource` | A source resolves chart-local targets. | Optional capture capability with a structured supported/unsupported result. |
| `ChartTraceScope.tsx` — `ChartTraceScope` | Owns local source registration and revision checks. | Guard and delegate capture of the currently inspected target. Keep normal trace invalidation unchanged. |
| `MetricCard.tsx` / `metricCardPlan.ts` | The card and trace share one plan, including contributors and value state. | Copy that plan's value/ledger and real settings; do not call another aggregate to reconstruct the card. |
| `BarChart.tsx` — `SingleBarChart` | Resolves native aggregates with `getAggregateResult(id, liveIds)` and passes that result to the plan. | Copy the selected mark's `row` plus the actual aggregate spec. Capture foreground scope, not domain/reference contributors. |
| `ChartTracePanel.tsx` and `ChartTraceControl.tsx` | Existing actions, browser, close context, and bounded popover. | Add Pin/Compare/Replace/Resume and one comparison content mode. |
| `ChartDataPreview.tsx` | Contains a small table presentation coupled to live chart/global aggregate reads. | Extract/reuse its presentational table only. Supply explicit captured IDs and cells to the comparison's paging wrapper. |
| `AnalysisChartContext.tsx` and `QueryRowsLink` | Optional project context maps runtime IDs to result-row keys. | Navigate exact selected partition rows only after epoch/relation checks and complete key mapping. |
| `DataLayerProvider.tsx` | Owns data and preparation mutations, save/restore, and host callbacks. | Add volatile epoch and provider composition; leave saved state and filtering behavior unchanged. |

### Preserve the producer's population

`CrossfilterWrapper.getAllData` reads chart groups and applies local population restrictions. `useGetLiveIds` uses the chart's peer-context membership and optional facet IDs. `getChartFilteredRowIds` starts with globally filtered IDs and then applies a chart's local restriction. MetricCard uses the latter; SingleBarChart uses the former and supplies those IDs explicitly to a named aggregate.

These are intentional producer boundaries, not values to reconcile. The default branch of `getAggregateResult(id)` uses global IDs **only when explicit IDs are omitted**. `ChartDataPreview` currently calls that default for named aggregates. Consequently the comparison must not obtain its evidence by asking that preview to re-query a chart. The stale global-scope wording in `bar.mdx` should be corrected where the new comparison documentation explains this specific path; no general audit is required.

A chart's own selected category, its peer context, local restrictions, global linked membership, numeric eligibility, and Rows search can all name different sets. Scope metadata should say which rules were applied or omitted. It must not display current `WorkspaceFilterNote` text as though it were the captured filter context.

### Exact evidence with bounded display

**Proposal, D08.** Capture only on explicit pin/compare/replace. Copy scalar ledger entries and lightweight descriptors for those two values. Preserve same-epoch prepared-data references and lazily obtain additional columns; do not clone every field of every row for every chart.

- Partition the complete ID sets with linear set operations. A preview limit never becomes a membership limit.
- Render at most 100 rows per page and clearly show “1–100 of N input rows.” Empty partitions read “No input rows in this partition,” not a missing-data error.
- Search filters only the evidence table's presentation. Show its match count separately from the partition count; do not inherit Rows filters/search or data-table search.
- Do not expose filter, selection, or context-menu filter actions in this read-only evidence table. Cell copying and local paging/search are separate from analytical filtering.
- An explicit row-ID lookup can reach an off-page member. Do not make the analyst repeatedly page to locate known evidence.
- Choose a few default fields: runtime ID, record label if available, grouping fields, compared measure inputs, and left/right inclusion status. A compact Columns picker adds fields; it must not create global settings.
- On a large set, show preparation progress and allow cancellation. Keep the old pair until a replacement is complete, and recheck the epoch before committing asynchronous work. Yield between chunks if needed; no worker framework is required for M1.
- Use captured formatting and prepared inputs. A format change must not silently relabel the historical value, and a preparation change clears the capture before current columns can be read under old IDs.

### Project query navigation

**Fact.** `QueryRowsLink` currently derives runtime IDs using `traceRowIds`, maps them through `analysis.resultRows[id]?.key`, deduplicates keys, closes the trace, and invokes `onOpenQueryFlow`. Plain workspaces have no analysis provider.

**Proposal, D09.** For a comparison partition, map exactly that basis and partition's IDs, not the whole trace's IDs. Capture or resolve keys within the same query-output relation. Require a mapping for every selected input row before offering one complete query-flow action. Missing mappings disable that action with a factual explanation; they do not silently shrink the request. An empty partition does not invoke the callback with an empty list. If multiple input IDs map to one result key, label both counts rather than suggesting the units are identical.

Close the comparison before invoking the current callback. Keep the pair only while its relation/epoch remains valid. Navigation may reveal upstream source evidence through existing project facilities; it does not expand the comparison to original records or authorize cross-query matching. The same contract works without a project by showing the exact local evidence table and omitting query navigation.

### Saved state, syntax, export, and history

No saved schema, JSON settings, dashboard-text syntax, or history model change is needed. The pair is not a chart and is not serialized. Inspection does not call `updateChart` or `onStateChange`. Existing chart exports remain the charts as drawn; comparison-only UI is omitted with the existing `data-export="omit"` convention where applicable. A new comparison export or persistent history is **deferred**, not smuggled into M1 through saved settings.

## 5. Ranked question 5 — stages that each deliver a usable capability

The companion plan defines exact files, types, fixture data, behavioral checks, documentation, example registration, and pnpm commands. The sequence is implementation work, not a sequence of studies.

| Milestone | Independently useful result | Main risk |
| --- | --- | --- |
| **M1 — Compare native row-grain values** | Complete pin/compare/replace/resume workflow for supported cards and bars; both bases, exact paged evidence, frozen lifecycle, optional same-result query navigation. | Capturing a ledger from one render with metadata from another, or accidentally routing evidence through global filtering. |
| **M2 — Compare entity units and their witnesses** | Entity membership by typed ID, separate repeated witnesses, missing IDs, and conflicts; row/entity comparisons state their unequal units. | Treating an order-dependent representative as the entity or changing current conflict policy. |
| **M3 — Explain parts and denominators** | Explicit adapters for selected series/faceted/percent cases, with separate numerator and denominator evidence and baseline meaning. | Presenting a numerator set as a complete explanation of a percentage or stack position. |

Each milestone includes updates to `apps/demo/src/docs/pages/compare-values.mdx`, related trace/chart docs, and a runnable example in the same change. M1 includes `/examples/compare-values` and its live docs example; later milestones add focused variants to it. Docs-registration files identified by the guide must be inspected before editing, but no undisclosed behavior from them is assumed here.

### The fixture is an acceptance specification

The plan contains eight native input rows, with explicit numeric field settings and no fabricated production identity scheme. It specifies exact scopes, included IDs, repeated entity witnesses, all expected values, and these required scenarios:

- Local restriction: West metric `40` versus West/Web bar `30`.
- Invalid measures: missing row `3` and unparseable row `5`; count includes them, numeric reductions do not.
- Duplicate business IDs: rows `0` and `1` both have `orderId = O1`, but remain separate input rows in M1.
- Equal totals/different sets and identical sets/different reductions or measures.
- Empty, invalid-only, valid-zero, removed-chart, and unsupported-target states.
- A setting change from sum to average and a new data array changing one amount, yielding West `45`, West/Web `35`, all `75`.
- A source-order reversal, demonstrating that runtime IDs and the chosen entity representative can change while totals stay the same.
- A linked-selection/local-restriction discrepancy and a conflicting workspace filter, plus a Rows search that must not narrow captured evidence.

The arithmetic and set partitions were independently enumerated in scratch checks. That does not substitute for the proposed mounted-producer and browser acceptance tests.

## 6. Stable recommendations

| ID / classification | Recommendation | Reason |
| --- | --- | --- |
| **D01 · Build** | Pin one exact trace, then explicitly compare a second. | Acquires the actual values without reusing analytical selection. |
| **D02 · Build** | One temporary comparison mode in the existing trace popover. | Fits current compact inspection and avoids an unneeded permanent panel. |
| **D03 · Build** | Explicit replacement, retained dismissal, resume, and clear. | Preserves the baseline and makes evidence lifetime intentional. |
| **D04 · Build** | Row-grain M1 with separate scope/included bases and strict producer capabilities. | Delivers useful exact evidence without pretending every trace has the same meaning. |
| **D05 · Build** | Evidenced differences plus supported exclusion reasons. | Explains what is known without inventing causality. |
| **D06 · Build** | Frozen captures, volatile epoch invalidation, and synchronous guards. | Protects the observed discrepancy without treating runtime IDs as durable. |
| **D07 · Build** | Lazy local-source adapters and a two-slot React provider. | Reuses plans without lifting a global trace registry or adding an engine. |
| **D08 · Build** | Exact full-set partitioning and a paged, locally searched evidence table. | Large sets remain exact while rendering stays bounded. |
| **D09 · Build** | Same-result project navigation with complete mapping checks. | Extends existing evidence navigation without inferring upstream identity. |
| **D10 · Build, M2** | Entity-key comparison with all witnesses and unchanged conflict policy. | Entity overlap cannot be recovered from representative row IDs. |
| **D11 · Build, M3** | Separate part, denominator, and baseline evidence for supported ratios/stacks. | A displayed fraction or position has more dependencies than its numerator. |
| **D12 · Explore** | A blank two-slot launcher and chart/target picker. | Could improve discovery across distant charts after the core path exists. |
| **D13 · Defer** | Card-only two-chart shortcut, broader trace adapters, and a full Rows evidence mode. | Useful extensions, but not prerequisites for M1's exact record access. |
| **D14 · Defer** | Live comparison handles, persistence, comparison export, cross-refresh matching, deleted-source retention, and Swap sides. | These extend lifecycle or interaction scope beyond the complete first workflow. |
| **D15 · Avoid** | Armed next-click capture, general chart multiselect, mark Inspect buttons, permanent sidebar. | These conflict with exact value selection or established interaction rules. |
| **D16 · Avoid** | A second aggregation engine, universal provenance graph, filter normalization, or reducer repair. | The feature should explain current computations, not change them to agree. |
| **D17 · Avoid** | Outside-demand gates, required participant studies, or audit substitution. | The mission and current research direction already authorize feature design. |

## 7. External sources

These are primary documentation or author/institution-hosted papers, opened during this run. Product documentation is current at retrieval. The recommendations above are proposals and inferences, not product claims made by those sources.

- **E1. Tableau, View Underlying Data.** Scope and bounded tabular evidence. <https://help.tableau.com/current/pro/desktop/en-us/inspectdata_viewdata.htm>
- **E2. Tableau, Get Started with Explain Data.** Selected-mark entry and inability to compare multiple selected marks with each other. <https://help.tableau.com/current/pro/desktop/en-us/explain_data_basics.htm>
- **E3. Tableau, How Explain Data Works.** Statistical relationships and causal limits. <https://help.tableau.com/current/pro/desktop/en-us/explain_data_explained.htm>
- **E4. Microsoft, Drillthrough in Power BI reports.** Context-preserving detail navigation and return. <https://learn.microsoft.com/en-us/power-bi/create-reports/desktop-drillthrough>
- **E5. Microsoft, Change how visuals interact in a Power BI report.** Cross-filter/highlight behavior. <https://learn.microsoft.com/en-us/power-bi/create-reports/service-reports-visual-interactions>
- **E6. University of Washington Interactive Data Lab, Mosaic Selection API.** Client-specific predicate resolution and cross-filtering. <https://idl.uw.edu/mosaic/api/core/selection.html>
- **E7. Gleicher, Albers, Walker, Jusufi, Hansen, and Roberts (2011), Visual Comparison for Information Visualization.** Author preprint, especially the comparison taxonomy. <https://graphics.cs.wisc.edu/Papers/2011/GAWJHR11/paper.pdf>
- **E8. Psallidas and Wu (2018), Provenance for Interactive Visualizations.** Sections 2–3, tracing and interaction. <https://arxiv.org/html/1805.02622v1>
- **E9. Buneman, Khanna, and Tan (2001), Why and Where: A Characterization of Data Provenance.** Introduction and distinctions between forms of provenance. <https://www.pure.ed.ac.uk/ws/portalfiles/portal/16509989/Why_and_Where_A_Characterization_of_Data_Provenance.pdf>
- **E10. Chapman and Jagadish (2009), Why Not?** Section 3, operation-level exclusion evidence. <https://dbgroup.eecs.umich.edu/files/ChapmanSIGMOD09.pdf>

[E1]: https://help.tableau.com/current/pro/desktop/en-us/inspectdata_viewdata.htm
[E2]: https://help.tableau.com/current/pro/desktop/en-us/explain_data_basics.htm
[E3]: https://help.tableau.com/current/pro/desktop/en-us/explain_data_explained.htm
[E4]: https://learn.microsoft.com/en-us/power-bi/create-reports/desktop-drillthrough
[E5]: https://learn.microsoft.com/en-us/power-bi/create-reports/service-reports-visual-interactions
[E6]: https://idl.uw.edu/mosaic/api/core/selection.html
[E7]: https://graphics.cs.wisc.edu/Papers/2011/GAWJHR11/paper.pdf
[E8]: https://arxiv.org/html/1805.02622v1
[E9]: https://www.pure.ed.ac.uk/ws/portalfiles/portal/16509989/Why_and_Where_A_Characterization_of_Data_Provenance.pdf
[E10]: https://dbgroup.eecs.umich.edu/files/ChapmanSIGMOD09.pdf

## 8. Handoff: access, files read, checks, downloads, and open questions

### Access status

**Complete supplied snapshot: confirmed, 39/39 file blocks.** Full repository checkout: not acquired or claimed. No decisive source is missing for the chosen M1. Broader adapters and a full Rows-drawer handoff require reading their owning files during those later implementation tasks. Repository source was not changed.

### Files read

The following are complete packet files read across the review, not partial search snippets. Paths below the `packages/explorEDA/src/` heading are relative to that directory.

**Project rules and research — 10 files**

- `AGENTS.md`
- `README.md`
- `CODING_STANDARDS.md`
- `docs/agent-guide.md`
- `docs/ui-defaults.md`
- `docs/research/DIRECTION.md`
- `docs/intent/research-ideas-100/ideas/R056-contributor-set-comparison.md`
- `docs/research/filter-ownership-2026-10-22/summary.md`
- `docs/research/filter-ownership-2026-10-22/evidence/oracle.json`
- `docs/research/entity-grain-2026-10-21/README.md`

**Library source — 24 files under `packages/explorEDA/src/`**

- `components/charts/trace/traceTypes.ts`
- `components/charts/trace/traceRows.ts`
- `components/charts/trace/ChartTraceScope.tsx`
- `components/charts/trace/ChartTraceScope.test.tsx`
- `components/charts/trace/ChartTracePanel.tsx`
- `components/charts/ChartTraceControl.tsx`
- `lib/aggregates.ts`
- `lib/aggregates.test.ts`
- `lib/chartPopulation.ts`
- `lib/valueParsing.ts`
- `hooks/CrossfilterWrapper.ts`
- `components/charts/useGetLiveData.tsx`
- `providers/DataLayerProvider.tsx`
- `components/charts/MetricCard/metricCardPlan.ts`
- `components/charts/MetricCard/metricCardTrace.ts`
- `components/charts/MetricCard/MetricCard.tsx`
- `components/charts/MetricCard/MetricCard.test.tsx`
- `components/charts/BarChart/barPlan.ts`
- `components/charts/BarChart/barTrace.ts`
- `components/charts/BarChart/BarChart.tsx`
- `components/charts/BarChart/barPlan.test.ts`
- `components/ChartDataPreview.tsx`
- `components/AnalysisChartContext.tsx`
- `types/ChartTypes.ts`

**Docs and runnable-example source — 5 files**

- `apps/demo/src/docs/pages/trace.mdx`
- `apps/demo/src/docs/pages/filters.mdx`
- `apps/demo/src/docs/pages/metric-card.mdx`
- `apps/demo/src/docs/pages/bar.mdx`
- `apps/demo/src/demos/analyses/shop.ts`

### Checks versus proposals

- **Checked:** packet completeness and baseline declaration; all listed source boundaries; relevant representative test assertions by reading; current primary documentation and papers; independent fixture arithmetic and set partitions.
- **Proposed, not executed:** the new capability, new types/modules, pnpm tests, mounted capture acceptance, browser pointer/keyboard checks at 1280/783/390, and performance behavior of large captures.
- **Not claimed:** a measured usability improvement, benchmark, application test pass, full repository access, stable cross-refresh identity, or complete upstream causal explanation.

### Downloads

- [report.md](report.md)
- [implementation-plan.md](implementation-plan.md)

The accompanying ZIP contains these two files. No source receipts, hash files, or separate manifests are part of the handoff.

### Open questions

None blocks M1; use the decisions above as defaults.

1. After the core ships, is the retained-pin summary in trace headers sufficient discovery, or should D12 add a transient workspace launcher? This is a refinement decision, not a demand gate.
2. Which denominator-aware chart should follow the first entity release? Start with existing series bars; other kinds require explicit adapters and inspection of their current producer contracts.
3. If users later need comparison across refresh or query stages, what durable identity and retention contract should that separate initiative adopt? Runtime IDs and matching business labels are not an answer supplied by this feature.
