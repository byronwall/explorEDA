# Developer workspace and runtime settings

The demo explains the React workspace through a working example, then connects that example to host integration.
The package owns analysis behavior. The demo owns examples, routes, file import, and learning content.
The embedding host supplies rows and owns durable storage.

## Entry and learning paths

The landing page leads with the order book and linked filtering. Selecting Web narrows the example from 500 to 167 rows.
Reset restores the prepared example. Visitors can also import their data or restore an analysis.
A fresh personal-data import starts a new analysis.

The integration section distinguishes a minimal mount from a complete configured dashboard.
Keep the full example data and settings available beside the short React sample.
Use existing workspace output to explain the product. Keep each demonstration instruction consistent with its actual control.

The Examples section links to these same-origin query routes:

- `?view=docs`: chart index, with scatter and bar guides.
- `?view=docs&topic=rendering`: the current rendering guide.
- `?view=docs&topic=scatter` and `?view=docs&topic=bar`: guides with matching example links.

Navigation resets scroll and focuses the destination heading. Direct URLs and refresh use the existing demo route system.
The full chart catalogue and expanded rendering guide remain in the [chart documentation initiative](intent/chart-and-rendering-docs/intent-brief.md).

## Add, edit, inspect, and reset

The featured example connects Add chart, Chart details, Chart spec, and React integration.
Chart details edits a chart. Chart spec reads the current workspace state.
It lists every chart, its type, saved position, size, and settings.
Readers can expand referenced calculations and color-scale definitions. Missing references have an explicit display.
Chart edits and layout changes appear in the inspector through the same provider state.
Reset restores the example after edits.

Chart spec has no separate settings store or saved format. It does not edit settings or compare snapshots.
Integrated agent assistance remains a [separate initiative](intent/in-app-analysis-agent/intent-brief.md).
Project navigation, multiple sources, and host persistence policy also remain separate scopes.

## Host settings access

The public `ExplorEdaHandle` exposes `getSettings()` through a React ref after mount.
It returns the current `SavedDataStructure` from the provider's `saveToStructure` function.
Hosts can read initial settings and later settings after edits.
The inspector, host read, and edit callback use the same workspace definitions.

`onStateChange` reports meaningful edits; it does not emit an initial snapshot.
`savedData` is optional and restores settings against host-supplied rows.
See the [package integration contract](../packages/explorEDA/README.md) for the ref example and restore boundary.

Sources: [public component](../packages/explorEDA/src/components/ExplorEda.tsx),
[inspector](../packages/explorEDA/src/components/ChartSpecPanel.tsx),
[landing links](../apps/demo/src/landing/LearningLinks.tsx), and
[host-read proof](../packages/explorEDA/src/components/__tests__/ExplorEda.test.tsx).

## Accepted proof and limits

The developer adoption and runtime configuration initiatives retired on 2026-10-05.
Their [closure records](initiative-history.json) preserve scope reconciliation and the inspected revision.

The adoption milestones passed through PR #27 and tickets exp-72ve and exp-4ak2.
Recorded checks cover linked filtering, integration, guide links, direct refresh, keyboard use, and three widths.
The final landing check passed builds, types, UI checks, 374 package tests, and 20 demo tests.
Light and dark checks used the same build; dark appearance came from a host class.
Actual browser file selection remained unverified after the chooser tool stalled.
Unchanged import handlers, passing parser tests, sample import, and paste restore supplied the accepted preservation proof.

Runtime acceptance was tracked in ticket exp-b6fo and its three child tickets.
It records add, edit, inspect, move, resize, references, host reads, integration, and Reset at 1280, 783, and 390 pixels.
The final Node 24 check passed builds, types, UI checks, 378 package tests, and 18 demo tests.
These are historical acceptance results. Retirement did not repeat browser or runtime tests and did not deploy the demo.
