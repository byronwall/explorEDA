# explorEDA

React components for interactive exploratory data analysis.

```tsx
import {
  ExplorEda,
  type ExplorEdaHandle,
  stringifySavedData,
  type SavedDataStructure,
} from "exploreda";
import { createRef } from "react";
import "exploreda/dist/ExplorEda.css";

const data = [{ category: "A", value: 1 }];
// Paste the copied settings JSON here.
const savedData: SavedDataStructure = {
  charts: [],
  calculations: [],
  gridSettings: {
    columnCount: 1,
    rowHeight: 300,
    containerPadding: 10,
    showBackgroundMarkers: false,
  },
  metadata: {
    name: "Embedded view",
    version: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    modifiedAt: "2026-01-01T00:00:00.000Z",
  },
  colorScales: [],
};
const handleStateChange = (next: SavedDataStructure) => {
  console.log(stringifySavedData(next));
  // Copy this JSON into source or store it in the host.
};
const workspace = createRef<ExplorEdaHandle>();

<ExplorEda
  ref={workspace}
  data={data}
  savedData={savedData}
  onStateChange={handleStateChange}
/>;
// Call from a host event after React mounts the workspace.
const readCurrentSettings = () => workspace.current?.getSettings();
```

The package entry point exports `ExplorEda` and the `SavedDataStructure` type.
The CSS file is available at `exploreda/dist/ExplorEda.css`.

`onStateChange` runs after meaningful workspace changes. It does not run on
initial mount, and replacing `data` or `savedData` does not echo a callback.
`ref.current.getSettings()` reads the current `SavedDataStructure` after mount,
including initial settings when `savedData` is omitted. It reflects later edits
when called again. It does not change the edit-only callback behavior.
`savedData` is an input for initial or replacement restore, not a controlled
value; do not feed every callback result back into it. Callback snapshots are
storage-neutral JSON settings. They include Rows filters, search, sort, column
order, widths, field settings, and grouped summary definitions, but do not
include raw data rows.

Native settings JSON rejects nonfinite filter values during validation. Draft
calculations remain session-local. `modifiedAt` records the snapshot time.

For a smaller custom integration, import the registry and only the charts you
need. Registration is explicit, so unused charts and their dependencies stay
out of the consumer bundle.

```tsx
import { chartRegistry } from "exploreda/core";
import { barChartDefinition } from "exploreda/charts/bar";

chartRegistry.register(barChartDefinition);
```

`sidePanels` adds host panels to the workspace's right edge. Each panel gets
an icon button beside Fields and Rows and replaces Rows or workspace settings
while it is open, one panel at a time. The host owns `open` and `wide`, so a
panel keeps its state when the host remounts the workspace. A panel can also
set a letter `shortcut`, header `actions`, and a `banner` pinned above its
scrolling content.

```tsx
<ExplorEda
  data={data}
  sidePanels={[
    {
      id: "history",
      label: "History",
      tooltip: "History: every saved change (H)",
      icon: <HistoryIcon />,
      shortcut: "h",
      open: historyOpen,
      onOpenChange: setHistoryOpen,
      wide: historyWide,
      onWideChange: setHistoryWide,
      children: <Timeline />,
    },
  ]}
/>
```

`readOnly` shows the charts and the active filter scope without accepting
edits. Host panels stay usable, so a host can preview an earlier state and
offer its own way back.

`data` supplies the rows. `savedData` optionally restores chart, calculation,
Rows, grid, metadata, color-scale, field-settings, and grouped-summary state.
Pass new references when either value changes; in-place mutations are not
observed.

React and ReactDOM are peer dependencies.

## Browser requirements

The package runs in a browser with DOM, Canvas 2D, `ResizeObserver`,
`matchMedia`, `requestAnimationFrame`, and `URL.createObjectURL` support. The
3D scatter chart also requires WebGL. Copy actions use the browser Clipboard
API.

explorEDA supports desktop viewports of 1024 CSS pixels or more. Narrow and
mobile layouts are outside the supported product scope. Hosts should provide a
desktop-sized workspace instead of depending on the library to adapt dense
charts and settings to a narrow screen.

## Saved data shape

`SavedDataStructure` stores primary workspace settings:

```ts
interface SavedDataStructure {
  charts: SavedChartSettings[];
  calculations: SavedCalculation[];
  gridSettings: GridSettings;
  metadata: ViewMetadata;
  colorScales: SerializedColorScale[];
  rowsSettings?: SavedRowsSettings;
  fieldSettings?: FieldSettingsMap;
  aggregates?: AggregateSpec[];
  geometryAssets?: GeometryAsset[];
}

interface SavedCalculation {
  resultColumnName: string;
  expression: string;
}
```

Region maps reference a shared `GeometryAsset` by `geometryAssetId`. Each asset has an `id`, `name`, `source`, and `geometry`.
Geometry is a WGS 84 GeoJSON FeatureCollection of Polygon or MultiPolygon features with closed rings.
Settings and full-analysis exports both include these assets. Restore the complete settings object to keep map geometry.

The `expression` value is formula text. Runtime code parses and validates it
when it restores the settings. The settings JSON does not store an AST and no
AST compatibility layer is provided.

