---
id: exp-4ak2
status: closed
deps: [exp-72ve]
links: []
created: 2026-10-02T04:13:16Z
type: feature
priority: 2
assignee: Byron Wall
external-ref: developer-adoption-page:M3
tags: [adoption-page, landing, chart-docs]
---
# Connect the landing examples to chart and rendering guides

## Outcome
Add two clear links from the existing landing examples section to the accepted chart index and rendering guide. Keep the featured order-book path first. Readers can continue from the chart index to a guide and its current example.

## Readiness and verified boundary
- Prerequisite `exp-72ve` is closed at `e0713af`; the index, scatter/bar guides, rendering guide, example routes, captures, and route-focus repair are integrated in this branch.
- The current `LandingPage` keeps its hero and featured `shop-operations` example above Integration and Examples. The Examples section has all ten task-labelled entries, plus the existing feature-coverage link. It has no chart-docs links yet.
- `ExampleSelector` positions an example button across its list row. Put learning links before the list, outside the row overlays; do not add links inside each example row.
- Docs URLs are `/?view=docs` and `/?view=docs&topic=rendering`. Guide pages already link to `?example=scatter-trace` and `?example=shop-operations`.
- Vite uses `base: "/"`; Pages uploads `apps/demo/dist`, and README names `https://exploreda.dev`. Use same-origin query links. New routes and refresh were verified on the local built preview; production deployment is excluded.
- Browser target: built preview on port 5196. Reuse it; do not start another preview or ticket viewer. A local dark proof fixture may need restore after a build clears ignored `dist/` content.
- Accountable owner: Byron Wall. Current writer: guides_writer. Root coordinates independent browser proof and acceptance.

## Scope
Add semantic links labelled `Browse chart guides` and `How rendering works` just before the existing `ExampleSelector` within the Examples section. Keep the visible feature-coverage link. Preserve ordering and all current hero, example, integration, import, restore, and Reset paths.

## Acceptance and proof
- Both links use the existing docs query routes and work by pointer and keyboard.
- The current example list still contains all ten entries, with the featured shop example and hero path unchanged.
- Links remain visible and usable at 1280, 783, and 390 px, in light and dark views. They sit outside the example row overlays and have visible focus styling.
- Direct docs and rendering-guide refreshes remain working; the rendering guide links to its chart pages and their real examples.
- Run the focused landing tests, `pnpm check:ui`, and `pnpm check`. Save the full check log at `tmp/exp-4ak2-pnpm-check.log`.
- Keep this ticket in progress until root's independent browser pass accepts the combined state. Production smoke, deployment, push, and PR are excluded.

## Cut line
No landing rebuild, new preview, chart/catalogue page, example, tooltip, package change, chart behavior, framework, dependency, changeset, or deployment edit. Do not modify `exp-72ve` or unrelated tickets.

## Provenance
Developer adoption page: accepted shape and M3, chart breadth and learning path. Baseline d720f1f6b99d0a54564da5486da94208a563c71e. M1 and M2 are delivered with historical PR #27 evidence. Current ExampleSelector supplies task-labelled breadth; chart-index and rendering-guide links are absent.



## Checkpoint
Implemented the two guide links before the example list. The focused landing test verifies both query targets and the existing test still verifies all ten task-labelled examples and their selection path. `pnpm check` passes: 61 package test files/374 tests and 6 demo test files/20 tests, plus builds, type checks, and `check:ui`. The full log is `tmp/exp-4ak2-pnpm-check.log`; the focused landing test also passes (9 tests).

Next: root's independent browser pass checks both links by pointer and keyboard at 1280, 783, and 390 px in light and dark views. Keep this ticket in progress until that pass is accepted. The build clears the local ignored dark preview fixture, so restore it before visual proof. No deployment is authorized.
## Notes

**2026-10-02T05:17:51Z**

Browser checkpoint recovery on source 33602bc: the independent final pass stalled in a native file chooser/setFiles tool call. The call was interrupted after an extended wait. The tiny self-authored CSV selection produced no result, so actual browser file-selection import remains unverified; no product failure was observed.

Root changed the proof route without changing scope: do not retry the hung chooser. Finish changed landing-link pointer/keyboard and appearance checks first. Preserve-import proof uses the unchanged CSV/drop handlers with passing parser/drop-import tests and a shipped sample import UI check. Also check a disposable full-analysis paste restore and Reset. Required changed-link acceptance remains unfinished. Ticket stays in progress.

**2026-10-02T05:31:41Z**

Accepted by root on source revision 33602bc after independent browser verification on built preview http://127.0.0.1:5196/.

| Criterion | Evidence | Result |
| --- | --- | --- |
| Both landing learning links | Browse chart guides and How rendering works each received real pointer activation and Tab/Enter activation at 1280, 783, 390 px, in light and the dark host fixture; expected destination H1, scroll 0 | pass |
| Primary path and example breadth | Inside the order book remains first; all ten current task-labelled entries remain; source diff does not change hero, examples, integration, import, restore or Reset handlers | pass |
| Complete learning path | Landing opens index and rendering; scatter guide opens scatter-trace (18-row fixture); bar guide opens shop-operations; bar direct load and refresh pass; accepted exp-72ve direct-refresh evidence remains valid | pass |
| Responsive appearance | Labels, focus, and navigation usable at three widths without horizontal overflow; same built JS/CSS with host .dark class retains dark styling across query navigation | pass |
| Preserved paths | Sample penguin import loads 344 rows; disposable full-analysis paste restores 2 rows; a Home category filter shows 168/500 and Reset restores 500; React integration link opens its section | pass |
| Repository checks | pnpm check: UI rules, builds, types, 374 package tests in 61 files and 20 demo tests in 6 files; focused landing tests 9 passed | pass |

The first verifier summary overstated the activation matrix. Root requested exact checks; the verifier completed the missing pointer/Enter combinations before acceptance. Final source did not change during proof. Root inspected wide, narrow, bar-guide, and dark landing captures.

Evidence: tmp/exp-4ak2-pnpm-check.log; tmp/exp-4ak2-landing-learning-wide.jpg; tmp/exp-4ak2-landing-learning-narrow.jpg; tmp/exp-4ak2-landing-learning-dark-wide.jpg; tmp/exp-4ak2-landing-learning-dark-medium.jpg; tmp/exp-4ak2-landing-learning-dark-390.jpg; tmp/exp-4ak2-bar-guide-wide.jpg. Captures were copied to this worktree after the verifier first saved them in the starting checkout's ignored tmp folder.

Actual browser file-selection import remains unverified because chooser/setFiles hung. It was not retried. Preservation is supported by the unchanged handlers, passing parser/drop-import tests, and successful sample import. This is a tool-proof limit, not an observed product failure. The saved full-check log also contains non-failing bundler and React act warnings. Dark proof verifies the existing host class, not a shipped appearance control. Production smoke remains excluded by the no-deploy instruction.

All ticket acceptance criteria pass. No package source changed; no changeset is required. Next: close this ticket, reconcile plan summaries, and prepare the screenshot PR body. Remote PR creation needs a decision because the branch is local and pushing is prohibited.
