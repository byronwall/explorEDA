# Compare values — staged implementation plan

Implement **D01–D09 from [report.md](report.md)** as a complete first release: pin a metric-card total or an individual native category bar, inspect another, and compare exact input membership in the existing temporary trace popover. Preserve current computations and filtering. This is a React/TypeScript and pnpm plan for one developer; it introduces no global framework, query engine, stable identity scheme, or permanent sidebar.

**Source baseline:** `95832bd473884aeae23453af0888b4ca5187820d`. The complete 39-file packet passed its access check and is the authoritative inspected source. Everything marked **new** below is a proposal. No implementation or repository test run occurred during this design task.

## 1. Scope and release sequence

| Milestone | Shippable capability | Recommendations |
| --- | --- | --- |
| **M1 — Captured input-row comparison** | Complete acquisition, both membership bases, exact row access, replacement/resume/clear, change handling, and optional same-result project navigation. | D01–D09 |
| **M2 — Entities and witnesses** | Compare typed entity identities while keeping representatives, repeats, missing IDs, and conflicts separately inspectable. | D10 |
| **M3 — Parts and denominators** | Add selected series/faceted/percentage adapters with explicit numerator, denominator, and baseline meaning. | D11 |

M1 must ship as an end-to-end feature with docs and a runnable example. Internal implementation steps are not substitute milestones. M2 and M3 can be separate feature PRs after M1 is useful. The global two-slot picker, card-only shortcut, full Rows-drawer evidence mode, other trace kinds, live handles, persistence, comparison export, deleted-source retention, and Swap sides wait under D12–D14. No demand study is required before any of these milestones.

### M1 fixed support boundary

- **MetricCard:** exact `metric-card:total`; count, sum, or average; no `entityField`; no facet.
- **SingleBarChart:** foreground category-count bars or native named aggregate bars with count, sum, or average; no entity field, series, stack, bin, facet, or injected `aggregateResult`.
- **Identity:** the same DataLayerProvider instance and prepared-data epoch. In projects also require the same current query-output relation. Plain-host inputs may already be aggregated: call them **input rows**, not original source records.
- **State:** capture available values, empty metric totals, invalid metric totals, and retained zero count bars. A missing or invalid named aggregate bar that is not drawn is not a selectable value.
- **Actions:** Pin for comparison; Compare with pinned value; Replace left; Replace right; Choose another value; Resume comparison; Clear comparison; Close. No armed replacement mode and no Swap in M1.
- **Math:** copy displayed values and producer evidence. Compute set partitions and a compatible labeled value difference; do not add a decomposition chart or another reducer.

These constraints come from the inspected `MetricCardPlan`, `BarChartPlan`, `BarTrace`, `AggregateSpec`, and consumer paths. In particular, `BarTrace.aggregation` is display text and cannot establish an operation or measure identity.

## 2. M1 files and responsibilities

All package paths below are relative to `packages/explorEDA/src/` unless stated otherwise.

### New implementation modules

| File | Responsibility | Keep out |
| --- | --- | --- |
| `components/charts/trace/comparisonTypes.ts` | Internal capture contract, result reasons, basis/partition types, and session state. | Public saved schema or a universal provenance model. |
| `components/charts/trace/comparisonCapture.ts` | Pure metric-card and single-bar adapters; capability checks; copying ledgers and semantic metadata. | Re-aggregation, label parsing, live global-row queries. |
| `components/charts/trace/comparisonSets.ts` | Exact scope/included partitions, per-side row statuses, and compatible numeric-difference policy. | New parsing or reduction rules. |
| `components/charts/trace/TraceComparisonProvider.tsx` | Two frozen slots, synchronous validity guards, one active inspection host, clear/resume actions. | Chart source registry, live chart plans, historical queue. |
| `components/charts/trace/TraceComparisonPanel.tsx` | Captured descriptions, status, basis/partition controls, local search/paging, and optional query navigation. | Changes to filters or saved settings. |
| `components/RecordEvidenceTable.tsx` | Read-only table presentation extracted from ChartDataPreview, with explicit supplied cells and row IDs. | Automatic scope selection, table/Rows filter actions, context-menu filter actions. |

Use direct functions and early returns. Split a module further only if its responsibilities actually diverge. A provider with ordinary React context/state is sufficient.

### Existing implementation files to edit

- **`components/charts/trace/traceTypes.ts` — `TraceSource`:** add optional `captureComparison(kind, id)` returning a discriminated result. Sources without the capability keep ordinary tracing and report an explicit unsupported comparison result.
- **`components/charts/trace/ChartTraceScope.tsx` — `TraceApi`, `ChartTraceScope`:** add `captureCurrentComparison()`. Resolve the current owner and verify the selected revision before delegating. Keep `sources` local. Do not change the normal trace invalidation rule.
- **`components/charts/trace/ChartTracePanel.tsx`:** add the action row and retained-pin summary; switch to `TraceComparisonPanel` for the active comparison host. Keep Find row and Browse objects available in ordinary trace mode. Add a labeled search and bounded target display if needed for large target lists; do not eagerly resolve every trace.
- **`components/charts/ChartTraceControl.tsx`:** support trace/comparison content modes and a larger bounded comparison width. Register only an open/close host identity with the session coordinator, not its chart sources. A new local trace activation closes an older comparison-session popover for keyboard, pointer, and programmatic entry. Close retains the pair; Clear releases it.
- **`components/charts/MetricCard/MetricCard.tsx`:** attach lazy capture to its `TraceSource` using the current rendered `plan`, actual settings, base revision, and data-layer snapshot getter. Keep `planMetricCard` as the numerical authority.
- **`components/charts/MetricCard/metricCardTrace.ts`:** factor the supported total target check for use by the capture adapter if useful. Do not add captured state to the producer plan.
- **`components/charts/BarChart/BarChart.tsx` — `SingleBarChart`:** attach lazy capture from `plan.bars`, actual settings, and the resolved aggregate's real `spec`. Exclude series, injected aggregates, and unsupported shapes explicitly. Use the exact selected `mark.row`.
- **`components/charts/BarChart/barTrace.ts`:** reuse exact mark resolution; do not parse its human-readable aggregation string or infer a numerator/denominator from `traceRowIds`.
- **`components/ChartDataPreview.tsx`:** extract presentation to `RecordEvidenceTable` while leaving this component's existing live scope and aggregate selection unchanged.
- **`providers/DataLayerProvider.tsx`:** add internal unsaved `comparisonEpoch`, advance it at the mutation boundaries in section 5, and nest the comparison provider inside `DataLayerContext.Provider`.

**Read/reuse without behavior changes:** `lib/aggregates.ts`, `lib/valueParsing.ts`, `lib/chartPopulation.ts`, `hooks/CrossfilterWrapper.ts`, `components/charts/useGetLiveData.tsx`, `components/AnalysisChartContext.tsx`, and `types/ChartTypes.ts`.

