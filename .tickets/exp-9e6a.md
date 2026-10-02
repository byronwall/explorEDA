---
id: exp-9e6a
status: closed
deps: []
links: []
created: 2026-10-02T03:56:00Z
type: task
priority: 2
assignee: Byron Wall
external-ref: data-viz-review-and-example-coverage:m3
tags: [example-coverage, matrix, ui]
---
# Prove the feature matrix in the browser

## Outcome
A maintainer can inspect coverage, open details, and reach the intended examples at wide, intermediate, and narrow widths. The page describes feature review and example review accurately.

## Readiness and ownership

Worktree: `codex/example-coverage-tickets` at `60edb8496ba0818997f9cfe4ca7aad02f86bf7f5`. The local demo runs at `http://localhost:5187`. The coverage route is `/?view=coverage`. The matrix shows product support, declared example evidence, feature review, and example checks as separate states. This worker owns demo coverage files and review reports only.

## Decisions

Keep the existing matrix route and native disclosure controls. Do not add review storage for this ticket. Resolve usability defects only when browser evidence confirms them. Keep narrow-width support claims limited to the matrix; the product workspace requires at least 1024 CSS pixels.

## Acceptance

At 1280, 783, and 390 CSS pixels, the matrix has no page-level horizontal overflow and all visible labels remain reachable. Keyboard users can focus navigation, open and close feature details, and follow an example link. The focused coverage test and demo build pass after all assigned changes.

## Likely Steps
Check the current matrix with keyboard navigation, example links, detail controls, and horizontal overflow. Record visible evidence and correct confirmed usability defects. Clarify review labels against the current shared feature/example assignment. Keep the existing demo matrix.

## Ready Gate
Confirm the current matrix route, browser target, and review-state model before execution. Use the existing local datasets and focused matrix test. Any new review-state storage needs evidence from this proof and the example review work.

## Proof and Cut Line
A current browser report covers three widths, keyboard use, links, disclosure, and overflow. Focused tests and the demo build pass after changes. Public article work and screenshot regression infrastructure stay deferred.

## Provenance
Initiative data-viz-review-and-example-coverage; selected shape keeps the existing matrix; implementation plan milestone 3; baseline 22a9bd3694cf208c63911291a5926c3c5a367be0. The 2026-09-15 example verification excluded the matrix.

## Notes

**2026-10-02T04:18:37Z**

Execution checkpoint: rendered /?view=coverage at 1280x720, 783x720, and 390x844. Document and body widths matched each viewport. Feature detail opened and closed with Enter; a detail link opened the 90-day example. Next: finish the manifest reconciliation, then rerun matrix proof against the combined state.

**2026-10-02T04:37:32Z**

Final browser checkpoint — matrix acceptance passed

After manifest reconciliation on `codex/example-coverage-tickets` at `c0dd3adbc8d7051794fd5302e99748aa8eae9a70`, reran the matrix at 1280×720, 783×720, and 390×844. Document and body widths equal viewport widths at all three sizes. Saved screenshots to `tmp/coverage-matrix-1280.png`, `tmp/coverage-matrix-783.png`, and `tmp/coverage-matrix-390.png`. Existing keyboard evidence confirmed focus navigation, Enter open/close on a feature disclosure, and following a disclosure link to the 90-day example. Focused tests passed: `pnpm --filter demo exec vitest run src/demos/coverage.test.ts src/CoverageMatrix.test.tsx` (2 files, 4 tests). The page keeps implementation, example evidence, feature review, and example review as distinct labels. This ticket's narrow-width proof is only for the matrix; it does not claim the workspace works below 1024 CSS px.

**2026-10-02T04:42:34Z**

Reopened after root review found that the matrix copy overstated the manifest model: feature review is derived from per-example feature assignments. The copy now explains that relationship. Rerunning the focused test and 1280/783/390 browser proof before closing again.

**2026-10-02T04:43:53Z**

Owner review found inaccurate separate-review-record wording in the accepted screenshot. The ticket was reopened. Copy now states that feature review summarizes reviewed example evidence. The existing refined contract remains ready; final keyboard/link/three-width proof is underway.

**2026-10-02T05:16:23Z**

Final acceptance — 2026-10-02

Checked Needs attention, All features, Example usage, and the expanded full example matrix at 1280×720, 783×720, and 390×844 on the assigned :5187 worktree. Document and body widths matched all viewports. At 783 and 390, the 960px matrix scrolled inside its named, focusable region. ArrowRight moved that region without page overflow. Keyboard navigation opened and closed a feature disclosure, followed its product-activity link, and reached the far-right Lorenz assignment link.

Copy now states that feature review summarizes reviewed example evidence and that example checks apply to one feature in one example. Final screenshots: `tmp/coverage-matrix-1280.png`, `tmp/coverage-matrix-783.png`, `tmp/coverage-matrix-390.png`, and `tmp/coverage-matrix-advanced-390.png`. Focused tests passed (2 files, 4 tests). `pnpm --filter demo build` passed.

**2026-10-02T05:26:52Z**

Owner combined acceptance: all matrix views and expanded matrix have browser proof at 1280, 783, and 390 pixels, including disclosure activation, keyboard horizontal scrolling, and far-right example navigation. Final pnpm check passed on Node 24. Reviewed report screenshot paths exist; corrected table formatting.
