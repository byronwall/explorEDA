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

`data` supplies the rows. `savedData` optionally restores chart, calculation,
grid, metadata, and color-scale state. Pass new references when either value
changes; in-place mutations are not observed.

React and ReactDOM are peer dependencies.
