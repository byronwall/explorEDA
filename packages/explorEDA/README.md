# explorEDA

React components for interactive exploratory data analysis.

```tsx
import {
  ExplorEda,
  stringifySavedData,
  type SavedDataStructure,
} from "exploreda";
import "exploreda/dist/ExplorEda.css";

const data = [{ category: "A", value: 1 }];
// Paste the copied settings JSON here.
const savedData: SavedDataStructure = {
  "charts": [],
  "calculations": [],
  "gridSettings": {"columnCount": 1, "rowHeight": 300, "containerPadding": 10, "showBackgroundMarkers": false},
  "metadata": {"name": "Embedded view", "version": 1, "createdAt": "2026-01-01T00:00:00.000Z", "modifiedAt": "2026-01-01T00:00:00.000Z"},
  "colorScales": []
};
const handleStateChange = (next: SavedDataStructure) => {
  console.log(stringifySavedData(next));
  // Copy this JSON into source or store it in the host.
};

<ExplorEda
  data={data}
  savedData={savedData}
  onStateChange={handleStateChange}
/>;
```

The package entry point exports `ExplorEda` and the `SavedDataStructure` type.
The CSS file is available at `exploreda/dist/ExplorEda.css`.

`onStateChange` runs after meaningful workspace changes. It does not run on
initial mount, and replacing `data` or `savedData` does not echo a callback.
`savedData` is an input for initial or replacement restore, not a controlled
value; do not feed every callback result back into it. Callback snapshots are
storage-neutral JSON settings. They include Rows filters, search, sort, column
order, and widths, but do not include raw data rows.

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

`data` supplies the rows. `savedData` optionally restores chart, calculation,
Rows, grid, metadata, and color-scale state. Pass new references when either
value changes; in-place mutations are not observed.

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
}

interface SavedCalculation {
  resultColumnName: string;
  expression: string;
}
```

The `expression` value is formula text. Runtime code parses and validates it
when it restores the settings. The settings JSON does not store an AST and no
AST compatibility layer is provided.

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
