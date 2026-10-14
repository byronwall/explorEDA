# explorEDA

React components for interactive exploratory data analysis, and a command
that opens any folder of data as a project.

## Explore a folder of data

```bash
npx exploreda
```

Run it in a folder of CSV or JSON files. Your browser opens on the folder;
choose **Chart** beside a file to start. Analyses save to the folder as `.eda`
text files you can diff and commit, and the page reloads when files change on
disk. `npx exploreda --example` opens a sample project. See
[Project folders](https://exploreda.dev/docs/project-folders) for the folder
layout and the project text reference.

## Embed the workspace

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
An edit made in place on a chart is reported once, when it ends: typing a title,
dragging an axis, or a session in an axis range popover. A host that records
each callback as an undo step therefore gets one step per edit. An edit
cancelled with Escape is not reported at all.
`ref.current.getSettings()` reads the current `SavedDataStructure` after mount,
including initial settings when `savedData` is omitted. It reflects later edits
when called again. It does not change the edit-only callback behavior.
`ref.current.exportChartPng(chartId, { pixelRatio })` resolves to
`{ blob, width, height }`: the chart's PNG as drawn, the same image its
**Download image** action saves, at twice its on-screen size by default. The
chart must be rendered in that workspace (scrolled out of view is fine);
otherwise the promise rejects with "Chart is not rendered.". Read chart ids
from `getSettings().charts`.

```tsx
const saveFirstChart = async () => {
  const handle = workspace.current;
  const chart = handle?.getSettings().charts[0];
  if (!handle || !chart) return;
  const { blob } = await handle.exportChartPng(chart.id);
  await uploadImage(blob); // your own storage
};
```

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

`toolbarStart` and `toolbarEnd` put host content on the workspace's toolbar
line: view tabs on the left, and actions such as undo or export after the
workspace tools. Both stay usable while the workspace is read-only. The row
count and active filters sit in a status bar that stays at the bottom of the
viewport while the charts scroll.

```tsx
<ExplorEda
  data={rows}
  toolbarStart={<MyViewTabs />}
  toolbarEnd={<MyUndoButtons />}
/>
```

`data` supplies the rows. `savedData` optionally restores chart, calculation,
Rows, grid, metadata, color-scale, field-settings, and grouped-summary state.
Pass new references when either value changes; in-place mutations are not
observed.

React and ReactDOM are peer dependencies.

## Read local files

`exploreda/readers` reads a local file into rows and field types. It reads
CSV (comma, semicolon, tab, or pipe delimited, also as `.txt`), TSV (`.tsv`
and `.tab`), JSON (an object, an array of objects, or an object whose one
array holds the records), JSON Lines (`.jsonl` and `.ndjson`), and Excel
(`.xlsx`), and Parquet (`.parquet`). The Excel and Parquet readers load only
when such a file is read.

```tsx
import { ExplorEda } from "exploreda";
import { readTableFile, tableFileAccept } from "exploreda/readers";

async function open(file: File) {
  const table = await readTableFile(file);
  return <ExplorEda data={table.rows} fieldTypes={table.fieldTypes} />;
}
// <input type="file" accept={tableFileAccept()} />
```

Values keep the form the file gives them. A column becomes numbers only when
every value converts without change, so `0012` and IDs past 2^53 stay text.
Dates stay as their text, typed as dates. Blank cells are missing. Each column
is typed from every row, and a field that first appears late is still found.
In JSON, integer literals past 2^53 keep their digits as text, nested objects
become dotted fields such as `user.plan`, and arrays stay together as JSON
text in one field.

A workbook reads one sheet: the largest table, or the one `sheet` names.
`table.sheets` lists every sheet with a table and its size, so your app can
offer a choice and read another with `readTableFile(file, { sheet })`. A sheet
starts at its header row, below title rows. Formulas read as the results the
workbook saved and are never calculated; error cells read as missing.

A Parquet file's columns take the types its schema declares. Timestamps keep
their stored precision as ISO text, decimals keep their exact digits, int64
values past 2^53 stay text, and lists, maps, and structs become JSON text.
Snappy, gzip, zstd, Brotli, and LZ4 pages are read.

A file that can't be read rejects with a `TableReadError` that names the row,
such as `Row 12 has 6 values, but the header names 5 fields.` `table.notes`
lists changes made while reading, such as a renamed duplicate header. Pass
`table.fields` to `addSourceFromRows` or `singleTableProject` to keep the
types in a project. `readTableText` reads text you already have, such as a
fetched file.

## Themes and styling

The Theme tab in workspace settings picks how charts look. **Compact** is the
default dense layout. **Newsprint** and **Report** are editorial themes: each
chart gets a headline that wraps to two lines, a subtitle, and a source note
under the plot, with larger axis text and a palette of its own. The choice
saves in `savedData.theme`; a save without one opens as Compact.

```tsx
<ExplorEda data={rows} savedData={{ ...saved, theme: { id: "newsprint" } }} />
```

Charts follow the theme unless a user overrides a chart on purpose. A chart's
`subtitle`, `note`, and `style` (title size, title weight, subtitle size) save
with its settings, and the Theme tab lists every override with a reset.

Themes are CSS custom properties, so a host restyles them the same way it
restyles `--primary`. Set a variable on an ancestor of the workspace to change
it everywhere, or target a theme with `[data-eda-theme="…"]`:

```css
/* Your brand's fonts and accent in the editorial themes. */
.my-app [data-eda-theme="newsprint"],
.my-app [data-eda-theme="report"] {
  --eda-headline-font: "Your Serif", Georgia, serif;
  --eda-headline-accent: var(--brand-red);
}
```

| Variable                                                                                     | Sets                                            |
| -------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `--eda-headline-font`, `--eda-headline-size`, `--eda-headline-weight`, `--eda-headline-line` | Chart title type                                |
| `--eda-headline-color`, `--eda-headline-accent`                                              | Title color and the short rule above it         |
| `--eda-subtitle-font`, `--eda-subtitle-size`, `--eda-subtitle-color`                         | Subtitle type                                   |
| `--eda-note-size`, `--eda-note-color`                                                        | Source note type                                |
| `--eda-axis-tick-size`, `--eda-axis-label-size`                                              | Axis tick and title sizes, in px                |
| `--eda-axis-tick-color`, `--eda-axis-label-color`                                            | Axis text colors                                |
| `--eda-panel-surface`, `--eda-panel-rule`                                                    | Chart surface and border                        |
| `--eda-header-padding`                                                                       | Space around an editorial headline              |
| `--eda-heat-low`, `--eda-heat-high`, `--eda-heat-mid`, `--eda-heat-negative`                 | The ramp heatmaps, region maps, and density use |

The package ships no font files. Point a font variable at a webfont the host
already loads; axis layout measures text again once fonts finish loading, so
wide faces claim the room they need.

Categorical color scales on the **Theme** palette take the current theme's
colors, and each category keeps its place across themes. Palette colors
lighten in dark mode: add a `dark` class to the page or to an ancestor of the
workspace. Hand-picked colors and fixed palettes stay as chosen.

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
  theme?: WorkspaceTheme; // { id: "compact" | "newsprint" | "report" }
}

