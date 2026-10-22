---
title: "Agreement across charts, selections, and saved state"
slug: "current-analysis-trust"
phase: intent
status: current
last_updated: "2026-10-22"
---

# Agreement across charts, selections, and saved state

## My read

Analysts should trust that linked views describe the same rows and use compatible metric definitions. A chart menu with eighteen types does not prove that a complete analysis works. The useful comparison with established exploration tools is one uninterrupted task: select a segment, read its measures, inspect its records, export it, undo the change, and restore it.

This initiative captures new verification work around existing behavior. It does not reopen retired chart expansion or treat a waived check as a failure. The strongest outcome is a small set of reproducible tasks with exact values, source membership, and settings. Record failures as bounded repairs. Keep delivered features delivered unless new evidence shows a defect.

This is a near-term candidate because it extends an existing workflow. The suggested first proof is not an implementation plan.

## What matters most

- Use source membership and numeric contributors as separate checks.
- Verify current history, restore, export, and filter scope together.
- Measure one named workload before making speed claims.

## The intended experience

Use a small order fixture with missing measures, typed category keys, and dates at UTC boundaries. Compare a bar, heatmap, card, trend, distribution, and source table. Inspect contributors, export the selection, undo and redo, then reopen the saved analysis. Repeat with one calculated measure so edited formulas reach the same consumers.

## Boundaries

Historical browser reports are useful context, not a fresh pass. The Pro browser session was blocked before the app ran. Preserve zero, empty, missing, and invalid results. Check keyboard access and wide, intermediate, and narrow layouts. Avoid a universal certification matrix or an optimization project before an observed failure.

## What seems settled

The current request seeks worthwhile gaps. Evidence repair is worthwhile where the October 4 waiver or October 5 browser block left a real decision unresolved.

## Current reality that matters

The registry has eighteen types. Shared reductions, chart traces, saved-view history, and local storage exist. The current checkout is newer than both Pro reports. No fresh runtime or browser check was run for this intent capture.

## Expansion trigger

Expand only when a fixture exposes disagreement, a restore changes the result, or a named workload misses an agreed response target.

## Local trust journey: covered

The first proof now runs as automated tests, and it passes. It is no longer a prerequisite for other work. The fixture has five orders; the selected category, Tools, has three source rows (O-101, O-102, O-103) and two numeric contributors, because O-103 has no revenue: sum 12, mean 6.

- `packages/explorEDA/src/test/providers/localTrustJourney.test.tsx` clicks the Tools bar, then checks that the filtered row IDs, the bar's pressed state, the sum and average cards (with "1 excluded"), the table rows, and the table's CSV download agree. It reads the bar and card traces' contributor rows, saves the analysis through `saveAnalysisToStructure` and its JSON text, reopens it with `restoreAnalysisFromStructure` in an empty workspace, and repeats every check.
- `apps/demo/src/localTrustJourney.test.tsx` makes the same selection in the demo's `SavedViewsWorkspace`, undoes and redoes it, and reopens the locally saved session to the same rows and values.
- `apps/demo/e2e/trust.e2e.ts` (Playwright project `trust`, part of `pnpm --filter demo docs:verify`) does it with real clicks: it pastes the analysis JSON on the landing page, selects Tools, reads the cards and table, downloads the CSV, presses Undo and Redo, copies the full analysis JSON, and reopens it in a fresh browser.

Further work can extend this fixture: a second chart family, a calculated measure, typed category keys, and dates at UTC boundaries.

See the [reference packet](references/README.md) and [comparison collection](../comparison-opportunities/README.md) for context.

## Analytical handoff research, 2026-10-20

The [handoff review](../../research/analysis-handoff-2026-10-20/README.md) keeps this local proof first.
Compare source, linked selection and table-search populations separately: the proposed fixture has 7/5/2 rows and totals 100/35/15.
Ordinary native export includes source rows; project-view export retains whole included tables.
The proposed parameter-option and unused-binding closure probes remain unrun.
Verify them before claiming complete reopening. A reproduced failure earns a bounded repair, not a new format.
Author, browser and recipient acceptance remain proposed.

## Histogram boundary proof, October 21

[Engineering-boundary research](../../research/engineering-bins-2026-10-21/README.md) identifies a separate endpoint question after the first local trust task.
Source bins exclude interior upper endpoints; linked numeric ranges include them. The fixture predicts four versus six matching rows.
This is source and arithmetic evidence, not a runtime defect. Compare the actual mark, trace, stored predicate and stable record keys.
Start without local filters or facets. Check those populations separately, then test count edits and the declared restore path.
Any confirmed repair needs its own scope. It does not approve authored histogram boundaries.

## R026 value accounting review, October 21

Keep category and measurement rules separate. Name population, stage, type, and operation for each count.
Numeric conversion can report failures that later become effective missing values. Both stages can reconcile without equal labels or totals.
R026 local probes reproduce three bounded disagreements: categorical count versus missing predicate, host-type preview versus Apply, and absent-property batch versus trace.
These are helper/provider/manager results, not browser confirmation or implemented repairs.
Review each repair locally. Keep the shared classifier deferred and the universal state model rejected for this mission.
A visible repair must include fields/summary/calculated-fields guidance and its runnable example in the same milestone.
See the [R026 research](../../research/missing-state-accounting-2026-10-21/README.md) and [six decisions](../../research/missing-state-accounting-2026-10-21/decisions.md).

## R043 entity-grain review, October 21

Keep source-occurrence identity and selected-value identity separate. Compare exact partitions before requiring aggregate agreement.
Three local research probes reproduce measured-count conflict disagreement, intentional missing/duplicate-key differences, and card trace row wording.
The proposed repair makes a measured count unavailable when one entity has conflicting values. Its policy remains for implementation review.
Preserve ordinary count eligibility, independent equal-valued events, typed keys, and complete group references.
Test diagnostic details and prior-stage navigation before expanding contributor records. Defer helper extraction and optional upstream recipes.
No application repair, new lesson, or runnable example shipped. Browser and author proofs remain pending.
Each visible milestone pairs project-folders or metric-card guidance with the proposed entity-grain example in the research folder.
See the [R043 research](../../research/entity-grain-2026-10-21/README.md) and [six decisions](../../research/entity-grain-2026-10-21/decisions.md).
