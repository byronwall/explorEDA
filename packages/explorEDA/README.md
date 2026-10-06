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

## Dashboard text

Build a complete dashboard from compact text. Each line declares a field alias, a calculation, or a chart. `where.` filters limit only their own chart.

```text
revenue:num=Revenue label="Revenue ($)"
calc profit=revenue-Cost
scatter @web x=revenue y=profit where.Channel=Web
metric sum=profit where.profit=0..
table revenue,profit,Channel
```

```ts
import { compileDocument, formatDslDiagnostics } from "exploreda";

const result = compileDocument(text, { rows });
// result.settings is a SavedDataStructure; pass it to <ExplorEda savedData>.
console.log(formatDslDiagnostics(result));
```

The text describes the whole dashboard: omitted charts are removed, and omitted settings use the app's defaults. A declaration that can't be built is skipped, and the others still build. Each skipped or changed effect comes back as a diagnostic with its line, column, and a suggested fix.

Agents and scripts can check text without a browser:

```sh
npx exploreda-dsl fields --data rows.csv
npx exploreda-dsl check dashboard.eda --data rows.csv
npx exploreda-dsl reference
```

Any saved setting can be written as a flat path, such as `xAxis.scaleType=log` or `columns.0.width=140`. Color scales, grouped summaries, and the Rows view have their own lines (`scale`, `group`, `rows`). `exportDocument(settings, { rows })` writes the current dashboard as text that rebuilds it. Region maps refer to map shapes the host passes in as `geometryAssets`.

`check` exits 0 when every declaration applied, 1 when some were skipped, and 2 when nothing can be built. Add `--json` for the full result.


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

## Related tables

`exploreda/analysis` evaluates queries over several related tables without
React. A project declares sources (each with an entity key), relationships
between their fields, and queries. A query is a short list of steps: read a
source, look up a related row, expand to related rows, calculate, filter, or
group and summarize.

```ts
import { evaluateAnalysisQuery } from "exploreda/analysis";

const result = evaluateAnalysisQuery(project, tables, "orders-by-customer");
result.rows; // one row per order, with customer fields added
result.stages; // input and output counts for every step
result.diagnostics; // missing matches, duplicate keys, ambiguous lookups
```

A lookup keeps the current rows. When one row matches several related rows,
its related values stay empty and a diagnostic names the conflict; the
evaluator never picks the first match. Use an expand step to change the row
meaning on purpose, or expand and then group to keep it. A grouped measure can
use `entityFieldId` to count each parent once, so an order amount repeated on
its item rows is not summed twice.

Treat source tables as immutable: pass a new array when rows change.
`stringifyAnalysisProject` and `parseAnalysisProject` write and validate a
project file with its tables and views. `selectAnalysisProjectView` keeps one
view and only what it depends on.