interface SavedCalculation {
  resultColumnName: string;
  expression: string;
}
```

Point maps draw streets when zoomed in after the host calls `registerMapLibre(maplibregl)` with the optional `maplibre-gl` package. The default style is OpenFreeMap; pass `{ styles: { light, dark } }` to change it.

Region maps can use supplied boundaries without an import: World countries, US states, and US counties load only when a map uses them. A chart saves them as `geometryAssetId: "boundary:world-countries"`. Add more with `registerBoundarySet({ id, name, source, level, coverage, keys, load })`, where `load` returns a Polygon or MultiPolygon FeatureCollection.

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

Build a complete dashboard from compact text. Each line declares a field alias, a calculation, a workspace filter, or a chart. A line that ends in `{` opens a body for longer settings, and `}` closes it. Whitespace never changes meaning. `where.` filters limit only their own chart. A `filter` line narrows every chart, and no chart owns it; write one line per field. A `layout` block places charts: each line is a band's height and its cells, which split the 12 columns evenly unless a cell gives its width.

```text
revenue:num=Revenue label="Revenue ($)"
calc profit = revenue - Cost
filter Channel=Web,Store
scatter @web x=revenue y=profit where.Channel=Web {
  title="Web orders" x.scale=log
}
metric @gains sum(profit) where.profit=0..
table @orders revenue,profit,Channel
layout {
  5: web web gains
  4: orders
}
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
npx exploreda-dsl fmt dashboard.eda --write
npx exploreda-dsl reference
npx exploreda-dsl reference scatter
```

Set an axis range with `x.min=`, `x.max=`, `y.min=`, and `y.max=`. They save as `xAxis.limits` and `yAxis.limits` and only change the view; rows outside stay counted. Each setting has one spelling: a word such as `x.title=` or `bins=` when it has one, and otherwise its saved path, such as `minRowHeight=30` or `columns.0.width=140`. `exploreda-dsl reference <type>` lists them. A chart goes by its `@name`, or by its field when no other chart shares it, so `row Region` is placed as `Region`. `formatDsl(text)` indents by brace depth without changing meaning. Charts take child lines too: annotations (`callout`, `rule`, `band`, `region`, `interval`, `records`) with ISO dates on date axes, and lists of records such as a table's `column Revenue width=140`, a pivot's `value sum(Revenue)`, or a line's `series Visits lineColor=#3479a8`. Metrics and grouped summaries read as calls: `metric sum(Revenue)`, `group @byRegion sum(Revenue) by=Region`. A color scale writes each value's color as `map=Web:#3479a8,Store:#c77a45`. A `composition` chart writes its parts as child lines named for their kind (`title`, `unit`, `path`, `legend`, `note`, and so on), which point at each other by name instead of generated IDs. Color scales, grouped summaries, and the Rows view have their own lines (`scale`, `group`, `rows`). `exportDocument(settings, { rows })` writes the current dashboard as text that rebuilds it. Region maps refer to map shapes the host passes in as `geometryAssets`.