`traceRows.ts` remains the existing navigation helper. Do not broaden it into the semantic adapter. `ChartDataPreview` remains a live chart preview; the new evidence table is not another call to `getAggregateResult(id)`.

### New focused tests

- `components/charts/trace/comparisonCapture.test.ts` — producer adapter and partition semantics, sharing the small fixture literal with that test's cases.
- `components/charts/trace/TraceComparisonProvider.test.tsx` — two chart scopes, capture lifecycle, synchronous guards, and non-mutating actions.
- `components/charts/trace/TraceComparisonPanel.test.tsx` — paging/search, statuses, dismissal, host coordination, and exact query keys.
- `apps/demo/e2e/compare-values.spec.ts` — actual pointer/keyboard behavior at the three required widths.

Extend the existing `ChartTraceScope.test.tsx`, `MetricCard.test.tsx`, and `barPlan.test.ts` only where the new capture hook needs an integration assertion. Do not duplicate the reducer's existing invalid-value/entity suite or create a broad robustness campaign.

## 3. M1 contract and producer adapters

### Internal type sketch

The following is a design contract, not committed source. Use existing `datum`, `Filter`, and field-format types in implementation; the two referenced snapshot types immediately below are defined by their required contents rather than a new public API.

```ts
type ComparisonBasis = "scope" | "included";
type ComparisonPartition = "shared" | "left-only" | "right-only";
type ComparisonOperation = "count" | "sum" | "average";

interface InputEvidence {
  sourceId: number;
  input: datum;
  rawInput?: datum;
  included: boolean;
  exclusionReason?: string;
}

interface CapturedValue {
  captureId: number; // Session-local sequence, never a record key.
  workspaceToken: symbol;
  comparisonEpoch: number;
  grain: "input-row" | "query-output-row";
  resultRelation?: object; // Exact resultRows identity; never serialized.

  origin: {
    chartId: string;
    chartType: "metric-card" | "bar";
    chartTitle: string;
    owner: string;
    kind: "metric-card" | "bar";
    targetId: string;
    targetLabel: string;
    group?: { field: string; value: datum; label: string };
  };

  metric: {
    operation: ComparisonOperation;
    measureField?: string;
    measureLabel?: string;
    unit: "input-row";
    producerState: "value" | "empty" | "invalid";
    value?: number;
    valueText: string;
    includedCount: number;
    averageDenominator?: number;
  };

  capturedAt: number;
  sourceRevision: string;
  baseRevision: { nonce: number; liveNonce: number };
  scope: CapturedScope;
  formatting: CapturedFieldFormatting;
  evidence: readonly InputEvidence[];
  preparedRows: readonly Readonly<Record<string, datum>>[];
  rawRows: readonly Readonly<Record<string, datum>>[];
  queryKeysById?: ReadonlyMap<number, string>;
  unmappedQueryIds?: readonly number[];
}

type CaptureResult =
  | { status: "captured"; value: CapturedValue }
  | { status: "stale"; message: string }
  | { status: "unsupported"; message: string };

interface ComparisonSession {
  left?: CapturedValue;
  right?: CapturedValue;
  activeHostId?: string;
  mode: "trace" | "comparison";
  notice?: string;
}
```

`CapturedScope` contains the producer's global-filtered or peer-context mode; `localSelections`; captured workspace filters; chart filters with owner IDs/titles and applied/omitted-own/inactive-in-notebook treatment; the chart's local restrictions; and typed group identity. Copy only relevant semantic chart settings and the exact aggregate spec. `CapturedFieldFormatting` copies the field definitions needed to reproduce captured labels and formatting; adding a column later must not silently use new formatting for the old headline value.

The `preparedRows`/`rawRows` properties retain immutable-within-epoch references; they are not whole-dataset deep copies. Effective calculated columns can be cached lazily through the current getter only after an epoch check. The epoch must change before new prepared values become observable. No captured value retains a resolver closure over a live chart plan.

The exact TypeScript naming can follow local conventions. The required distinctions, guarded identity, and typed supported/unsupported result are behavioral requirements.

### Adapter algorithm

1. Resolve the current selected trace from the local source. If owner/revision/target is no longer current, return `stale` without replacing either slot.
2. Compare the plan's captured base `nonce` and that chart's live-item nonce against `useDataLayerSnapshot()` at action time. Also verify `comparisonEpoch`. Do not attach current filters to an old plan.
3. Check the producer capability boundary. Reject entity/facet/series/bin/percent/injected output and operations outside count/sum/average for M1. An unsupported result never deletes a prior capture.
4. Copy the ledger's scalar entries and the actual displayed value/state. Preserve `input`, `rawInput`, included status, and exact supplied exclusion reason. Do not reinterpret reasons by matching user-facing strings.
5. Copy structured semantic scope, the producer's field/spec identity, captured formatting, origin, and relation identity. An ordinary native count bar's operation is `count`; its `input` may be undefined because no measure is being reduced.
6. Verify that the supported producer's ledger addresses current input rows and has one entry per runtime input occurrence. Keep business-ID duplicates. If a source supplies repeated runtime occurrences outside this contract, report unsupported rather than silently changing multiplicity.
7. For a project capture, map all ledger IDs to current result-row keys and record any missing mapping. A missing mapping blocks query navigation, not local evidence inspection within the valid workspace relation.
8. Recheck epoch/relation before committing a capture after any asynchronous preparation. Only then replace the requested slot.

**Metric adapter:** copy `plan.value`, `plan.valueText`, `plan.state`, `plan.contributors`, `plan.aggregation`, and its true settings. `plan.rowCount` is not the source-ID set. Count ignores the measure in `planMetricCard`; preserve that meaning.

**Bar adapter:** copy `mark.value`, `mark.valueText`, and `mark.row.contributors`. A drawn finite bar has producer state `value`, including a zero count bar with an empty ledger; do not apply the metric-card empty-state convention to it. Resolve the operation/measure from the actual `AggregateResult.spec` supplied to the planner, or ordinary category-count mode. Do not use `plan.domain`, `mark.total`, all-source reference counts, or `ChartDataPreview` to discover foreground membership.

### Partition and numeric-difference rules

- Build ID sets from the complete ledger for scope and from `included === true` for included rows. Use a linear map/set pass; sort table output by source ID for deterministic access without changing producer representative order.
- A row's status is side-specific: **Included**, **Excluded: [recorded reason]**, or **Outside this value's scope**. When outside scope, do not display a made-up reducer exclusion or pretend that side evaluated the input.
- Show default basis **Used in calculation**. Always keep **In scope** visible. Default to Left only if nonempty, then Right only, then Shared.
- For count/count, same unit, both available and finite: show signed `left − right` labeled in input rows.
- For same-field sum/sum or average/average, same epoch/unit, both available and finite: show a labeled numeric difference. For averages show each included denominator alongside the values.
- For different operation, measure, or unit: show both values and the differing definitions; do not compute an unlabeled delta.
- If either producer is empty, invalid, or nonfinite, preserve its display and suppress the numeric difference. An empty count's underlying zero does not erase the card's “No rows” state.
- Do not invent decomposition arithmetic from set counts. M1 does not need to resummarize the exclusive subsets. If a later breakdown does, use `reduceNumbers` and the actual prepared inputs rather than a second implementation.

