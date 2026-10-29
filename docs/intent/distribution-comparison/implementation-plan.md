# Compare two distributions in ECDF

Build an optional comparison of two explicit groups in the existing ECDF chart. Start with their largest cumulative-share gap. Add Wasserstein distance, then signed percentile differences. Each milestone ships with record traces, saved settings, documentation, and a runnable example.

Status: proposed for review; no feature code is implemented. [Research and local dispositions](../../research/distribution-distance-2026-10-28/README.md). Pro reviewed `9d64a021`; local integration checked current main `6796a753` on October 29, 2026.

## Shared contract

- Reuse `field` and `colorField`. Add optional `compareEnabled`, `compareAKey`, and `compareBKey` to `Ecdf/definition.ts`. Keys use `categoryKey`, including its missing and nonfinite category encodings. Number `1` and text `"1"` stay distinct.
- Save only choices and existing chart settings. Keep sorted values, memberships, exact integers, results, and inspection state transient.
- No automatic pair choice. Equal or incomplete keys produce an incomplete state. A valid key absent from current data stays selected and shows zero rows. A grouping-field edit clears both keys in one action. Disabling comparison preserves them.
- Build both curves and statistics from the same prepared population: chart `localFilters`, workspace filters, peer linked filters, and facet membership. Exclude every filter owned by this ECDF. In `localSelections` mode, peer chart selections do not condition the pair; workspace filters still do.
- Enumerate choices from uncapped chart-local `allIds`. Draw the two actual groups, including those outside the ordinary ten-curve cap. Suppress generated Other and Overall while comparing. Preserve their ordinary-mode settings and the chart-local source x domain.
- Explicit facet `[]` means empty curves and empty statistics. The current live-ID hook treats it as unrestricted; handle this narrowly at the ECDF comparison boundary.
- Use `numericExclusionReason` and `parseNumber` on provider-prepared columns. Keep candidate, valid, and excluded counts per side. Other categories are outside the pair, not exclusions. Empty valid groups make every statistic unavailable. Singletons and constants are valid.
- Choosing A/B adds no filter. Preserve the existing range-only `commit`: a threshold can select rows outside A/B. State this beside the selection. Pair denominators and workspace selected-row counts have different meanings.
- Invalidate results and open traces on source, preparation, population, field, pair, or relevant display-direction changes. Include these in the trace revision. Never cache across refresh using only counts or positional IDs.
- Use current-source IDs for trace tables. `AggregateContributorTable` pages records; it does not provide a bulk Rows handoff. Reuse it without inventing that API.
- Use Alt-click, Alt-Enter, and header trace targets. Route new mark events above the existing transparent slider. Inspection and interval navigation must not write settings or undo history.
- Keep A/B names, counts, scope, units, and results visible without hover. Give each side a label and line pattern. Verify input at 1280, 783, and 390 pixels.
- Put the persistent summary inside the captured panel, outside `data-export="omit"` ancestors. `rasterizePanel.ts` captures HTML and SVG, but hides marked editor chrome. Keep export controls and hover hints omitted.

Paths below start at `packages/explorEDA/src/`, unless stated otherwise. New module names are proposals, not required abstractions.

## Numerical contract

Sort finite observations by value, then ID. Consume both complete tie blocks at each union support value. Store sorted entries and run offsets once; materialize record subsets when requested.

For adjacent supports `[l,r)`, let `a` and `b` count values at or below `l`, and let `n` and `m` be valid group sizes:

```text
d = BigInt(n) * BigInt(m)
q = BigInt(a) * BigInt(m) - BigInt(b) * BigInt(n)
D = max(abs(q)) / d
W1 = sum(abs(q) * (r-l)) / d
Q(p) = sorted[ceil(p*N)-1]
delta(p) = QB(p) - QA(p)
```

Use exact integer cross-products to choose all tied maximum intervals. The first lower endpoint is canonical. For below display, inspect `l` with inclusive `<=` counts. For above display, inspect `r` with inclusive `>=` counts and reverse the signed gap. Negating the right-continuous gap at the same endpoint is wrong. At `D=0`, show matching empirical distributions without a special maximum marker.

Show `100*D` in percentage points. Show W1 and signed differences in field units. Keep all statistics independent of axis scale, size, palette, and formatting. A log display does not change the observations. Do not encode W1 as screen area on a log axis.

Use a small ECDF-local exact arithmetic helper. Every finite binary64 value is `I(x)*2^-1074`. Decode its sign, stored exponent `e`, and fraction `f` with DataView:

```text
I(x) = signed f                         if e == 0
I(x) = signed (2^52 + f) * 2^(e-1)     otherwise
T = sum(abs(q) * (I(r)-I(l)))
W1 = (T/d) * 2^-1074
```

Keep zero, finite, positive-below-range, above-range, and empty states distinct. For W1, `0<T<d` is positive below Number.MIN_VALUE. `T>d*I(MAX_VALUE)` exceeds the finite range. Check these bounds before rounding. An interval width may exceed range while its weighted contribution remains finite.

