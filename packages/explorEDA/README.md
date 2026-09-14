# explorEDA

React components for interactive exploratory data analysis.

```tsx
import { ExplorEda } from "exploreda";
import "exploreda/dist/ExplorEda.css";

<ExplorEda data={[{ category: "A", value: 1 }]} />;
```

The package exports `ExplorEda` and the `SavedDataStructure` type from its
main entry point. React and ReactDOM are peer dependencies.