## 4. M1 interaction and one-surface coordination

### State transitions

| State/action | Required next state | Side effects permitted |
| --- | --- | --- |
| No pin → Pin supported current trace | Left captured; right absent; close source trace. | Announce pinned label and restore focus. |
| Left retained → Inspect B | Ordinary B trace; left unchanged. | Close older comparison-session popover, without clearing snapshots. |
| B → Compare with pinned | Left/right captured; B control hosts comparison body. | Focus comparison heading/first action. |
| Pair retained → Inspect C | Ordinary C trace with Replace left/right. | Pair remains until an explicit successful replacement. |
| Replace side | Only that side changes; current control hosts comparison. | Reset local table search/page to show the new partition. |
| Choose another value | Hide comparison; keep both sides. | No latent capture mode. |
| Escape/outside/Close | Hide surface; retain pair. | Restore focus; nested picker closes first. |
| Resume comparison | Open pair in the current trace control. | Validate epoch, origin existence/type, and relation first. |
| Clear comparison | Empty both slots and release cached evidence. | Remove retained-pin summary. |

The coordinator tracks only inspection host IDs and open/close commands. It does not expose `TraceSource`s globally. Cross-host closure is explicit; do not rely on outside click because keyboard inspection need not produce one. Preserve comparison state when a host's normal close callback clears its **local trace selection**.

M1's resumption control lives in existing trace headers. The implementation accepts that discoverability is lower while all traces are closed. Do not add a toolbar button or floating persistent control to conceal this tradeoff; the separate D12 launcher remains a later option.

### Surface layout

- Reuse `ChartTraceControl` and its nonmodal Popover. Comparison width: `min(48rem, calc(100vw - 24px))`; maintain a viewport-bounded height and internal scrolling. Keep existing compact trace width for ordinary traces.
- First action row: heading, Choose another value, Clear comparison, Close. Put explanatory detail in the value summaries and control tooltips, not an introductory paragraph above the actions.
- Follow with two value summaries, basis tabs, partition tabs/counts, evidence search/columns, table, and paging status.
- Stack summaries on narrow screens. Keep tab rows on one horizontally scrollable line; do not wrap.
- Use existing semantic border/input/focus tokens, explicit accessible names, and real tooltips. Do not add native title attributes, mark-level Inspect buttons, or a new modal focus trap.
- Put focus into the comparison on explicit Compare/Resume; Escape/Close return to the opening trace trigger. If the origin was removed, the clearing notice and a remaining workspace control receive a sensible focus fallback.
- When used inside chart details, honor the existing dialog portal container/focus conventions described by `docs/agent-guide.md`. A nested inspection layer closes before the details dialog; no second chart copy is created.

### Evidence table behavior

- Reuse the table presentation extracted from `ChartDataPreview`, not its data-query wrapper and not the full editable Rows table.
- Render 100 rows per page; keep complete membership and exact counts. First page reads `1–100 of N`; later pages state their true range.
- Provide local search and source-row-ID lookup across the **entire active partition**, not only the current page. Distinguish `K search matches` from the partition's total `N`.
- Reset page when basis/partition/search changes. Keep capture values and partition counts fixed.
- Default columns: Source row ID, useful record/group label, each side's input/status. Add grouping/restriction fields through a compact Columns picker. Use `NullValue` for missing data.
- Exclude filter, selection, distribution-filter, and context-menu filtering actions. Cell copying is permitted; editing is not.
- A side-specific excluded reason comes only from captured producer evidence. Outside-scope rows remain explicitly outside scope. M1 may display captured local rules and row values together; automatic predicate-failure wording is unnecessary for this milestone.
- For large preparation, retain the current pair, show progress, support cancel, and check validity before committing. Never silently truncate or sample membership. Bound rendering, not evidence correctness.

## 5. M1 lifetime, invalidation, and data-layer wiring

### Add one volatile epoch

Add `comparisonEpoch: number` to `DataLayerState`, the explicit `Required<Pick<DataLayerState<T>, ...>>` return-type list in `getInitialStoreState`, and both initial-state branches. It must not appear in `SavedDataStructure`, `saveToStructure`, JSON/text export, `onStateChange` payloads, or history.

| Mutation in `DataLayerProvider.tsx` | Exact epoch treatment | Reason |
| --- | --- | --- |
| `setData` | Increment in the state update that installs new data/crossfilter/calculation manager. | New array/order creates a new runtime input-ID generation. |
| `updateFieldSettings`, `typeChanged` branch | Increment in the state update installing rebuilt prepared data. | Type, date preset, and null-token interpretation can change row values. |
| `updateFieldSettings`, formatting-only branch | Do not increment. | Frozen formatting remains on each capture; prepared values are unchanged. |
| `restoreAnalysisFromStructure` | Increment with its restored data/manager state. | Restore rebuilds the runtime identity space even if rows look familiar. |
| `refreshCalculations` | Increment in the **first** observable `store.setState`, alongside new `calculations` and cleared `calcColumnCache`. Keep the later nonce/live-items update. | A synchronous subscriber must not see new calculated values under the old comparison epoch. |
| Linked/workspace filters, local restrictions, aggregate definitions, chart settings, titles/layout/theme | Do not increment merely for these changes. | Captures intentionally preserve earlier context and interpretation. |

`addCalculation`, `updateCalculation`, `removeCalculation`, and `rerunCalculations` already flow through `refreshCalculations`. Inspect and retain that flow. A real restore can advance the epoch more than once during a data update; tests require invalidation, not an exact increment count.

### Provider composition and guards

Nest `TraceComparisonProvider` under `DataLayerContext.Provider`, around its existing children. Keep it a plain React module with no import of `DataLayerProvider` to avoid a dependency cycle. Supply:

- Current `comparisonEpoch`, with a root-level store subscription.
- A synchronous `getCurrentEpoch()` callback.
- A minimal current-origin reader/subscription capable of checking the two captured chart IDs and their chart types. This can bridge the existing store subscription; it is not a registry of trace sources.

The provider creates its private workspace token. It retains only two evidence values and one active host. Changes in table search/page stay local to the panel, so they do not broadcast through every source registration.

Before pin, replace, resume, record-column access, or query navigation:

1. Check workspace token and epoch synchronously.
2. Check that both captured chart IDs still exist with their captured chart types.
3. For project evidence, check compatible current result relation before showing/navigating its mappings.
4. Only then read same-epoch rows or commit an action.

When an epoch mismatch is observable, derive the visible pair as absent immediately; an effect can release the old references afterward. A queued action from an old source may not install old evidence during that effect gap.

### Survives, marks changed, or clears

