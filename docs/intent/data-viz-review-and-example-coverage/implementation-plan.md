---
title: "Data visualization review and example coverage — implementation plan"
slug: "data-viz-review-and-example-coverage"
phase: execution
status: current
last_updated: "2026-10-02"
---

# Data visualization review and example coverage — implementation plan

## Execution record

Implementation started on `codex/example-coverage-tickets` from `60edb84`. Tickets own current acceptance and remaining proof. The sections below record the planning baseline from 2026-10-01.

Coverage implementation is accepted at `daa5165`. All four coverage milestones are complete. Current [matrix proof](../../reviews/2026-10-02-feature-coverage-matrix.md) and [example reviews](../../reviews/2026-10-02-example-coverage.md) record browser acceptance. The manifest has 39 features, 37 with usage, two explicitly unsupported scales, and 37 reviewed assignments. All 11 chart types remain declared.

The drawer fixes are committed at `c0dd3ad`. The rapid Escape regression fails with the original handler and passes with the fix. Final `pnpm check` passes on Node 24: 375 package tests and 18 demo tests. The separate drawer ticket is also accepted. Its [independent report](../../reviews/drawer-details-placement-verification.md) proves all six criteria, including saved-layout reopen and empty-state recovery at 1280, 783, and 390 pixels. The report retains the zero-count pointer interaction observation. No required proof remains in this execution scope.

## Plan at a glance

The following sections preserve the planning baseline from 2026-10-01. Use the execution record above for current acceptance.

The initiative is active. The review skill, coverage manifest, checks, and demo matrix exist. The remaining work is to reconcile coverage declarations, review current examples, and close confirmed gaps.

| Milestone | Status | Remaining work |
| --- | --- | --- |
| 1. Useful chart-first reviews | Completed | Repeat reviews for current examples during milestone 4. |
| 2. Explicit and checked coverage | Completed | Update stale declarations during milestone 4. |
| 3. Rendered feature matrix | Implemented; proof incomplete | Verify the current matrix in the browser. |
| 4. Minimal example basis | Partly implemented | Reconcile the manifest, close gaps, and record passing reviews. |

The manifest contains 38 feature rows and 10 examples. All 11 registered chart types have declared examples. Twenty-four feature rows have declared usage. Fourteen have none. Fifteen gap notes remain, including a shared-scale gap on a feature that now has a declared example. No feature/example assignment is marked `reviewed`.

These are manifest counts, not a count of missing product features. Current configurations already contain meaningful titles, axis labels, and a saved Lorenz brush. Some declarations have fallen behind the code.

## Ticket links

- [exp-9e6a](../../../.tickets/exp-9e6a.md): Prove the feature matrix in the browser (milestone 3; independent root).
- [exp-2g7e](../../../.tickets/exp-2g7e.md): Reconcile example coverage with current evidence (milestone 4; independent root).
- [exp-3qd5](../../../.tickets/exp-3qd5.md): Close confirmed example gaps and record current reviews (milestone 4; waits for exp-2g7e).

The existing [eufr3-5ig1](../../../.tickets/eufr3-5ig1.md) is a separate, bounded feedback-round-2 cleanup root. Its six drawer, details, and placement follow-ups remain in that ticket. Each needs a current fix and proof or a supported recorded decision. It does not expand the example-coverage scope.

## Implementation strategy

Keep the existing skill, manifest, and matrix. Review current examples before adding samples or changing chart runtime code.

- **Primary seam:** `apps/demo/src/demos/coverage.ts` connects features to examples.
- **Fast local loop:** `pnpm --filter demo test` and `pnpm --filter demo build`.
- **Local dependencies:** Saved settings, bundled datasets, chart registry, and Vitest. No external service is required.
- **Proof:** Use tests for manifest integrity. Use rendered examples for visual quality, filter behavior, accessibility, and resize checks.
- **Rollback:** Keep repairs separate. Revert individual manifest, example, or matrix changes without changing unrelated examples.

## Milestone 1: The skill gives useful chart-first reviews

**Status: completed.**

The repository skill exists at `.agents/skills/data-viz-review/SKILL.md`. It covers critical gates, visual quality, semantics, tables, dashboards, interactions, and chart-family prompts. It cites local transcripts and requires visual inspection before source inspection.

[Baseline reviews](../../reviews/data-viz-example-baseline.md) cover line-chart, categorical-charts, and Lorenz at 1280 × 720. Each has a verdict, visible blockers, section judgments, and three fixes. All three failed. That result proves the skill found useful defects; it does not prove example quality.

### Desired end state

A reusable skill gives specific chart-first findings across simple, faceted, and coordinated views. This outcome is delivered.

