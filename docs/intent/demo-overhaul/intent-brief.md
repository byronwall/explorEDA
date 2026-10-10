---
title: "Demo overhaul with complete analysis examples"
slug: "demo-overhaul"
phase: intent
status: current
last_updated: "2026-10-06"
---

# Demo overhaul with complete analysis examples

## My read

The demos should show analysts what they can accomplish with explorEDA. Visitors may use the library or the standalone tool. Developers can find integration details elsewhere. The demo's primary job is to show analytical power through completed, high-quality work. It is not an educational product.

The desired response is practical: visitors should want to grab their own CSV files and try the tool. A demo should feel like the end point of an analysis on a real topic. It opens with useful charts, meaningful comparisons, and computed results. People can inspect the prepared work and change it. They do not need to complete lessons or follow a prescribed sequence to see the result.

The first release includes all four researched dataset families: January flights, Beijing air quality, World Bank development indicators, and earthquakes. This is settled scope. Their twenty proposed analyses remain useful design material. The request does not require twenty separate catalogue entries or identical tab counts.

Assume multi-table support lands before this implementation starts. Shape flights and World Bank examples around prepared source relationships available for inspection. A lesson about creating relationships is outside this demo scope. The existing Wine example is a quality reference, especially its scatter views. The catalogue can become smaller as similar examples are combined or removed from public navigation.

## What matters most

- Show a complete analysis that makes analysts want to use their own data.
- Make app capabilities visible through meaningful results and working interactions.
- Deliver all four new dataset families at a high standard.
- Preserve Wine's strong scatter experience.
- Prefer quality over the number of catalogue entries.

## The intended experience

The catalogue presents both subject and capabilities. Feature discovery has priority: someone seeking density views, geographic analysis, or related tables should find an appropriate example. Dataset names and questions still give the work a clear subject. The two routes lead to the same curated analyses.

A visitor opens an already composed analysis. Focused tabs are the preferred direction, subject to comparison with other layouts. Each tab presents a finished result on one part of the topic. It can contain a main chart, supporting views, and concise interpretation. Tabs are available in any order. They have outcome names rather than step numbers.

Charts remain editable and linked within their view. Filters and source records stay visible. A person can inspect lookup inputs, compare groups, and test the prepared interpretation. The route to importing personal data stays easy to find. Sharing is a mild preference if later state work is needed; none of sharing, downloads, or new persistence features is central now.

## Boundaries

Keep reference data separate from altered test fixtures. Preserve valid zero, meaningful negative values, missing values, and absent records as distinct cases. Enrichment must preserve base counts and control totals. Duplicate keys need explicit treatment.

Use frozen extracts with reproducible selection rules and source attribution. Record grain, units, transformations, source versions, and key audits. All imported bundles still need preparation. Compute and verify actual findings before writing result statements. Do not promote hypotheses from the research into findings.

The completed appearance does not mean frozen interaction. A saved-state finding must remain distinguishable from the currently filtered result. Reuse current notes and traces where sufficient. A new report engine is not a prerequisite.

Do not add a tutorial, stepper, required walkthrough, or relationship-building lesson. Keep the multi-table contract in its owning implementation. No flattened substitute is part of this delivery shape. General joins and automatic filtering across separate base populations are outside the scope.

## What seems settled

Analysts are the primary audience. Success is interest in using personal CSV data. All four new families belong in the first release. The catalogue may change substantially. Its removal and combination proposal belongs in the [shape brief](shape-brief.md), and Wine remains a strong existing example.

Multi-table support is a prerequisite assumed to arrive first. Users inspect prepared relationships. Finished analysis artifacts take priority over instruction. Sharing and persistence work remain secondary.

## Current reality that matters

The current catalogue contains 22 entries, including several views of the same synthetic datasets. Saved tabs, editable chart settings, notes, and source traces provide reuse. Coverage records separate supported features, example use, and browser review.

The feature coverage page (`?view=coverage`) renders only in development builds; the landing page no longer links it. Decide whether it ships publicly. If so, restore a quiet link from the Examples section and remove the development gate in `apps/demo/src/LandingPage.tsx`. Its status comes from a hand-maintained manifest in `apps/demo/src/demos/coverage.ts`. Log and time scales stay in Needs attention until they ship or leave the manifest. The Lorenz guide hardcodes the saved-filter count (164 of 1,000), which drifts if the generated data changes.

The inspected checkout still uses one working row array. This is historical context, not a reason to shape a single-table release. Planning must inspect the landed multi-table contract before naming APIs or saved formats.

## Next step after confirmation

Review the focused-tab shape and exact catalogue proposal. Then plan one complete Flights proof using the landed multi-table feature. Use that proof to settle presentation and capability discovery before applying the same standard to the remaining families. Completing that proof does not reduce the four-family release scope.
