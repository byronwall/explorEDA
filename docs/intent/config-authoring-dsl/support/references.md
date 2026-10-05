# Historical source references

Native-contract ref: `226ffae632239150b54b55e9b346386e5e1e66d4`.

Repository source was read through the connected GitHub tools. Previously supplied sources remain the basis for the original settings review; the calculation grammar, state manager, evaluator, function registry, filter types/evaluator, and scatter point filtering were reread for this revision. No fresh latest-main claim is made.

- **R1:** [Calculation grammar and semantics](https://github.com/byronwall/explorEDA/blob/226ffae632239150b54b55e9b346386e5e1e66d4/packages/explorEDA/src/lib/calculations/parser/semantics.ts).
- **R2:** [Calculation state](https://github.com/byronwall/explorEDA/blob/226ffae632239150b54b55e9b346386e5e1e66d4/packages/explorEDA/src/lib/calculations/CalculationState.ts); [calculator](https://github.com/byronwall/explorEDA/blob/226ffae632239150b54b55e9b346386e5e1e66d4/packages/explorEDA/src/lib/calculations/engine/Calculator.ts).
- **R3:** [Function registry](https://github.com/byronwall/explorEDA/blob/226ffae632239150b54b55e9b346386e5e1e66d4/packages/explorEDA/src/lib/calculations/functions/registry.ts).
- **R4:** [Saved settings](https://github.com/byronwall/explorEDA/blob/226ffae632239150b54b55e9b346386e5e1e66d4/packages/explorEDA/src/types/SavedDataStructure.ts); [public component](https://github.com/byronwall/explorEDA/blob/226ffae632239150b54b55e9b346386e5e1e66d4/packages/explorEDA/src/components/ExplorEda.tsx).
- **R5:** [Field settings](https://github.com/byronwall/explorEDA/blob/226ffae632239150b54b55e9b346386e5e1e66d4/packages/explorEDA/src/lib/fieldSettings.ts).
- **R6:** [Metric definition](https://github.com/byronwall/explorEDA/blob/226ffae632239150b54b55e9b346386e5e1e66d4/packages/explorEDA/src/components/charts/MetricCard/definition.ts).
- **R7:** [Table definition](https://github.com/byronwall/explorEDA/blob/226ffae632239150b54b55e9b346386e5e1e66d4/packages/explorEDA/src/components/charts/DataTable/definition.ts); [row definition](https://github.com/byronwall/explorEDA/blob/226ffae632239150b54b55e9b346386e5e1e66d4/packages/explorEDA/src/components/charts/RowChart/definition.ts); [bar definition](https://github.com/byronwall/explorEDA/blob/226ffae632239150b54b55e9b346386e5e1e66d4/packages/explorEDA/src/components/charts/BarChart/definition.ts).
- **R8:** [Filter types](https://github.com/byronwall/explorEDA/blob/226ffae632239150b54b55e9b346386e5e1e66d4/packages/explorEDA/src/types/FilterTypes.ts); [filter evaluator](https://github.com/byronwall/explorEDA/blob/226ffae632239150b54b55e9b346386e5e1e66d4/packages/explorEDA/src/hooks/applyFilter.ts).
- **R9:** [Scatter points](https://github.com/byronwall/explorEDA/blob/226ffae632239150b54b55e9b346386e5e1e66d4/packages/explorEDA/src/components/charts/ScatterPlot/planScatterPoints.ts); [scatter axes](https://github.com/byronwall/explorEDA/blob/226ffae632239150b54b55e9b346386e5e1e66d4/packages/explorEDA/src/components/charts/ScatterPlot/scatterAxis.ts); [crossfilter wrapper](https://github.com/byronwall/explorEDA/blob/226ffae632239150b54b55e9b346386e5e1e66d4/packages/explorEDA/src/hooks/CrossfilterWrapper.ts).

The original research also used a supplied calculation grammar and earlier design reviews. Those copied artifacts are not retained. Historical test results are summarized in [session summary](session-summary.md); they are not current implementation proof.
