---
title: "Progressive built-in charts — implementation plan"
slug: "progressive-built-in-charts"
phase: plan
status: proposed
last_updated: "2026-10-16"
---

# Progressive built-in charts — implementation plan

## Plan at a glance

Prove existing built-in routes before adding features. Then add ordered Scatter connections, repair supplied Line intervals, and complete Heatmap histories.
Each milestone leaves a useful chart and a separate reviewable PR. Implementation remains proposed; this research PR changes no product code.

The first proof tests the assumption that composition is necessary. Existing Scatter, percent Bar, and stacked-area Line cover four examples.
Their report styling and PNG output can differ. Preserve the authored examples while proving ordinary authoring and source trace behavior.

The first new feature is a driving trajectory ordered by Year. It must preserve reversals along the numeric X axis.
Start with straight connections and original row identity. Add grouped paths and comparison presets only after that contract works.
The interval repair and Heatmap changes can proceed independently once the first proof establishes the acceptance approach.

Do not make all 26 recommendations one release. The specialist modes and later extensions remain below this plan's cut line.

## Implementation strategy

- **Primary seams:** Existing chart definitions, settings panels, pure plans, renderers, and source trace objects.
- **First data:** Included CSV snapshots plus small fixtures for missing rows, invalid values, and changed denominators.
- **Fast local loop:** `pnpm --filter exploreda exec vitest run <affected-test-file>` and `pnpm --filter exploreda check-types`.
- **Browser loop:** `pnpm --filter demo dev` uses library source. Use local sample data; no external service is required.
- **Persistence:** Extend existing settings, validators, defaults, and `lib/dsl/settingKeys.ts`. Use `updateChart` and existing edit transactions.
- **Rollback:** Each optional mode is independently revertible. Keep ordinary defaults and all composition examples; introduce no state migration.

No provider, emulator, database, or deployed proof is needed. Use the real local chart/store boundary for interaction checks.
Keep tests focused on source identities, numerical meaning, and failures that could change the result.

## Milestone 1: Four existing routes become the primary analytical lessons

Add counterparts through [the demo registry](../../../apps/demo/src/demos/examples.ts) and [dashboard definitions](../../../apps/demo/src/demos/dashboardSettings.ts).
Use Scatter for income/life, percent Bar for media/deaths and Du Bois, and monthly summed stacked-area Line for unemployment.
Keep their original composition examples linked as advanced authored graphics.

Use current public controls, including Country-keyed Notes. Do not add a label engine or new chart type for this milestone.
Correct source-scope descriptions only where [the evidence checks](source-checks.md) establish the mismatch.
Keep any log-zero behavior fix separately scoped from counterpart and caption work.

Verify representative point and denominator traces, linked filters, save/reload, and Dashboard text round trips.
Check all four through the public UI. Record image-output differences separately; screenshots do not prove Copy PNG parity.
If a route loses an essential comparison, revise that verdict before changing the primary lesson.

### Desired end state

- Users discover four ordinary chart routes without composition authoring.
- Numerical values, source grain, and denominator meaning remain correct.
- Both the ordinary route and authored composition remain available.

## Milestone 2: Driving and grouped comparisons use ordered Scatter connections

Extend [Scatter settings](../../../packages/explorEDA/src/components/charts/ScatterPlot/definition.ts) and its settings panel.
Start with Connect observations, Order by, optional Group by, and straight paths.
Prepare ordered valid runs before drawing; preserve original IDs and reasons for omitted observations.
Use [the point plan](../../../packages/explorEDA/src/components/charts/ScatterPlot/planScatterPoints.ts) for endpoint coordinates and source identity.
Do not reconstruct identity from pixels or reuse raw Line's X-sorted anonymous coordinates.

Extend [ScatterSvg](../../../packages/explorEDA/src/components/charts/ScatterPlot/ScatterSvg.tsx) so non-size points and paths have deliberate pointer and keyboard activation.
Keep brushing, Notes, and empty-plot clearing consistent. Specify how filters affect path continuity.
Expose the same evidence through endpoint, segment, and group traces.

Prove shuffled driving rows, one invalid middle row, an X reversal, a linked filter, and local axis clipping.
Accept only when chronological order and exact source IDs survive each case and settings restoration.
Then add grouped paths for all 34 tax countries and 67 occupation pairs, with a declared path color rule.
Use existing fixed bounds, numerical colors, and manual facet ordering for jobs.

After the basic proof, add slope endpoint labels and two-role Paired dots within this milestone.
For Pew, disable jitter, use supplied topic order, and name both roles and difference direction.
An absent endpoint has an unavailable difference. A duplicate role requires an explicit resolution.
Prove +14 percentage points for Spirituality, role reversal, missing roles, and duplicate roles.
Do not silently recompute the tax CSV's supplied changes from its rounded endpoints.

### Desired end state

- Driving paths follow Year without forced X sorting.
- Grouped paths preserve occupation/country identity; paired comparisons expose clear endpoint roles.
- Unconnected Scatter remains the default and works independently of these additions.

## Milestone 3: Supplied Line intervals preserve bounds, gaps, and evidence

