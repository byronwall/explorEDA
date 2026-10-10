# explorEDA

![explorEDA icon and wordmark](apps/demo/public/brand/logo.svg)

**Embed an interactive analysis workspace in your React app.**

Give users linked charts, record-level tables, and editable calculated fields
without building the workspace around them.

[Live demo](https://exploreda.dev) ·
[Package docs](packages/explorEDA/README.md) ·
[Example source](apps/demo/src/demos)

![The order book example after selecting Web in Sales channels: a Channel: Web filter chip, 167 of 500 rows, and every chart narrowed to web orders.](apps/demo/public/landing/order-book-web.jpg)

## Why a workspace

Linked filtering alone is common. explorEDA also provides the parts around the
charts: configuration, record inspection, formulas, and restorable settings.

- **Linked views and their records.** A selection in one chart filters every
  other view and the record table, so users can check the rows behind a
  pattern.
- **Calculated fields users can inspect.** Formulas show their dependency
  chains, and the editor previews a draft before it is applied across views.
- **Settings your app keeps.** Users arrange the analysis visually. Your app
  receives the settings as JSON and restores them later through `savedData`.

Chart types include row, bar, line, scatter, 3D scatter, box plot, pivot
table, data table, summary table, metric card, markdown, and color legend.

Metric cards show a count, sum, or average for rows that match the chart
filters. Alt-click a card to see the inputs and excluded values.

Line Chart's **Calendar summaries** mode groups dated rows by UTC day, week,
or month. Select a period and series to filter linked views, then Alt-click
a point to see its calculation, date boundaries, and source rows.
Choose **Area** to fill each series from zero. **Stacked area** adds nonnegative
counts or sums. Incomplete periods break the stack. Traces show each band's
bounds and the series that establish its baseline.

Use **Split by** in Bar Chart to compare series within each category. Each
bar supports linked selection and source tracing for its category–series pair.
Choose **Stacked** to add counts or sums, or **100%** to compare nonnegative
shares. Tracing includes each category denominator and its source records.

Use **Size by** in Scatter Plot to draw bubbles with area proportional to a
nonnegative field. The size scale stays fixed during filtering. Click a bubble
to select its source row, or Alt-click it to see its size calculation.
Zero uses a hollow marker. Missing, invalid, and negative sizes remain available
through the source trace.

Choose **Density** in Scatter Plot to count numeric coordinate pairs in rectangular
bins. Set the X and Y bin counts, then select a bin to filter its exact source rows.
Alt-click a bin to see its intervals, counts, color scale, and source records. Bin edges
and the automatic color scale use all source rows, so linked filters keep a stable reference.

Choose **Map** to place rows by latitude and longitude in WGS 84 decimal degrees.
Add color and size fields, then click a point to select its source row.
Alt-click a point to see its source values, coordinate preparation, size, and projection.
Drag to pan, use **Fit data** for all source coordinates, or **Reset view** for the world.
Views persist in geographic units. Omitted and offscreen rows remain available in the trace.
The bundled [World Atlas land outline](https://github.com/topojson/world-atlas) supplies context without a tile service.

Choose **Region** in Map settings to join records to a GeoJSON FeatureCollection.
Import polygon geometry, choose the row and feature keys, and review the join preview.
Keys match by value and type. Choose count, sum, or average for the region metric.
Select a region to filter its records; Alt-click it to see its metric and contributors.
Alt-click outside the regions to list unmatched rows. Duplicate feature keys form one region without counting rows twice.
Patterns distinguish regions with no rows from regions with invalid measures. Zero remains a valid metric.
The color domain uses full-source bounds and stays fixed across filters and facets.
Geometry is saved once under `geometryAssets`; each chart stores its `geometryAssetId` reference.

Edit a chart where it is drawn. Double-click a chart or axis title to rename
it. Double-click a numeric axis to type its range, drag the axis to pan, or
drag one of its ends to stretch it. A range changes only the view: filters and
row counts stay as they were. Your app's `onStateChange` hears each edit once,
so one rename or one drag is one undo step.

## Install

```sh
pnpm add exploreda
```

React and ReactDOM 18 or 19 are peer dependencies.

## Use it in your React app

```tsx
import { ExplorEda, type SavedDataStructure } from "exploreda";
import "exploreda/dist/ExplorEda.css";

type Order = Record<string, string | number | boolean | null>;

export function OrdersExplorer({
  orders,
  savedSettings,
  onSettingsChange,
}: {
  orders: Order[];
  savedSettings?: SavedDataStructure;
  onSettingsChange: (settings: SavedDataStructure) => void;
}) {
  return (
    <ExplorEda
      data={orders}
      savedData={savedSettings}
      onStateChange={onSettingsChange}
    />
  );
}
```

Three props define the boundary between your app and the workspace:

| Prop            | Role     | What it does                                                                                                 |
| --------------- | -------- | ------------------------------------------------------------------------------------------------------------ |
| `data`          | Input    | The rows your app supplies. Pass a new array when the rows change; in-place mutations are not observed.      |
| `savedData`     | Restore  | Optional settings that restore charts, calculations, Rows filters, and layout. Read on mount or replacement. |
| `onStateChange` | Callback | Called after meaningful edits with JSON settings, never raw rows. Your app decides where to keep them.       |

`savedData` is not a controlled value, so do not feed each `onStateChange`
result back into it. The [package docs](packages/explorEDA/README.md) cover
the settings shape, full analysis bundles with rows, and registering only the
charts you need.

## Before you integrate

- **Screen size:** desktop viewports of 1024 CSS pixels or more.
- **Browser:** DOM and Canvas 2D. The 3D scatter chart also needs WebGL.
- **Storage:** none built in. Settings and full analysis exports are JSON your
  app stores.

## Develop

This repository is a pnpm workspace: the library is in `packages/explorEDA`
and the demo site is in `apps/demo`. It requires pnpm 11.9.0.

```sh
pnpm install
pnpm check              # UI rules, build, typecheck, and tests
pnpm --filter demo dev  # demo site at http://localhost:5173/, library from source
```

## Local product grid

The explorEDA product grid and its images live in `pgm/data`. The original
download is `pgm/explorEDA.zip`. The viewer and CLI save edits in `pgm/data`.
They do not update the hosted project or the ZIP archive.

```bash
pnpm pgm:view                      # open the local viewer; Ctrl+C stops it
pnpm pgm project list --json       # inspect local projects
pnpm pgm node list --roots --compact --json
```

Run `pnpm install` first. These commands use the pinned npm release of
`@byronwallrus/product-grid-cli`, which includes the local viewer.
Commit changes in `pgm/data` to save local edits and images in Git.

## Release

Releases use [Changesets](https://github.com/changesets/changesets). Add a
changeset to any PR that changes the published package:

```sh
pnpm changeset:add patch "Keep bar tooltips inside the panel"
```

When a changeset reaches `main`, the Release workflow opens or updates a
"Version Packages" PR with the new version and changelog. Merging that PR
runs `pnpm check`, publishes `exploreda` to npm, and tags a GitHub release.
Commits without a changeset do not start a release.

The workflow uses npm trusted publishing through GitHub OIDC. It needs no
`NPM_TOKEN` secret. The npm connection uses these settings:

- Repository: `byronwall/explorEDA`
- Workflow filename: `release.yml`
- Environment: none
- Allowed actions: `npm publish` and `npm stage publish`

Keep `id-token: write` in the workflow permissions. Use Node 24, which includes
a compatible npm CLI. Trusted publishing requires npm 11.5.1 or later.

To start a release by hand:

1. Open **Actions → Release → Run workflow** and select `main`.
2. Review and merge the **Version Packages** PR when changesets are pending.
3. Wait for the publish run to pass. Check the npm version and GitHub release.

With no pending changesets, the manual run publishes any unpublished package
version already on `main`. It does not create a new version.

If a run fails, read its logs before retrying. Fix code or workflow problems
through a PR, then run Release again on `main`. Do not create another version
just to retry a failed publish. If publishing succeeded but a later step failed,
check npm before retrying.

Run `pnpm check` with Node 24 before changing the release runtime or test setup.
The demo test environment retains Node's `AbortController` and `AbortSignal`
because React Router uses Node's `Request`. Plain jsdom signals fail on Node 24.

npm metadata can lag after publishing. If the run reports success but the
version is missing, wait and check again. Confirm the `latest` tag and provenance
before calling the release complete.

## Inspiration

explorEDA was inspired by [DC.js](https://dc-js.github.io/dc.js/) and
[Crossfilter](https://github.com/crossfilter/crossfilter).