- **Keep frozen, label context changed:** applicable linked/workspace filters, own selection, local restrictions, aggregation/measure choice, or native aggregate spec changes. Compare structured captured/current semantic settings for the two origins; broad `nonce` changes do not identify a cause.
- **Keep frozen without numerical-staleness warning:** title, precision, label, layout, theme, colors, axes, or a panel moving between grid/details. Keep captured text/formatting rather than silently rewriting it.
- **Clear both:** epoch changes, explicit Clear, workspace unmount/reload, deletion of either captured source chart, or replacement of its chart type. Deleting an unrelated chart does not clear a pair. This deliberately avoids unreachable captures when the final trace host is deleted; retaining deleted-source snapshots is deferred.
- **Do not equate unmount with deletion:** resolve chart IDs against the store, not against mounted source registration. Reflow, a details transition, or virtualized visibility can unmount a source without deleting its chart.
- **Saved-data echo:** preserve the existing fingerprint optimization. If the provider skips the restore because the echoed settings match, no epoch change or comparison clear occurs.
- **In-place host data mutation:** the README says new arrays are required and in-place changes are not observed. Do not add mutation detection or a stable-key repair to this feature.

Clear copy: **“Comparison cleared because the data or prepared values changed. Trace the values again.”** For deletion/type replacement: **“Comparison cleared because a source chart was removed or replaced.”** For a stale capture attempt: **“This value changed. Trace it again.”** Keep these factual and brief.

### Project relation and query keys

`AnalysisChartContext.resultRows` is indexed by runtime ID, and `QueryRowsLink` already calls `onOpenQueryFlow(keys)`. Read context at the chart source/active trace host; do not assume it is above the comparison provider in the tree.

- Capture the exact `resultRows` object identity and the mapping of capture IDs to result keys. Equality is a session relation boundary, not durable identity. A newly allocated relation is conservatively different even if its contents look identical.
- Both captures must use the same relation and workspace epoch. Do not overlap input-row evidence with query-output-row evidence, or two different output relations.
- Before an old project comparison is shown or acted on from a host, compare that host's current relation. If a known relation has changed, clear the stale pair. If the current host has no compatible project context, retain same-epoch local evidence but disable query navigation rather than borrow another callback.
- Navigate exactly the active basis/partition's IDs. Map every one; if any mapping is missing, disable the complete action and say how many cannot be mapped. Do not drop IDs silently.
- Deduplicate result keys and label counts accurately. Never call the query callback for an empty partition or with invented keys.
- Close the popover before invoking the current callback. If query navigation changes the workspace data/relation, normal invalidation clears the pair. No upstream expansion or query execution changes belong here.

## 6. Exact native-data fixture

Use this small literal in the demo and in the focused comparison tests. Duplicating eight rows across the demo and test fixture is preferable to exporting test data through the public package or creating a new shared framework. Expected sets below are literal acceptance values, not values computed by the production comparison implementation.

```ts
export const comparisonRows = [
  { record: "r0", region: "West", channel: "Web",   orderId: "O1", amount: 10,    cost: 2 },
  { record: "r1", region: "West", channel: "Store", orderId: "O1", amount: 10,    cost: 2 },
  { record: "r2", region: "West", channel: "Web",   orderId: "O2", amount: 20,    cost: 5 },
  { record: "r3", region: "West", channel: "Web",   orderId: "O3", amount: null,  cost: null },
  { record: "r4", region: "East", channel: "Web",   orderId: "O4", amount: 30,    cost: 10 },
  { record: "r5", region: "East", channel: "Store", orderId: "O5", amount: "bad", cost: null },
  { record: "r6", region: "East", channel: "Web",   orderId: "O6", amount: 0,     cost: 0 },
  { record: "r7", region: "East", channel: "Web",   orderId: null, amount: 0,     cost: 0 },
];

export const comparisonFieldSettings = {
  amount: { type: "numeric", precision: 2 },
  cost: { type: "numeric", precision: 2 },
} as const;

export const amountByRegion = {
  id: "amount-by-region",
  name: "Amount by region",
  groupField: "region",
  measureField: "amount",
  aggregation: "sum",
} as const;
```

`record` is a convenient fixture label, not a stable production key proposal. Do not supply a user-defined `__ID`; initial runtime input IDs are `0…7` in this source order. `type: "numeric"` is the field-setting spelling demonstrated by `MetricCard.test.tsx`.

Build full chart settings using `metricCardDefinition.createDefaultSettings` and `barChartDefinition.createDefaultSettings`, as the existing tests do. Override only these fields; keep facets disabled and entity fields unset:

| Chart ID/title | Producer and settings | Local restriction |
| --- | --- | --- |
| `west-sum` / West amount | MetricCard, `aggregation: "sum"`, `measureField: "amount"` | `region` value `West` |
| `web-region` / Web amount by region | BarChart, field `region`, `aggregateId: "amount-by-region"`; native provider aggregate | `channel` value `Web` |
| `west-average` / West average | MetricCard, `aggregation: "average"`, `measureField: "amount"` | `region` value `West` |
| `west-count` / West input rows | MetricCard, `aggregation: "count"` | `region` value `West` |

Use standard filter objects, for example `{ type: "value", field: "region", values: ["West"] }`. All initial linked `filters` and workspace filters are empty. Later example variants add `west-cost`, an all-input metric, invalid-only/empty metrics, and ordinary category-count bars through the same defaults. Keep the first view small; scenario variants are fixture views, not new product controls.

### F01 — Local restriction, exact first comparison

Left is `west-sum`; right is the **West** mark of `web-region`.

| Quantity | Left | Right |
| --- | --- | --- |
| Displayed numeric value | `40` | `30` |
| Scope | `{0,1,2,3}` | `{0,2,3}` |
| Included | `{0,1,2}` | `{0,2}` |
| Invalid measure witness | `{3}` | `{3}` |

- Scope: Shared `{0,2,3}`; Left only `{1}`; Right only `{}`.
- Included: Shared `{0,2}`; Left only `{1}`; Right only `{}`.
- Default included basis selects Left only and exposes `r1`, amount `10`, channel `Store`.
- Compatible sum difference is `40 − 30 = 10`.
- Under scope Shared, `r3` is visible and excluded on both sides; do not omit it because the amount is null.
- `r0` and `r1` have the same business ID and remain separate rows. No entity deduplication occurs in M1.

### F02 — Equal totals from different sets

Compare the West and East marks of `web-region`.

- West scope `{0,2,3}`, included `{0,2}`, value `30`.
- East scope/included `{4,6,7}`, value `30`.
- Scope Shared `{}`; Left only `{0,2,3}`; Right only `{4,6,7}`.
- Included Shared `{}`; Left only `{0,2}`; Right only `{4,6,7}`.
- Difference `0` coexists with no overlap. Rows `6` and `7` contribute valid zero amounts.

### F03 — Same included rows, different reductions

Compare `west-sum` and `west-average`.

