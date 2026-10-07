# Example coverage and visual review

The demo keeps implementation status, intentional example usage, and visual review as separate facts.
A source test can confirm declarations. It cannot establish visual quality.

## Maintainer workflow

Use the repository [data visualization review skill](../.agents/skills/data-viz-review/SKILL.md) on rendered views.
Review the static chart before inspecting source or testing interaction.
Check purpose, meaning, truth, visible state, and readability before giving credit for controls.
Then review visual quality, semantics, tables, dashboard relationships, and important interactions.
Keep the verdict and repair list short and tied to visible evidence.

The [typed manifest](../apps/demo/src/demos/coverage.ts) links stable feature IDs to current example IDs.
The [examples](../apps/demo/src/demos/examples.ts) state their purpose and advertised capabilities.
Use a representative set. Do not create an example for every possible feature combination.

When adding or changing an example:

1. Declare the features that the example intentionally shows.
2. Record unsupported features and concrete gaps explicitly.
3. Review the rendered example and clear blocking findings.
4. Mark only checked feature/example pairs as `reviewed`.
5. Add the review date, report link, and evidence for each reviewed pair.

Feature review summarizes reviewed example evidence. It is not an independent runtime capability check.
Later chart additions do not inherit an earlier review merely because they share an example.

Open `?view=coverage` for Needs attention, All features, Example usage, and the expanded example matrix.
The matrix supports disclosures, example links, and keyboard scrolling inside its named region.
Check it at 1280, 783, and 390 pixels. Narrow matrix checks do not change the desktop workspace support boundary.

The [manifest checks](../apps/demo/src/demos/coverage.test.ts) verify registry agreement, IDs, declarations, and gaps.
The [matrix checks](../apps/demo/src/CoverageMatrix.test.tsx) cover its rendered states.
Run them with `pnpm --filter demo exec vitest run src/demos/coverage.test.ts src/CoverageMatrix.test.tsx`.

## Accepted baseline

The review and example coverage initiative retired on 2026-10-05 after its four milestones were accepted.
Its October 2 baseline had 39 features, 37 with usage, and 37 reviewed assignments across seven examples.
All eleven chart types at that baseline had declarations. Two unsupported scale entries remained explicit.
Later analytical chart work expanded the registry and manifest. Those historical counts do not describe the current catalogue.
Use the [analytical chart guide](analytical-chart-coverage.md) for later families and modes.

The [example review](reviews/2026-10-02-example-coverage.md) records chart-first judgments, linked filters,
saved Lorenz scope, shared facets, table sorting, empty results, and invalid calculation drafts.
The [matrix review](reviews/2026-10-02-feature-coverage-matrix.md) records all matrix views, links, disclosures,
keyboard scrolling, and absence of page overflow at three widths.
The accepted Node 24 check passed builds, types, UI checks, 375 package tests, and 18 demo tests.

The separate drawer follow-up also passed its six criteria.
Its [verification record](reviews/drawer-details-placement-verification.md) covers Escape, panel ownership,
calculations, field details, empty-state recovery, placement, and saved-layout reopen.
The report distinguishes saved-filter rendering proof from the zero-count pointer observation.
It does not claim that pointer clicks created the incompatible filters.

These reports are historical observations. Later changes require their own review.
Retirement did not repeat browser or runtime tests. The [closure record](initiative-history.json) preserves the accepted scope.

## Demo overhaul research

The [demo overhaul intent](intent/demo-overhaul/intent-brief.md) captures the next example direction.
The [shape](intent/demo-overhaul/shape-brief.md) proposes seven complete analyses and lists the catalogue changes.
Its [imported research](intent/demo-overhaul/support/README.md) preserves four dataset families and twenty proposed analyses.
Flights and World Bank indicators provide the strongest related-table examples.
These proposals have no reviewed assignments in the coverage manifest yet.
