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
