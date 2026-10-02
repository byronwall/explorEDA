---
id: exp-2g7e
status: closed
deps: []
links: []
created: 2026-10-02T03:56:14Z
type: task
priority: 2
assignee: Byron Wall
external-ref: data-viz-review-and-example-coverage:m4-reconcile
tags: [example-coverage, manifest, review]
---
# Reconcile example coverage with current evidence

## Outcome
The coverage manifest states what current examples intentionally show. Obsolete gap notes no longer make real examples look absent, and unverified capabilities get no credit.

## Likely Steps
Inspect rendered examples and saved settings before editing declarations. Check titles, axes and ticks, categorical and numerical scales, saved filters, table formatting, shared facet domains, accessible names, and resize behavior. Distinguish symlog from true log and numerical day plots from date scales. Record confirmed gaps and explicit deferrals for the next ticket.

## Ready Gate
Confirm the current example catalog, feature IDs, registry, review rubric, and browser target. Use current evidence; the old line-chart and tables IDs are gone. Historical review failures require reproduction before reuse.

## Proof and Cut Line
The manifest check passes and each changed declaration points to current rendered evidence or an explicit gap. Keep the 11 chart types covered. Do not add examples, chart runtime features, or every feature combination for declaration counts.

## Provenance
Initiative data-viz-review-and-example-coverage; selected shape uses one typed manifest and a minimum example basis; implementation plan milestone 4, reconciliation step; baseline 22a9bd3694cf208c63911291a5926c3c5a367be0. Current manifest has 38 features, 10 examples, 14 rows without declared use, and 15 gap notes.

## Notes

**2026-10-02T04:18:38Z**

Execution checkpoint: current catalog has ten examples and 38 feature IDs. The browser shows 15 open gaps, 24 features with evidence, and separate pending review states. The order-book view labels its symlog axes; product-activity uses numeric day ticks. Next: reconcile declared features and example evidence against saved settings and rendered views, retaining all 11 chart types.

**2026-10-02T04:37:32Z**

Execution checkpoint — reconciliation accepted

Checked in `/Users/byronwall/.codex/worktrees/example-coverage-tickets/explorEDA` on `codex/example-coverage-tickets`, HEAD `c0dd3adbc8d7051794fd5302e99748aa8eae9a70`, with the user-authorized source edits listed below. No package runtime code changed.

Reconciled the manifest from 38 to 39 feature IDs. The 11 registered chart types remain covered. Added explicit symmetric-log support; set true logarithmic and date-based time scales to not supported. Linear and band scales are supported. Product activity's 0–90 day values remain numeric, not a time scale. Removed unsupported claims that called order-book symlog axes “Log scales”.

Rendered evidence: shop operations labels Revenue ($) and Margin ($) with “symlog” and uses those axes in the saved dashboard; the catalog uses categorical positions, a removable Sports query chip, and a two-way facet grid; product activity labels Day of study with numeric 0–90 ticks; NBA shows sorted, grouped player values; `shop-10000` shows North and South facets with the same Order sequence 0–10,000 and Revenue ($) 0–25,000 ticks. Lorenz saved filters show Time 0.20–1.00 and Z 10–30, with 164 of 1,000 rows. Source data independently confirms the inclusive combined filters select 164 and Z-only selects 489.

Explicit remaining gaps: useful empty state, invalid-state recovery, and supported-workspace desktop resize. Current supported workspace minimum remains 1024 CSS px; this does not change the separate matrix-width check. Feature usage is still “shown”; dated “reviewed” assignments will be added under exp-3qd5 only after its review evidence is recorded.

Proof: `pnpm --filter demo exec vitest run src/demos/coverage.test.ts src/CoverageMatrix.test.tsx` passed (2 files, 4 tests). Matrix browser proof reran after reconciliation at 1280×720, 783×720, and 390×844; document/body widths were 1280, 783, and 390. Screenshots are in `tmp/coverage-matrix-{1280,783,390}.png`. Keyboard navigation, native disclosure open/close, and the product-activity example link were confirmed earlier on this same served worktree. The initial broad `pnpm --filter demo test -- src/demos/coverage.test.ts` invocation ran the full demo suite and failed because `CoverageMatrix.test.tsx` expected the now-removed title gap; the focused tests passed after updating that stale assertion.

**2026-10-02T05:16:23Z**

Follow-up after reconciliation — 2026-10-02

Exp-3qd5 used existing guide steps to review the supported empty and invalid states. The catalog unmatched-search flow recovers when cleared. An invalid calculation draft reports a parse error and can be closed without saving. No saved sample or runtime behavior was added. Review dates and evidence notes now validate for every reviewed example/feature assignment.

**2026-10-02T05:22:16Z**

Owner combined-check checkpoint: pnpm check failed demo TypeScript because removing all concrete gaps entries leaves optional gaps unknown after narrowing. Coverage worker owns the minimal shared type repair. Runtime browser proof remains valid on frozen preview. Acceptance waits for combined checks.

**2026-10-02T05:26:52Z**

Owner acceptance: repaired optional gaps typing without changing runtime data. Final combined pnpm check passed on Node 24, including builds, both type checks, UI checks, 375 package tests, and 18 demo tests. Current coverage has 39 features, 37 with usage, 2 explicitly unsupported scales, 37 reviewed assignments, and no gap notes. Report and metadata evidence reviewed.
