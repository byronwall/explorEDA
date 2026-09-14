# explorEDA

React components for interactive exploratory data analysis.

```tsx
import { ExplorEda, type SavedDataStructure } from "exploreda";
import "exploreda/dist/ExplorEda.css";

const data = [{ category: "A", value: 1 }];
const savedData: SavedDataStructure | undefined = undefined;

<ExplorEda data={data} savedData={savedData} />;
```

The package entry point exports `ExplorEda` and the `SavedDataStructure` type.
The CSS file is available at `exploreda/dist/ExplorEda.css`.

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