Extend [the existing interval resolver](../../../packages/explorEDA/src/lib/annotations/resolve.ts), its point metadata, and the current annotation renderer.
Retain lower/upper field names, source IDs, invalid/reversed states, and distinct valid runs.
Include interval bounds in the intended automatic Line domain before projection. Explicit view limits still clip.
Use existing Notes types, editor, validation, and persistence; add no second interval system.

Start with separate charts for the two forecast measures. This avoids making general facet-scale work a prerequisite.
Prove four supplied bound pairs, an extreme upper bound, an invalid interior pair, reversal, and duplicate X values.
Name the input policy; do not estimate forecasts or average percentile bounds implicitly.
Trace a band to its contributing records and fields. Verify saved/text restoration and edit cancellation.
Only then evaluate independent Y scales inside a single faceted counterpart.

### Desired end state

- Users author a correct fan through Notes → Interval.
- Gaps remain gaps; displayed bounds and source traces agree.
- Ordinary Line and existing Notes remain usable without the new interval details.

## Milestone 4: Heatmap shows complete histories with stable color meaning

Extend [Heatmap settings](../../../packages/explorEDA/src/components/charts/Heatmap/HeatmapSettingsPanel.tsx) and [its planner](../../../packages/explorEDA/src/components/charts/Heatmap/heatmapPlan.ts).
Separate row and column limits and order. Add date bins with exact original contributors and date-interval selection.
Show all 72 message months and 85 measles years without an undisclosed cutoff.

Resolve layout density with a saved-size trial. Use a local viewport if a complete matrix becomes unreadable.
Keep every column reachable by keyboard. Distinguish absent combinations, present invalid measures, and valid zero.
The current measles fixture contains a row marked absent; create a truly absent test pair instead of treating its label as behavior.

Replace Heatmap's isolated live-value ramp with an explicit aggregate-domain policy using existing numerical color math and controls.
Support shown cells, all-source aggregate cells, or fixed bounds. Do not derive count-cell domains from a raw field extent.
Prove elections with fixed -40/0/40 bounds and messages with a declared zero-aware transform.
After filters, the same value must retain the declared meaning in color, legend, readout, and trace.

Add Notes projection, row totals, and custom color stops only as later independent refinements.
An exposed settings tab without a renderer projection does not complete annotation support.

### Desired end state

- Complete message and measles histories are reachable in an ordinary Heatmap.
- Date/cell selection retains exact original rows and missing-state meaning.
- Elections can use a stable signed color scale; geographic placement remains an advanced composition.

## Delivery

The four milestones are open as stacked PRs on this one. Byron asked for the plan's four milestones without broad rewrites or sprawling settings, so each one adds a small, optional set of controls to the chart that owns the operation.

| Milestone              | PR   | Delivered                                                                                                                                                                         | Left out, with the reason                                                                            |
| ---------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 1. Existing routes     | #447 | Four built-in counterparts, cross-linked with their compositions; a "Before you compose" docs section; dense time series no longer draw a dot per period                          | Bubble legend number format; the coverage matrix's stale `scale:log` status                          |
| 2. Scatter connections | #448 | `connect` (order, group, end/both labels); paths break at filtered or unplotted rows; band axes center when connected; path trace; four counterparts                              | Signed paired differences and Scatter category order: each needs its own setting                     |
| 3. Line intervals      | #449 | Bounds widen the domain; runs split at missing bounds; outer bounds at a repeated X; date X; evidence in Notes; Line domains follow chart-local filters; forecast fan counterpart | A band-to-records trace, since annotations have no trace route; one faceted chart with free Y scales |
| 4. Heatmap histories   | #450 | Per-axis limits and order; source order; date bins with date-range selection; fixed color ends and square root; dense label thinning; three counterparts                          | Heatmap Notes projection, row totals, color stops, and a scrolling viewport                          |

## Cross-cutting verification

For each new interaction, verify pointer and keyboard selection, Alt-trace, empty-space clearing, local limits, and linked filters.
Verify one committed edit produces one undo step; cancellation restores the prior state.
Check save/reload and Dashboard text. Use the few numerical fixtures that exercise real failure points.
Check changed flows at wide, intermediate, and narrow widths. Use `pnpm shot` for PR screenshots.

Run `pnpm check:ui` during UI work. Run `pnpm check` once before each milestone PR, without concurrent package builds.
Use Node 24, pnpm, package changesets for library behavior, and one PR per milestone or independently useful sub-slice.
Current research validation is recorded separately in [source checks](source-checks.md); proposed acceptance is not claimed complete.

## Open decisions and spikes

- **Dense matrices:** Compare compact labels with a local viewport on both full datasets. Fall back to an honest viewport.
- **Interval trace access:** Fit band evidence into the existing Notes/chart trace route. Reject duplicate inspection systems.
- **Connection filters:** Prove whether removed observations break paths. Save and explain the selected rule before releasing connections.

## Below the cut line

The [recommendation decisions](recommendation-decisions.md) retain all later options and their reopening conditions.
They include exact grouped-date Line, compact/focus facets, numeric normalized areas, cohort summaries, horizontal/mirrored Bar, Swarm, and Mosaic.
Ridgelines and supplied-lane intervals need their own numerical and interaction proofs.
Unit cells, ranks, Horizon, tiles, rich tables, stream baselines, label automation, and ordinary image export remain separately gated.
No general composition compiler, duplicate Notes model, automatic example deletion, release, or deployment belongs to this plan.
