---
id: exp-2g7e
status: open
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
