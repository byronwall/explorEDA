# explorEDA

React components for interactive exploratory data analysis.

![explorEDA workspace](packages/explorEDA/docs/main-image.png)

explorEDA builds a workspace of charts that share one filter state. Brush a
scatter plot or select bars, and the other charts recompute against the same
remaining rows. A table can then show the records behind the selection.

## Features

- Cross-chart filtering with shared data and filter state
- Faceted charts with shared axis limits
- Calculated columns
- Configurable axes, grid lines, color scales, and chart layouts
- CSV export from data and summary tables
- CSV and JSON import in the demo application

The available chart types are row, bar, line, scatter, 3D scatter, box plot,
pivot table, data table, summary table, markdown, and color legend.

## Display support

explorEDA is a desktop charting workspace. Use it at viewport widths of 1024
CSS pixels or more. Narrow and mobile layouts are not supported. The workspace
can render below that width, but charts and settings might not remain usable.

## Install

```sh
pnpm add exploreda react react-dom
```

React and ReactDOM are peer dependencies.

## Use

```tsx
import { ExplorEda, type SavedDataStructure } from "exploreda";
import "exploreda/dist/ExplorEda.css";

const data = [
  { category: "A", value: 1 },
  { category: "B", value: 2 },
];

const savedData: SavedDataStructure | undefined = undefined;

export function App() {
  return <ExplorEda data={data} savedData={savedData} />;
}
```

`data` is an array of objects. Values can be strings, numbers, booleans, or
`undefined`.

`savedData` restores chart, calculation, grid, metadata, and color-scale state.
It does not contain the raw rows. Pass `undefined` when no saved state exists.

The provider applies a new `data` or `savedData` value when its reference
changes. Pass a new array or object to update the workspace. In-place
mutations are not observed. If both values change, the provider updates the
rows and then restores the saved state.

## Development

Requires pnpm 11.9.0.

```sh
pnpm install
pnpm check
pnpm --filter demo dev
```

The demo source and sample datasets are in `apps/demo/src`.

## Inspiration

explorEDA was inspired by [DC.js](https://dc-js.github.io/dc.js/) and
[Crossfilter](https://github.com/crossfilter/crossfilter).