- Both scopes `{0,1,2,3}`; both included sets `{0,1,2}`.
- Values `40` and `40/3 = 13.333333333333334` before formatting; average denominator `3`.
- Both bases have no exclusive rows. Show the differing operation, not “no explanation” and not a set-difference decomposition.
- A count card over the same scope is `4` and includes `{0,1,2,3}`. It has no measure eligibility condition.

### F04 — Same included rows, different measures

Compare West sum(amount) to a West sum(cost) card.

- Both scopes `{0,1,2,3}`; both include `{0,1,2}`.
- Values `40` and `9`; amount inputs `10,10,20`, cost inputs `2,2,5`.
- Preserve both field names. Suppress a generic combined delta of `31`.

### F05 — Invalid, empty, and zero

- All-input count: `8`, included/scope `{0,1,2,3,4,5,6,7}`.
- All-input sum(amount): `70`; included `{0,1,2,4,6,7}`; excluded `{3,5}`.
- All-input average(amount): `70/6 = 35/3 = 11.666666666666666`; denominator `6`.
- Restrict to `record ∈ {r3,r5}`: scope `{3,5}`; count `2`; sum/average undefined, state `invalid`, text **No valid values**.
- Restrict to `region = Nowhere`: scope/included `{}`; sum/average undefined and state `empty`; count has underlying `value = 0` but state `empty` and text **No rows**.
- Restrict to `record ∈ {r6,r7}`: sum `0`, state `value`, included `{6,7}`. This is distinct from both previous states.
- Raw reducer fixtures preserve `r5.input = "bad"` with **Not a finite number**. With explicit numeric field preparation, assert `rawInput = "bad"` and the producer's **Conversion failed** reason; do not demand the same prepared input or reason string as the raw-reducer path.
- For an ordinary category-count bar narrowed to no matching rows, known full-source categories can remain zero bars with empty contributor arrays. A named aggregate can instead have no row/mark. Test this distinction without adding fictional trace targets.

### F06 — Own selection, local restriction, and peer context

Start from the initial data. On `web-region`, set an ordinary own selection `region = West`.

- Global linked membership is `{0,1,2,3}`; it includes Store row `1` because the chart's local Web restriction does not narrow its linked category predicate.
- The bar's West foreground remains scope `{0,2,3}`, included `{0,2}`, value `30`.
- An all-input sum card becomes `40` with included `{0,1,2}`.
- Inspect/pin/compare must not alter the existing own selection or its linked membership.

Then add workspace `region = East`, which conflicts with the bar's own West selection.

- Global linked membership is `{}`; the all-input card is empty.
- The bar omits its own selection from its peer context, so its East/Web mark still has `{4,6,7}` and value `30`.
- A prior captured pair stays frozen with its earlier-filter badge. A newly captured empty card and East bar correctly reflect different producer contexts; do not “fix” the filtering to make them agree.

### F07 — Search is presentation, not population

- In the initial state, search the ordinary Rows table for `r0`: its searched result is `{0}`.
- The captured F01 sets and values remain exactly unchanged.
- Open comparison scope Shared `{0,2,3}`, add `record` through Columns if it is not already displayed, and search for `r3`: show one search match, excluded on both sides, while retaining Shared count `3`.
- Clear comparison search: `{0,2,3}` is available again. Existing Rows search is neither inherited nor erased.

### F08 — Settings revision, then data revision

Capture F01. Change `west-sum` from sum to average through existing settings.

- The live card becomes `40/3`; its captured left remains sum `40`, included `{0,1,2}`.
- Show that chart settings changed. Explicit replacement updates only left to average `40/3`; right remains sum `30`, so no combined numeric delta is shown.
- Resizing, changing precision, and editing the title do not change captured math or trigger a data epoch clear.

For the separate data-revision step, restore the baseline fixture settings (including `west-sum` using sum), retain the complete `saveToStructure()` result as `fixtureSavedData`, and rerender with both that `savedData` and a new input array changing only `r2.amount` from `20` to `25`. Use the existing restore path: `setData` by itself resets charts, aggregates, and field settings, so passing only new data would not retain these named charts. Do not change that reset behavior for this feature.

- Old captures clear before any old ID can read new data.
- New West sum `45`; West/Web sum `35`; all-input sum `75`.
- New West average `15`; Web-West average `17.5`.
- Matching record labels do not authorize comparison between old and new generations.

### F09 — Reorder and source deletion

Reverse the original eight rows into a new input array and supply the complete baseline `fixtureSavedData` with it, as in F08, so the existing restore path retains the intended charts, aggregates, and field preparation.

- Old captures clear.
- New runtime mapping: `0→r7`, `1→r6`, `2→r5`, `3→r4`, `4→r3`, `5→r2`, `6→r1`, `7→r0`.
- All-input sum remains `70`. A later entity reduction still totals `60`, but O1's first representative is now `r1` at ID `6`, and `r0` at ID `7` is repeated.

Separately, capture F01 and delete `west-sum`: clear the pair with the source-chart notice. Deleting an unrelated chart preserves it. Moving a source into chart details or remounting it at a different width preserves it because its chart ID/type still exists.

### F10 — Calculation and field-preparation revision

Use a card locally restricted to `record ∈ {r0,r1,r2}`, so every amount in this calculation case is numeric. Add a calculated field `adjusted = amount * 2`, capture sum(adjusted) = `80` with scope/included `{0,1,2}`, then change the expression to `amount * 3`.

- Old captures clear as the new prepared columns become observable.
- New sum(adjusted) = `120`, scope/included `{0,1,2}`.
- A rerun of the same expression also clears conservatively; no claim is made that values necessarily changed.
- Changing amount's null-token interpretation or field type clears. Changing amount's precision alone does not.
- Tests should observe the first calculation-refresh state commit to ensure the epoch already differs when the calculated cache changes.

Construct the expression through the existing calculation API and assert the included set through the mounted producer. This all-numeric subset makes the epoch check independent of missing-value calculation behavior. The multiplication syntax is already used in the supplied shop example.

### F11 — Project mapping, exact navigation

Use the initial eight input rows and an `AnalysisChartContextProvider` with result rows mapping runtime IDs `0…7` to distinct keys `q0…q7`.

- F01 included Left only `{1}` navigates to exactly `["q1"]`.
- F01 scope Shared `{0,2,3}` navigates to exactly `["q0","q2","q3"]` in stable runtime-ID order.
- Empty Right only makes no query-flow call.
- With mapping `q3` missing, the scope Shared action is unavailable; no partial `["q0","q2"]` navigation occurs.
- With no analysis provider, all local comparison evidence works and no query button appears.
- Replacing `resultRows` with a new relation object blocks old keys before action; no alignment by equal runtime integers or equal displayed labels.
- A separate synthetic mapping with two runtime IDs mapped to one key verifies deduplicated key navigation and separately labeled input/key counts.

### F12 — More than one page

