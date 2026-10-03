---
id: exp-7cvm
status: open
deps: []
links: [exp-9e6a]
created: 2026-10-02T21:30:00Z
type: task
priority: 3
assignee: Byron Wall
tags: [example-coverage, matrix, internal]
---
# Decide when feature coverage becomes user facing

## Context
The feature coverage page (`?view=coverage`) is an internal tool for now. It renders only in development builds (`import.meta.env.DEV`), production builds drop the lazy chunk, and the landing page no longer links to it. Open it locally at `http://localhost:5183/?view=coverage`.

## Known caveats
- Implementation status is a hand-maintained manifest in `apps/demo/src/demos/coverage.ts`, not a runtime detector.
- A feature counts as reviewed once any example checks it, so "Feature review" and "Example check" were the same signal. The page now shows one Review column with the count of checked examples.
- Log and time scales are recorded as not implemented and will stay in Needs attention until they ship or are removed from the manifest.
- The Lorenz guide text hardcodes the saved-filter row count (164 of 1,000); it will drift if the generated data changes.

## Outcome
Decide whether the page should ship publicly. If so, restore a quiet link from the Examples section and remove the development gate in `apps/demo/src/LandingPage.tsx`.
