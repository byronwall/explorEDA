# R042 — Find a minimal reusable wide-to-long reshaping contract

- ID: R042
- Category: Data preparation and relationships
- Priority: 75
- Kind: new-direction
- Status: candidate
- Confidence: medium
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

Repeated measurements often arrive as columns such as baseline, week one, and week two, while useful comparisons need a measure-name column and a value column. Project queries already support explicit source, lookup, expansion, calculation, filter, and aggregation stages. The `AnalysisStep` union does not define a general reshape stage. This leaves a research opportunity around one specific conversion rather than evidence that all data preparation is missing. A prepared long table can already enter as an ordinary source.

Compare a bounded unpivot step with keeping reshaping outside explorEDA and documenting the expected source structure. The step would name identifier fields, selected value fields, output name/value fields, and a missing-value policy. Avoid assuming that all selected measurements have compatible units or scalar types. Investigate the reverse wide transformation only as a validation aid, not an automatic promise of arbitrary pivoting. The decisive question is whether the same user repeatedly needs this conversion inside a saved analysis.

The initial experiment should reshape twelve observations with two repeated measures, missing values, duplicate identifiers, and one incompatible unit. Compare an independently prepared long source with the proposed step specification. Acceptance requires deterministic output keys, an explicit row grain, and a trace from each output back to both its source row and source field. Totals must reconcile under the chosen missing-value rule. Reject the extension if upstream preparation is simpler or if useful behavior immediately demands arbitrary nested restructuring.

The reusable-analysis-outputs intent remains deliberately unprioritized until a concrete task appears. This candidate supplies a narrow task and a rejection criterion rather than overriding that caution. A new step would affect project validation, textual serialization, inspection, and examples, so its apparent simplicity should not hide maintenance cost. Confidence is medium because the architectural boundary is clear but recurring demand is not. The investigation earns its place by testing one broadly useful data shape while preserving the existing direct, inspectable query model.

## References

- Repository: `packages/explorEDA/src/types/AnalysisProject.ts` — `AnalysisStep`, `AnalysisResultRow`, `AnalysisField`. The query-step union and result provenance define current preparation scope.
- Repository: `packages/explorEDA/src/lib/analysis/evaluateProject.ts` — `calculateFrame`, `aggregateFrame`. Existing preparation already handles scalar and grouped stages.
- Repository: `packages/explorEDA/src/lib/analysis/sources.ts` — `addSourceFromRows`. A prepared table can already be introduced as a source.
- Related intent: `docs/intent/reusable-analysis-outputs/intent-brief.md`.