`fieldSettings` keeps canonical source names separate from display labels and aliases. It
can store type overrides, null tokens, date input presets, units, currencies,
formats, and precision. A field inspector previews raw and effective values
before applying a change.
Valid conversions apply to runtime values. Failed conversions become missing;
the original rows remain unchanged.

`aggregates` stores named grouped definitions. Each definition uses one group
field and count, sum, or average. Read-only bar and data-table views can reuse
the definition by ID and inspect exact source contributors.

For a self-contained analysis, use the secondary full bundle:

```ts
import { parseSavedAnalysis, type SavedAnalysisStructure } from "exploreda";

const analysis: SavedAnalysisStructure = parseSavedAnalysis(text);
// analysis.data contains rows; analysis.settings contains SavedDataStructure.
```

Use the full bundle when imported rows must reopen with the analysis. Durable
storage and named saves remain host responsibilities. The full analysis codec
preserves `undefined`, `NaN`, `Infinity`, and `-Infinity` raw row values with
tagged special values.

## Calculated fields

Use the ƒx markers in charts and tables to inspect formulas and their dependency chains. The editor previews drafts before Apply. Field and function insertion uses the current cursor position.

Saved calculation definitions use formula text at the persistence boundary:

```ts
import type { SavedCalculation } from "exploreda";

const calculation: SavedCalculation = {
  resultColumnName: "Net sales",
  expression: '["Gross sales"] - ["Discount amount"]',
};
```

See [the calculation workflow](../../docs/calculation-workflow.md) and the demo's `calculated-orders` example.


### Histogram and Distribution

Add chart lists Histogram for numeric fields and Distribution for box plots.
Distribution offers Box, Violin, and an Observations overlay. These use the existing
`bar` and `boxplot` saved types. Set `showObservations: true` on a box plot to draw
the first 300 valid source rows in each group. Statistics use all valid values.
Inspect a point to see its source ID and value. Inspect the distribution to see
quartiles, whiskers, density bandwidth, and excluded rows.

Row Chart groups categories that do not fit under Other categories. Inspect this
bar to search its members, inspect source rows, or select categories. The saved
filter contains exact category values. Resizing changes the displayed groups and
keeps the selection. A literal “Other categories” value remains a separate category.


## Related tables and explicit frames

`ExplorEdaProject` evaluates related tables before it renders charts. Each view selects one query and row meaning. The host owns tabs, history, and storage. Source tables stay outside configuration checkpoints.

Interactive queries run in one packaged Web Worker. Use a bundler that emits worker assets from `new URL(..., import.meta.url)`. Replace the table map when source data changes.

Valid parameter edits start evaluation automatically. Pending results retain their applied values until the next result arrives. Query or source changes show a pending result. An empty result replaces prior rows.

```tsx
import { useState } from "react";
import { ExplorEdaProject, createShopFixture, type AnalysisView } from "exploreda";

const fixture = createShopFixture();

function ShopAnalysis() {
  const [state, setState] = useState({
    project: fixture.project,
    view: { id: "orders", name: "Orders", queryId: "orders-by-customer" } as AnalysisView,
  });
  return <ExplorEdaProject
    tables={fixture.sources}
    project={state.project}
    view={state.view}
    onProjectChange={setState}
    onStateChange={settings => setState(current => ({
      ...current, view: { ...current.view, settings },
    }))}
  />;
}
```

Open Schema to create or repair links. Drag a source field onto another field, or use the matching-field selectors. Review matching counts before you apply a link. A lookup retains the current frame. Multiple matches leave dependent values unavailable. Follow a many-side link with an aggregate, or open an expanded frame explicitly.

Open Query flow to inspect steps, conditions, backing records, and contributors. Temporary inspection keeps the chart layout. Use Open as view to retain an intermediate result. Customer and date inputs update parameter queries automatically when valid.

Use a chart's entity field to count or reduce one value per entity. Two orders with the same amount remain separate entities. Repeated values for one entity must agree. Keep result-row mode when each joined row is the intended contribution.

The shop example has five orders with total amount 150. Its eight items have revenue 140 across four orders. Summing repeated order amounts over item rows gives 310; use the order identity when measuring order amounts from this frame.

Import `evaluateAnalysisQuery` from `exploreda/analysis` to run the local evaluator without React. `stringifyAnalysisProject` and `parseAnalysisProject` preserve project definitions, source tables, views, and special scalar values. `selectAnalysisProjectView` exports one view with its upstream dependencies. Files use the explicit `exploreda-project` format. Existing `ExplorEda` single-table use remains available.


For a repeatable local scale check, build the package, then run the fixed-seed probe on Node 24:

```sh
pnpm --filter exploreda build
node packages/explorEDA/scripts/probe-analysis.ts tmp/analysis-scale.exploreda-project.json
```

The probe measures ten tables with 10,000 rows each. It reports evaluation time, result rows, origin links, serialization size, and controlled expansion. The optional file opens through the demo import controls. Results depend on the browser, data shape, and chart workload. Large investigations can exceed browser storage; export a project to retain it.