### Several views in one text

One text can hold every saved view. Shared definitions (field settings, calculations, color scales, and grouped summaries) come first and apply to every view. Each `view "Name" { }` holds that view's grid, theme, Rows view, charts, and layout. A chart written above the views is defined once: a view shows it when its layout places it or a line names it, and that line changes only what differs, such as `Channel select.Channel=Web`. A view that names no shared chart shows them all. `exportViews` writes a chart that several views share this way.

```text
dashboard "Sales"
calc profit = Revenue - Cost

view Overview {
  metric sum(Revenue)
  scatter x=Revenue y=profit color=Channel
}

view "By channel" {
  row Channel where.Units=2..
  hist profit
}
```

```ts
import { compileViews, exportViews } from "exploreda";

const { text } = exportViews(
  [
    { name: "Overview", settings: overview },
    { name: "By channel", settings: byChannel },
  ],
  { rows, name: "Sales" }
);
const { views } = compileViews(text, { rows });
// views[i].name and views[i].settings rebuild each view.
```

Text without views reads as one view. `compileDocument` builds only the first view and warns about the rest. `exploreda-dsl check` checks every view.

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

### A chart workspace over a project

`ExplorEdaProject` renders the charts for one view of a project. The view
names a query; that query's result rows are what every chart in the view
sees, and one line above the charts says which query and what a row is. The
host owns the project, the views, and where they are saved.

```tsx
import { ExplorEdaProject, type AnalysisView } from "exploreda";

function Shop({ project, tables }) {
  const [state, setState] = useState({
    project,
    view: {
      id: "orders",
      name: "Orders",
      queryId: "orders-by-customer",
    } as AnalysisView,
  });
  return (
    <ExplorEdaProject
      project={state.project}
      tables={tables}
      view={state.view}
      onProjectChange={setState}
      onStateChange={(settings) =>
        setState((current) => ({
          ...current,
          view: { ...current.view, settings },
        }))
      }
    />
  );
}
```

The toolbar gains two panels. **Schema** lists each table's fields and links,
previews a new or edited link's match counts before it applies, and opens a
table as its own view. **Query** picks the view's query, follows a link (add
fields, summarize related rows, or expand into a new view), sets parameter
inputs, and lists every step with its row counts down to the rows and their
source records. From a chart trace, "Show these rows in the query flow" opens
the rows behind a mark. Pass `onOpenView` to let these panels open new views.

### The schema diagram

The **Schema diagram** button opens the whole model in a wide drawer: tables
with their fields and keys, the relationships between them, each query's
steps and calculated fields, and each view's charts. The layout reads left to
right and top to bottom and is shaped to fit the drawer. Select a field to
trace where it comes from and every calculation and view that reads it; a
chart in this workspace can be shown from there.

The diagram is also an editor. Drag one field onto another table's field to
relate them, with match counts before you apply. Rename fields, change types
and keys, change or remove relationships, and add, change, or remove query
steps; removing a step first names the fields and views it breaks. Each edit
reaches `onProjectChange` once. `readOnly` keeps the diagram and hides edits.

Pass every saved view as `views` so the diagram shows what each one reads;
views other than the current one fold to one row per chart. Pass
`onAddSource` to show **Add source**: your app picks a file, reads it with
`readTableFile`, then adds it with `addSourceFromRows`. A single-table `ExplorEda` takes `onAddSource` too,
and `singleTableProject` turns its rows and saved settings into a project
whose view keeps the same charts, filters, and layout.

```ts
import { addSourceFromRows, singleTableProject } from "exploreda/analysis";
import { readTableFile } from "exploreda/readers";

const promoted = singleTableProject({ name: "Deliveries", rows, settings });
const routes = await readTableFile(file);
const added = addSourceFromRows(
  promoted.project,
  promoted.tables,
  routes.name,
  routes.rows,
  routes.fields
);
// Render ExplorEdaProject with added.project, added.tables, and promoted.view;
// schemaFocus={added.sourceId} opens the diagram on the new table.
```

Large projects can run their queries in a worker so typing in an input stays
responsive. The worker ships with the package; your bundler must emit worker
files referenced with `new URL(..., import.meta.url)` (Vite and webpack 5 do).

```tsx
import { createAnalysisWorker } from "exploreda/analysis";

<ExplorEdaProject createWorker={createAnalysisWorker} {...props} />;
```

While a query runs, the charts keep the last finished result and the scope
line says it is updating. A result that finishes after a newer request is
dropped, so rows, counts, and inputs on screen always match.
