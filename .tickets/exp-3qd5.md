---
id: exp-3qd5
status: open
deps: [exp-2g7e]
links: []
created: 2026-10-02T03:56:26Z
type: task
priority: 2
assignee: Byron Wall
external-ref: data-viz-review-and-example-coverage:m4-proof
tags: [example-coverage, examples, review]
---
# Close confirmed example gaps and record current reviews

## Outcome
A small set of current examples intentionally demonstrates each material supported feature, or records a clear deferral. Passing reviews have a date and short visible-evidence note.

## Likely Steps
Use the reconciled manifest to select the fewest example repairs. Prefer existing examples for empty and invalid states when the runtime supports them. Run the repository data-viz review skill on at least one example from each feature family. Clear critical blockers before marking an assignment reviewed. Distinguish the review of one example from the review status of a feature it demonstrates.

## Ready Gate
Wait for the current declaration and gap audit. Confirm the current browser target, saved examples, rubric, review evidence format, and any remaining product decision. Do not treat the old line-chart or tables IDs as current examples.

## Proof and Cut Line
Each required feature is shown or explicitly deferred. Every reviewed assignment has a current passing visual review with date and evidence note. Relevant demo checks, build, and changed-flow browser checks pass at wide, intermediate, and narrow widths. No combinatorial catalog, new chart type, screenshot scoring, or broad runtime expansion.

## Provenance
Initiative data-viz-review-and-example-coverage; selected shape improves existing examples first; implementation plan milestone 4, gap and review steps; baseline 22a9bd3694cf208c63911291a5926c3c5a367be0. Baseline and September verification are historical failing reviews; later workspace polish reports partial repairs.