For finite `T/d` in minimum-subnormal units, find its exact floor binary exponent `e` using integer bit lengths and comparison. Set `s=max(0,e-52)`. Divide `T` by `d*2^s`. Round the quotient using remainder comparison and ties to even. Return `Number(quotient)*2^(s-1074)`. Use the same converter for D after shifting its numerator by 1074 bits, and for signed quantile differences. Require positive safe-integer input counts and convert operands before multiplication. Never convert an oversized numerator directly to Number.

These guarantees cover prepared binary64 inputs. They cannot recover precision lost in ingestion. Format nonzero small values with enough digits to avoid a false displayed zero. Keep full endpoint precision available in traces. An undrawable extent must leave the mathematical result and trace available.

## M1 — Explicit pair and largest share gap

Deliver A/B controls, the two curves, exact maximum intervals, and both numerator and denominator records. Save, restore, and export this complete capability before adding later metrics.

1. Extend `Ecdf/definition.ts`, `EcdfSettingsPanel.tsx`, and `utils/saveDataUtils.ts`. Validate optional boolean and canonical key shapes. Accept incomplete but well-formed choices. Do not make validation depend on setting order or current group availability.
2. Add focused preparation and gap planning in `Ecdf/ecdfComparisonPlan.ts`. Integrate it with `ecdfPlan.ts` and `EcdfChart.tsx`. Share pair input between curves and statistics. Keep normal ECDF mode unchanged.
3. Add the rational conversion portion of `Ecdf/distanceArithmetic.ts`. Keep exact count fractions for maxima and trace counts. Sorting plus merging uses O(N log N) time and O(N) space; no cumulative ID copies per interval.
4. Add a compact persistent readout. Let users navigate all tied maxima without filtering. Preserve empty-side counts instead of taking the existing early empty-chart return.
5. Extend `ecdfTrace.ts`, `trace/traceTypes.ts`, and `trace/ChartTracePanel.tsx`, with a focused comparison trace body. Supply A/B numerator, denominator, endpoint-tie, and exclusion tables. Zero numerator is a real result. Do not assign one causal row set to a distribution difference.
6. Register the three settings in `lib/dsl/settingKeys.ts`. Use `paths.ts` quoted string encoding and generic compile/export. Do not encode typed groups as `where` values: those currently match through `String(raw)`. Exempt all three settings from notebook alias rewriting in `lib/notebook/writeBack.ts`; preserve them through type changes.
7. Each A/B choice or Swap uses one `updateChart` call. Verify callback, savedData echo, notebook splice/recompile, and undo behavior. Local inspection emits no callbacks.
8. Suppress ordinary direction-dependent quantile markers while comparing in M1/M2. Preserve `showQuantiles` for M3; hide a control that has no effect in the current mode.

Docs and example in this milestone: extend `apps/demo/src/docs/pages/ecdf.mdx` with Compare two groups, Largest share gap, Filter scope, and Trace the counts. Register `/examples/distribution-comparison` in `apps/demo/src/demos/examples.ts` and coverage. Add a focused dashboard and CSV under `apps/demo/public/datasets/`, plus live example `ecdf-compare-gap` in `apps/demo/src/docs/live/examples.ts`. Add settings descriptions. Use header trace controls in live scripts; add a typed step only if existing steps cannot express the flow.

Acceptance: use the exact cases below. Check own versus peer/workspace filters, local selection mode, empty facets, typed identities, uncapped groups, absent-group retention, malformed saves, old saves, and source refresh with unchanged counts/IDs. Check roundtrips and input/export at all three widths. Main risk: curves, statistic denominators, and linked row selection diverge.

## M2 — Wasserstein distance and interval explanation

Extend the same planner, readout, arithmetic helper, and trace. Add no setting or general statistics engine. Accumulate exact binary widths before division. Show original-unit W1 and explicit range states.

The interval ledger exposes bounds, cumulative counts, width, contribution, and contribution share. Compute the share from exact interval/total integers, not separately converted Numbers. At total zero, omit shares. Page the ledger while computing the full total. Inspect cumulative, denominator, and endpoint rows separately. An open interval can contain no observations despite a positive contribution.

On linear display, an optional area fill can explain the integral. On log display, use boundary/gap guides and an original-unit note. Inspection does not install filters or create notebook/history writes. Measure representative browser latency before considering workers; preserve the exact contract if scheduling changes.

Docs and example: add Average value distance, Inspect an interval, and Units and log display to `ecdf.mdx`. Extend the same dashboard with crossing and tail cases. Add live example `ecdf-compare-distance` and coverage in this milestone.

Acceptance: compare against an independent probability-space exact transport oracle. Cover ties, unequal sizes, offsets, replication, and all extreme cases below. Check trace subsets, linear/log behavior, source invalidation, and exported results at all widths. Main risk: intermediate overflow or a misleading area metaphor hides a valid result.

## M3 — Signed percentile differences

Extend the same planner/readout/trace with `QB-QA` at 1/10, 1/2, and 9/10. Compute ranks by integer ceiling division, with operands converted before multiplication. Use inverse-ECDF type 1, including the lower middle value for an even group. Do not substitute D3's interpolated quantiles.