For table/partition tests, generate synthetic captured ledgers directly: left IDs `0…149`, right IDs `50…199`, all included, each count `150`.

- Shared exactly `50…149` (`100`); Left only `0…49` (`50`); Right only `150…199` (`50`).
- For an all-shared pair `0…204`, both counts `205`; page ranges are `1–100`, `101–200`, `201–205`.
- Source-row lookup `204` reaches the exact record; search over the complete partition finds it from the first page.
- No membership count becomes `100` because the table renders 100 rows.
- This is one focused rendering-boundary test, not a new aggregation benchmark or randomized suite.

### F13 — Unsupported kinds and producer races

Try a guide, title, entity card, series/percent bar, bin, facet, external aggregate, and a different project relation.

- Ordinary trace still works; comparison says why that target cannot be used in M1.
- Existing left/right captures remain intact after unsupported attempts.
- An old source capture closure invoked after a data/setting update returns stale and cannot commit mismatched evidence.
- If an aggregate group is absent or unplotted, browsing does not invent a zero bar target.

## 7. M1 focused validation and acceptance

### Tests with highest value

1. **Adapter/partition test:** feed real existing MetricCard/Bar plans for F01–F05 into the capture adapters. Assert literal IDs, producer value/state, inputs/reasons, and operation compatibility. The expected sets must not come from the comparison implementation.
2. **Two-scope mounted test:** mount separate `ChartTraceScope`s in one DataLayerProvider; use real trace acquisition to complete F01, replace a side, dismiss/resume, and run F06–F09. This proves the new workspace state crosses local trace ownership without changing chart filters.
3. **Invalidation test:** exercise setData/reorder, real restore, type/null-token change, calculation edits/reruns, format-only edits, and equal saved-data echoes. Include the stale action/effect-gap case and first calculation-refresh commit.
4. **Table/navigation test:** F07 and F11–F12; verify page/search counts, complete mapping, no callback on empty sets, and read-only interactions.

Use the repository's current registered chart setup, ResizeObserver stubs, and shared time limits. The existing reducer and plan tests already establish numeric parsing, entity conflict behavior, and bar membership; add only the assertions needed to validate this feature's new boundary.

Track the serialized workspace before and after inspection-only actions and assert equality. Spy on `onStateChange` after setup: pin/compare/basis/partition/search/page/replace/dismiss/clear must produce **zero** callbacks. Deliberate filter/settings edits in the fixture continue producing their usual existing callbacks; do not mistake those for inspection effects.

### Browser acceptance at 1280, 783, and 390 px

Run the same main flow at all three widths, with both pointer and keyboard. Capture screenshots of the completed comparison and its narrow layout using repository tooling. These checks are requirements for the implementation PR, not results already achieved.

| Width | Required layout outcome | Input and evidence checks |
| --- | --- | --- |
| **1280** | Bounded nonmodal popover; useful chart context remains visible; paired headings fit or deliberately stack; action row remains reachable. | Alt-click West amount, Pin; Alt-click West bar, Compare. Verify F01 and unchanged filter chips/global membership. |
| **783** | No page-level horizontal overflow; popover/table scroll independently; chart responsive flow does not change saved layout or captured state. | Repeat by Tab/Alt-Enter; change basis/partition with keyboard; close/resume; inspect another chart and confirm only one session popover is open. |
| **390** | 12px viewport margin, stacked headings, one-line scrolling tabs, reachable Close/search/paging; no added permanent sidebar. | Touch-style pointer through header Trace/Browse targets, then keyboard through the same route. Pin one chart, scroll to the other, and complete comparison without needing both on screen. |

At every width, additionally:

- Reach `r1` in included Left only and `r3` in scope Shared; their left/right statuses differ as specified.
- Verify ordinary bar click and Enter/Space still filter, while Alt-click/Alt-Enter and comparison actions do not. MetricCard plain click remains its current inert action.
- Inspect a third value, explicitly replace left and right in turn, and confirm the untouched side is unchanged.
- Close with Escape, resume from a different trace header, and clear. A nested Columns picker consumes the first Escape. Focus returns to a valid trigger.
- Apply a filter and a sum→average edit; the frozen pair stays unchanged with context/setting status. Replace data; the pair clears with a live announcement.
- Exercise empty/invalid cards, valid zero, a missing/unsupported target, long chart/field names, null cells, many objects, and record `204` after the first 100.
- Open the flow inside chart details; verify portal/focus behavior and nested Escape before closing details. No second comparison popover or second chart copy is introduced.
- Check light and dark token borders/focus, touch-visible actions, and that exported chart imagery omits comparison editor controls. Do not add a new comparison export.

## 8. M1 docs, example, commands, and risk

### Documentation in the same milestone

- **New:** `apps/demo/src/docs/pages/compare-values.mdx` — exact value entry, pin/second trace, both bases, shared/only records, replacement/dismissal, frozen lifetime, supported grain, and the worked `40`/`30` example.
- **Update:** `trace.mdx` — add comparison entry and return/resume links while preserving current trace gestures.
- **Update:** `filters.mdx` — evidence search is local presentation, and captures can reflect earlier filter contexts.
- **Update:** `metric-card.mdx` — count versus sum/average inclusion, empty versus invalid versus zero, and a comparison link.
- **Update:** `bar.mdx` — explain the actual native SingleBarChart scope where comparison is documented; replace its overly broad named-aggregate global-scope sentence with consumer-accurate wording. Preserve current chart semantics.
- **Register:** `apps/demo/src/docs/catalogue.ts`, `apps/demo/src/docs/targets.ts`, and `apps/demo/src/docs/live/examples.ts`, following the existing conventions after reading those files. They are named by the inspected agent guide, but their current contents are not in this packet.

Use concise product copy; implementation gaps, to-dos, and this staging plan belong in the intent document, not in a user-facing example banner.

### Runnable example in the same milestone

- **New source:** `apps/demo/src/demos/analyses/compare-values.ts` exports the eight native rows and the focused settings/scenario definitions. Adapt to the existing example loader after reading its actual registration files; do not invent a new example framework or dashboard-text syntax.
- **Registration:** `apps/demo/src/demos/examples.ts` and `apps/demo/src/demos/coverage.ts`; update relevant coverage expectations using existing conventions.
- **Route:** `/examples/compare-values`.
- **Live docs ID:** `compare-values`, with scripted steps that trace `west-sum`, pin, trace the West bar in `web-region`, compare, select scope Shared, and find `r3`.
- **Initial chart layout:** the four charts in section 6. Scenario variants supply cost, invalid/empty, and local/linked-filter cases. A data-revision test harness may replace the array through props without adding a new product data-editing UI.
- **Existing shop example:** retain `apps/demo/src/demos/analyses/shop.ts`; link the new workflow from its metric/bar docs. Do not rewrite it or invent stable order identities for it.