## Milestone 2: Feature coverage becomes explicit and checked

**Status: completed.**

`coverage.ts` defines feature IDs, families, descriptions, implementation status, example intent, declared usage, and explicit gaps. `coverage.test.ts` checks registry agreement, example IDs, feature IDs, and required coverage or declared gaps.

The checks permit gaps. A passing test proves manifest integrity, not complete demonstration or visual quality. The registry still has 11 chart types, all represented in the manifest and example declarations.

### Desired end state

One manifest and its checks expose coverage and drift. This outcome is delivered. Current declaration accuracy belongs to milestone 4.

## Milestone 3: The demo renders the feature matrix

**Status: active. The view and tests exist; browser proof remains.**

`CoverageMatrix.tsx` is connected through `LandingPage.tsx` at `/?view=coverage`. It offers Needs attention, All features, and Example usage. The full matrix is available through an expandable section. Features have descriptions, family grouping, text status labels, and links to examples.

`CoverageMatrix.test.tsx` checks status text, gap visibility, detail disclosure, example navigation, and the advanced matrix. The recorded [example verification](../../reviews/data-viz-example-verification.md) explicitly excluded the matrix after concurrent changes broke that review session. No complete matrix browser proof was found in the inspected reports.

Remaining proof:

- Check the current views at wide, intermediate, and narrow widths.
- Check keyboard navigation, example links, detail controls, and matrix overflow.
- Correct or clarify the claim that feature and example reviews are separate records. Both currently derive from the same `reviewed` assignment.

### Desired end state

A maintainer can inspect coverage and reach its evidence examples. Tests establish the view structure; browser checks must establish usability.

## Milestone 4: A minimal example basis closes material gaps

**Status: active. Example repairs exist; coverage and passing reviews remain incomplete.**

Current examples have descriptive titles, dataset summaries, and stated capabilities. Saved configurations contain axis labels and units. Lorenz has saved Time and Z filters. Shop operations uses symlog scales. The large shop example declares shared facet scales.

The old `line-chart` and `tables` example IDs are absent from the current catalog. Use product-activity for the trend review and categorical-charts or NBA for the table review. Do not recreate removed samples only to match the old plan.

Work in this order:

1. **Reconcile existing evidence.** Review titles, axes, ticks, linear and categorical scales, saved filters, table formatting, shared scales, accessible names, and resize behavior. Add declarations only after the rendered example makes the feature clear. Remove obsolete gap notes.
2. **Correct scale vocabulary.** The manifest lists log and time, but the shared numerical scale uses linear or symlog. Shop's advertised log scales are symlog. Product activity uses a numerical day field. Confirm the relevant renderer before declaring true log or date-scale support. Add symlog coverage rather than crediting it as log.
3. **Close actual gaps.** Reuse examples for empty and invalid states where runtime support exists. Declare unsupported capabilities or explicit deferrals. Do not add new runtime features solely to complete the matrix.
4. **Run passing reviews.** Review at least one example from each feature family. Clear critical blockers before changing usage to `reviewed`. Keep a review date and short evidence note with each recorded result; these fields do not exist yet.

The [September verification](../../reviews/data-viz-example-verification.md) reported clipped text, contradictory Lorenz totals, restore problems, and hidden table columns. Later [workspace polish](../../reviews/chart-workspace-polish.md) reports repairs to brushes, tables, layouts, and interactions. Current Lorenz prose also uses the corrected 159-row count. Treat old failures as historical evidence. Reproduce them before calling them current defects.

### Desired end state

Every required feature is intentionally shown or explicitly deferred. Each reviewed feature has current rendered evidence and no critical blocker. New examples exist only for confirmed gaps.

## Cross-cutting verification

On 2026-10-01, all 18 demo tests passed, including the manifest and matrix checks. The command ran with `pnpm_config_verify_deps_before_run=false` to use installed dependencies. The first attempt triggered an automatic install and stopped before tests ran. The passing run reported an existing React `act(...)` warning in the landing-page suite.

This audit inspected code and existing reports. It did not run a new browser review or production build. Neither milestone 3's browser proof nor milestone 4's visual acceptance is complete.

After implementation changes, run the relevant tests and build. Run `pnpm check` after broad changes. Keep visual acceptance separate from test success.

## Open decisions and spikes

No human decision blocks the next step. Reconcile the existing manifest against rendered examples first. Keep the matrix in the demo. Use compact review metadata with links to evidence.

## Below the cut line

Screenshot regression infrastructure, automated visual scoring, combinatorial example generation, new chart types for breadth, and public article generation remain deferred. A separate mobile product expansion remains outside scope. Narrow-width checks still apply to changed flows under current project rules.
