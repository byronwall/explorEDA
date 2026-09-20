# explorEDA

React components for interactive exploratory data analysis.

```tsx
import { ExplorEda, type SavedDataStructure } from "exploreda";
import "exploreda/dist/ExplorEda.css";

const data = [{ category: "A", value: 1 }];
const savedData: SavedDataStructure | undefined = undefined;
const handleStateChange = (state: SavedDataStructure) => {
  // Keep this snapshot in host state and pass it later to restore.
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
JSON-serializable and do not include the raw data rows.

For a smaller custom integration, import the registry and only the charts you
need. Registration is explicit, so unused charts and their dependencies stay
out of the consumer bundle.

```tsx
import { chartRegistry } from "exploreda/core";
import { barChartDefinition } from "exploreda/charts/bar";

chartRegistry.register(barChartDefinition);
```

`data` supplies the rows. `savedData` optionally restores chart, calculation,
grid, metadata, and color-scale state. Pass new references when either value
changes; in-place mutations are not observed.

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

`SavedDataStructure` stores workspace state in five top-level fields:

```ts
interface SavedDataStructure {
  charts: SavedChartSettings[];
  calculations: CalculationDefinition[];
  gridSettings: GridSettings;
  metadata: ViewMetadata;
  colorScales: SerializedColorScale[];
}
```

It stores chart, calculation, grid, metadata, and color-scale state. It does
not store the raw data rows.

## Calculated fields

Use the ƒx markers in charts and tables to inspect formulas and their dependency chains. The editor previews drafts before Apply. Field and function insertion uses the current cursor position.

Hosts can build saved calculation definitions with the parser export:

```ts
import { parseExpression } from "exploreda/calculations";

const calculation = {
  resultColumnName: "Net sales",
  expression: parseExpression('["Gross sales"] - ["Discount amount"]'),
};
```

See [the calculation workflow](../../docs/calculation-workflow.md) and the demo's `calculated-orders` example.