The source packet establishes existing default factories, native settings/rows inputs, and documentation/example registration locations through tests and `docs/agent-guide.md`. Codex's normal checkout read should confirm registration shapes before editing. M1's product behavior does not depend on those files hiding an additional capability.

### M1 run sheet

These commands are for Codex after implementing the named files in a real checkout. They were **not run** on the partial repository snapshot. Keep one developer/server and run `pnpm check` only once for the final broad verification. Use shared timeout settings.

```bash
# Targeted library checks for the new behavior and touched producer boundaries.
pnpm --filter exploreda exec vitest run \
  src/components/charts/trace/comparisonCapture.test.ts \
  src/components/charts/trace/TraceComparisonProvider.test.tsx \
  src/components/charts/trace/TraceComparisonPanel.test.tsx \
  src/components/charts/trace/ChartTraceScope.test.tsx \
  src/components/charts/MetricCard/MetricCard.test.tsx \
  src/components/charts/BarChart/barPlan.test.ts
pnpm --filter exploreda check-types

# Check that the new example is registered and its saved settings round-trip.
pnpm --filter demo exec vitest run \
  src/demos/coverage.test.ts src/dashboardText.test.ts
pnpm --filter demo docs:check

# Start the current checkout's one demo server; use the URL it prints.
pnpm dev:agent

# New browser test owns the pointer/keyboard scenarios and viewport assertions.
pnpm --filter demo exec playwright test e2e/compare-values.spec.ts

# Existing shot tooling captures all three standard widths.
# Use the completed comparison state/selectors from the new example test.
pnpm shot /examples/compare-values --name compare-values

# User-facing package changes require a hand-authored feature changeset.
pnpm changeset:add minor "Compare two metric or bar values and inspect the input rows they share and use separately."

# One broad verification, from one worktree, before PR handoff.
pnpm check

# Build docs/demo and run the new page's live scripted example.
pnpm --filter demo build
pnpm --filter demo docs:verify -g '/docs/compare-values$'

# Stop this checkout's server when finished.
pnpm dev:agent --stop
```

`pnpm shot` without interaction steps captures the initial example. Add the verified test's trace/pin/compare steps or reuse its completed-state screenshots for the required comparison images; do not claim the initial dashboard screenshot proves the interaction. Follow AGENTS.md's screenshot attachment instructions for the eventual PR. No publish or release command is part of this design handoff.

### Main M1 risk and completion criterion

**Risk:** exact-looking evidence is accidentally taken from current global Rows membership, from a changed producer render, or from new prepared data under old runtime IDs.

**Mitigation:** producer-local capture, explicit typed scope/spec metadata, first-commit epoch invalidation, synchronous action guards, and the literal two-scope fixture test. The feature is done when an analyst can finish F01–F09 through pointer and keyboard without a filter side effect, reach every exact member including off-page rows, understand an equal-set/different-reduction case, and observe the specified clear behavior on data change. Docs and the runnable example are part of this completion criterion.

## 9. M2 — Entities and all their witnesses

### Shippable behavior

Extend the same supported card/native-bar operations to `entityField`. Compare typed entity identities when both sides declare the same entity field and input relation. Keep scope rows, included representatives, and distinct entities as different evidence bases. A row-grain versus entity-grain pair may compare scope witnesses, but must label unequal counting units and suppress a cross-unit value delta.

An entity comparison uses all witness IDs for a typed entity key. It must not intersect only the representative runtime IDs. In particular, `summarizeGroup` chooses representatives by input order; that choice can change without changing the entity or its value.

### Exact files and semantics

- **`lib/aggregates.ts`:** add typed contributor role metadata at the existing inclusion/exclusion construction points if needed, alongside current human-readable reasons. Roles distinguish included representative, repeated witness, missing ID, conflicting ID, and numeric exclusion. Preserve all current values, contributor ordering, missing-ID rules, and conflict policy.
- **`metricCardPlan.ts` and `metricCardTrace.ts`:** retain typed unit metadata needed by the capture adapter. Do not substitute `rowCount` for distinct scope membership or infer identity from `entityLabel`.
- **`barTrace.ts` and `BarChart.tsx`:** pass the exact aggregate entity field/spec to capture.
- **`comparisonTypes.ts` / `comparisonCapture.ts`:** add explicit entity units with typed key, all witnesses, representative, eligibility, and conflict state.
- **`comparisonSets.ts`:** partition entities only when namespace and field identity agree. Use the existing category-key equality behavior; numeric `1` and string `"1"` remain distinct.
- **`TraceComparisonPanel.tsx` / `RecordEvidenceTable.tsx`:** entity partition rows expand to all witnesses with their roles. Basis labels say entities versus input rows, not an ambiguous “contributors.”

Do not change the reducer conflict policy described in R043. A conflict can make the whole result undefined even while another entity's row has `included: true`. Preserve that state. MetricCard count removes the measure field; a named count spec that retains a measure can have different conflict behavior. Do not normalize one to the other.

### Exact fixture and focused checks

| Case | Expected value and units | Witness evidence |
| --- | --- | --- |
| West count once per orderId | `3` entities: O1, O2, O3 | Included representatives `{0,2,3}`; repeated `{1}`. |
| West sum(amount) once per orderId | `30`; unit `rowCount = 3`, included entities `2` | Included representatives `{0,2}`; repeated `{1}`; invalid `{3}`. |
| All count once per orderId | `6` entities | Representatives `{0,2,3,4,5,6}`; repeated `{1}`; missing ID `{7}`. |
| All sum(amount) once per orderId | `60`; included entities `4` | Included `{0,2,4,6}`; repeated `{1}`; numeric invalid `{3,5}`; missing ID `{7}`. |
| Change only r1.amount to 11 | Ordinary West sum `41`; entity sum unavailable; distinct MetricCard count still `3` | O1 conflict witnesses `{0,1}`; O2 representative `{2}` can still be included. |

West entity sum versus West/Web entity sum uses identical included entities `{O1,O2}` and value `30`, despite scope witnesses `{0,1,2,3}` versus `{0,2,3}`. This is the central M2 demonstration. The repeated row `1` is evidence of O1, not an additional counted entity.

Extend `comparisonCapture.test.ts` and `TraceComparisonPanel.test.tsx` with these literal units/witnesses, plus typed-key and conflict preservation. Extend `lib/aggregates.test.ts` only to show the new role metadata does not change existing values. Reuse the source-reorder invalidation test rather than add cross-refresh identity matching.

### Docs, example, browser acceptance, and risk

- In the same milestone, add entity/witness sections to `compare-values.mdx`, `metric-card.mdx`, and relevant bar docs.
- Add an **Orders once** variant to `/examples/compare-values` and a `compare-values-entities` live example in `docs/live/examples.ts`; register it through the same catalogue/coverage conventions.
- At 1280, 783, and 390 px, use pointer and keyboard to compare the two `30` entity sums, switch from entities to scope rows, and expand O1 to see both `r0` and `r1`. Then show the conflict case as unavailable without suppressing O2's evidence. Repeat close/resume and one-surface checks.
- **Main risk:** treating representatives as durable entity identity or revising conflict/missing-ID rules while adding explanation metadata. Completion requires exact entity overlap and all witness roles, with unchanged numeric results and docs/example included.