Use exact dyadic subtraction and signed above-range status. Swapping groups negates differences; above/below display never changes them. Trace each rank, value, full tie block, and denominator. Source-ID ordering does not choose a uniquely responsible tied record.

In comparison mode, `showQuantiles` now controls canonical lower-tail percentile guides. Place any curve marker at its actual inclusive `shareAt(Q(p), direction)`, not automatically at p. Keep ordinary ECDF behavior unchanged.

Docs and example: add Where groups differ, Percentile convention, and Ties and repeated rows to `ecdf.mdx`. Extend the same dashboard and coverage with live example `ecdf-compare-quantiles`. Show the crossing case's `[+1,+1,-1]` result.

Acceptance: verify exact triples, signs, odd/even ranks, ties, uniform replication, display independence, save/notebook roundtrips, all input widths, and export. Main risk: interpolation or direction silently changes the reported median.

## Exact proof cases

These are future acceptance requirements. Local standalone arithmetic checks support the expectations; they do not prove a feature implementation.

| A            | B            | D           | W1          | B-A at 10/50/90 |
| ------------ | ------------ | ----------- | ----------- | --------------- |
| `[0,2]`      | `[0,0,2,2]`  | 0           | 0           | `[0,0,0]`       |
| `[0,1,2]`    | `[1,2,3]`    | 1/3         | 1           | `[1,1,1]`       |
| `[0,3]`      | `[1,2]`      | 1/2         | 1           | `[1,1,-1]`      |
| `[0,0,2]`    | `[0,1]`      | 1/3         | 1/2         | `[0,0,-1]`      |
| `[5]`        | `[8,8,8]`    | 1           | 3           | `[3,3,3]`       |
| `[0,0,0,10]` | `[0,0,0,20]` | 1/4         | 5/2         | `[0,0,10]`      |
| `[0,3]`      | `[1,2,4]`    | 1/2         | 7/6         | `[1,2,1]`       |
| `[2]`        | `[2,4]`      | 1/2         | 1           | `[0,0,2]`       |
| `[0,0,3]`    | `[1,2]`      | 2/3         | 7/6         | `[1,1,-1]`      |
| `[0]`        | `[0,2]`      | 1/2         | 1           | `[0,0,2]`       |
| empty        | any          | unavailable | unavailable | unavailable     |

For the crossing case, maxima are `[0,1)` and `[2,3)`, with signs + and -. At below threshold 0, A counts 1/2 and B 0/2. The corresponding above threshold is 1: A counts 1/2 and B 2/2. The nonzero Wasserstein contributions are 1/2 on each outer interval. No observations lie strictly inside those intervals.

Repeat that case after adding `2^52`: D and W1 remain 1/2 and 1. Apply `2*x+7`: D stays 1/2, W1 becomes 2, differences become `[2,2,-2]`. Uniformly replicate either whole group: the measures stay unchanged.

With `M=Number.MAX_VALUE` and `s=Number.MIN_VALUE`, require:

- Identical `[-M,M]` groups: exact zero, without `0*Infinity`.
- A=`[-M,M]`, B=`[M,M]`: D=1/2, W1=M finite; width and first two quantile differences exceed range.
- A=`[-M]`, B=`[M]`: D=1; W1 and differences exceed range.
- A=`[0,0,0]`, B=`[0,0,s]`: D=1/3; W1=s/3 is positive below range; differences `[0,0,s]`.
- Prepared `2^53` and `2^53+1` Numbers compare equal; no lost integer precision is recovered.

Population fixture: rows `(group,value,region)` are `(A,0,W)`, `(A,3,W)`, `(B,1,W)`, `(B,2,W)`, `(A,null,W)`, `(B,true,W)`, `(C,100,W)`, `(A,2,E)`, `(B,4,E)`, with IDs 0 through 8. Under peer Region W, valid IDs are A `[0,1]`, B `[2,3]`; exclusions are `[4]` and `[5]`. Own x<=0 leaves the comparison unchanged. Peer/workspace x<=0 empties B. Facet `[1,2]` gives A `[3]`, B `[1]`, D=1 and W1=2. Facet `[]` empties both. Check actual CSV preparation; use typed planner fixtures for boolean and mixed number/text group distinctions.

## Verification and release

Run focused ECDF, persistence, DSL, notebook, and export tests. Run demo coverage and Dashboard-text roundtrips after adding the example. Run `pnpm --filter demo docs:check`. Verify real input and image export with the repo's `pnpm shot` and export-proof tools. Use the exact command forms in `docs/agent-guide.md`.

Each implementation milestone needs a user-facing changeset and full `pnpm check` before its PR. This research-only PR needs doc/format checks, without a changeset or full build. No runtime, browser, persistence, or performance acceptance is claimed here.

Keep inference, weights, generated Other/Overall references, default normalization, frozen cohorts, cross-source comparison, and a generic result engine outside these milestones. The [local dispositions](../../research/distribution-distance-2026-10-28/README.md) explain each boundary.

## Preserved Pro result materials

[Original Pro reports and artifacts for #554](assets/pro-results/distribution-distance-2026-10-28/ASSET_INDEX.md)

All extracted result materials are preserved without ZIP containers. Original bytes and attribution are unchanged.