## 10. M3 — Parts, denominators, and selected additional mark contexts

### Shippable behavior

Extend capture to selected series bars and facet-specific bars only after reading their actual producer modules. For a percent mark expose **Part inputs** and **Denominator inputs** separately. For a stacked segment identify whether the displayed value is its raw segment amount, share, or top/bottom position; baseline parts are not the segment's own contributors.

This is an adapter extension, not a request to make averages additive or reconstruct ratios from guessed sets. Keep unsupported cases explicit.

### Exact modules and inspected-source boundary

- Read **`components/charts/BarChart/SeriesBarChart.tsx`** and **`components/charts/BarChart/seriesBarPlan.ts`** before implementing. The former is imported by the inspected BarChart consumer; the latter is named by the inspected agent guide. Their contents were not supplied, so no current series-producer behavior beyond the exposed `BarMark.stack` contract is asserted here.
- Extend `barTrace.ts`, `comparisonTypes.ts`, and `comparisonCapture.ts` with explicit part/denominator/baseline ledgers and typed operation/unit metadata.
- Reuse `BarMark.stack.total`, `share`, and `parts` only when the actual series planner establishes their relationship to the visible value. Preserve negative/invalid/zero-denominator behavior from that producer.
- Extend `comparisonSets.ts` and `TraceComparisonPanel.tsx` to compare like roles: part-to-part or denominator-to-denominator. Do not mix them into one shared-row total.
- For facets, pass exact `facetKey` and typed facet/group descriptors from the existing producer instance. Keep same-workspace/relation identity checks and source-local trace ownership.
- Extend the existing series plan tests discovered in that checkout and `comparisonCapture.test.ts`; use exact evidence from the current planner, not a parallel percentage computation in the feature.

### Exact denominator fixture

Using the same eight input rows and count reductions, create two new percent charts with **empty linked, workspace, and local filters**. In particular, do not inherit `web-region`'s local Web restriction; both denominators start from the unrestricted input relation.

- Left percent bar: group by **region**, split by **channel**, inspect **West / Web**.
  - Part scope/included `{0,2,3}`: count `3`.
  - West denominator scope/included `{0,1,2,3}`: count `4`.
  - Share `3/4 = 75%`.
- Right percent bar: group by **channel**, split by **region**, inspect **Web / West**.
  - Part scope/included `{0,2,3}`: count `3`.
  - Web denominator scope/included `{0,2,3,4,6,7}`: count `6`.
  - Share `3/6 = 50%`.
- Part partitions: Shared `{0,2,3}`, both exclusive sets empty.
- Denominator partitions: Shared `{0,2,3}`, Left only `{1}`, Right only `{4,6,7}`.
- The visible difference is `25 percentage points`, not a 25% relative increase. Identical numerator sets do not imply identical shares.

These are mathematical expected values for the proposed native count example. Confirm the current series planner emits the corresponding mark/denominator evidence before enabling that adapter. If it lacks that evidence, add metadata at its existing reduction boundary; do not create another percentage engine.

### Docs, example, browser acceptance, and risk

- In the same milestone, extend `compare-values.mdx` and `bar.mdx` with part/denominator roles and the `75%`/`50%` example.
- Add a **Same part, different whole** variant to `/examples/compare-values` and register `compare-values-denominators` as a live docs example.
- At 1280, 783, and 390 px, pointer and keyboard must reach the exact two segments, show identical part membership, switch to the denominator basis, and reach row `1` versus rows `4,6,7` without changing filters. Verify wrapped labels do not obscure role or percentage-point units. Facet capture must name the exact facet in both headers.
- **Main risk:** numerator-only evidence looks like a full explanation, or stack geometry is mistaken for a reduced value. Completion requires explicit dependency roles, preserved producer math, exact fixture values, and same-milestone docs/example.

## 11. What explicitly waits

- **D12, Explore:** a blank two-slot comparison launcher/global target picker. It may improve discovery but is not required to find the two supported values with current trace controls.
- **D13, Defer:** a full Rows-drawer evidence mode. The drawer's owner implementation is not in the packet. Inspect it before designing an explicit-data override that bypasses existing Rows filters/search and uses the single right-panel slot. M1 already provides complete paged evidence access.
- **D13, Defer:** card-only two-chart shortcuts and additional trace kinds. Every adapter needs a declared row/unit/dependency contract; being listed in `traceRowIds` is insufficient.
- **D14, Defer:** live updating pairs, comparison persistence/export/history, deleted-source retention, Swap sides, cross-refresh keys, cross-query or cross-grain overlap.
- **D15–D17, Avoid:** changing plain-click selection semantics, mark-level Inspect controls, a permanent comparison sidebar, another reducer/query engine, conflict-policy repair, filter normalization, causal narratives without evidence, or demand gates in place of implementation.

No public API, saved-schema migration, JSON/text syntax, or comparison history entry is needed for the chosen milestones. Existing chart export should remain unchanged except for omitting new inspection controls through its established convention.

## 12. Handoff status, files read, checks, downloads, and open questions

### Access status and files read

All **39 complete packet files** were available and read across the source review. The exact inventory is in [report.md — Files read](report.md#files-read): project rules/direction and R056/R051/R043; all supplied trace, reducer, population, filtering, data-layer, MetricCard, BarChart, preview/context/type files and representative tests; trace/filter/metric/bar docs; and the shop analysis example.

The source snapshot is not a complete runnable repository checkout. Files listed only by the agent guide, including docs/example registries and later series/Rows owners, require ordinary implementation-time inspection. They are not being cited as already inspected code, and no unknown Rows API is required for M1.

### Checks versus proposals

- **Executed here:** source-packet completeness/baseline check, complete source review, primary-documentation/paper research, independent exact arithmetic and set enumeration for the main native fixture, and consistency review of this design.
- **Not executed here:** implementation, pnpm builds/tests, a demo server, browser acceptance, export checks, or repository changes.
- **Proposed:** every new module/type/action/test/example and all milestone acceptance results. An arithmetic oracle is not a claimed application test pass.

### Downloads

- [report.md](report.md)
- [implementation-plan.md](implementation-plan.md)

Both are included in the accompanying ZIP. The implementation handoff consists of these two documents; no receipts, manifests, or hashes are required.

### Open questions

M1 is fully decided and does not wait on these questions.

1. After M1, should D12 add a transient launcher because header-only resumption is less discoverable? Default: keep the specified header route for the first release.
2. Should full Rows integration or the next additional trace adapter follow M3? Default: prioritize an adapter with an explicit existing evidence contract; do not add a generic fallback.
3. What durable identity should a separate future refresh/history initiative provide? Default here: clear on a new prepared-data epoch and never join runtime IDs across it.
