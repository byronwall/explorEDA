# R092 — When wider snapshots change the row-JSON transport decision

- ID: R092
- Category: Measured performance
- Priority: 89
- Kind: follow-up
- Status: candidate
- Confidence: medium
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

The database-adapters map records an earlier 100,000-row, 12-column measurement that kept JSON snapshots. Columnar-data-transport explicitly says to reopen the decision only when measured snapshot cost warrants it. The useful next research question is narrower than repeating an Arrow benchmark: do much wider or text-heavy sources, especially during replacement, cross a threshold that the earlier fixture did not address? `parseSnapshot` and the provider still materialize row-oriented consumers, so wire size alone cannot answer that question.

Compare compressed row JSON with Arrow IPC using the same complete source, projection, ordering, and supported values. Keep a no-change outcome as the baseline. Apache Arrow's format documentation establishes its columnar representation and type parameters, but it does not establish zero-copy behavior through explorEDA's row consumers. Vary column width and string cardinality independently. Include decoder startup, conversion to row objects, field profiling, Crossfilter construction, the first interaction, and the period when both old and new snapshots coexist.

The first experiment should extend the prior row-count range with narrow numeric, wide mixed, and long-text fixtures. Measure cold and warm loads plus an active-view replacement under identical compression. Compare exact values, source identities, contributor sets, latency, and peak memory before reporting byte savings. Accept Arrow only for a named workload where the complete path improves enough to exceed a predeclared maintenance threshold. Reject the change if row materialization consumes the gain, correctness requires unsupported conversions, or the benefit is only a smaller response body.

This is a medium-confidence, deliberately conditional follow-up, not approval to ship both encodings or replace the provider. The earlier JSON result remains valid for its measured workload. A successful study may simply define a capacity envelope and leave transport unchanged. Implementation cost would include decoding and packaging obligations, so evidence must justify it for a solo maintainer. The idea earns a place because it supplies a concrete trigger and rejection rule for an existing ambitious seed instead of recycling its original broad recommendation.

## References

- `docs/intent/database-adapters/initiative-map.json` — `M2 measurement: JSON snapshot kept`. Records the prior 100k-row, 12-column measurement and decision; historical evidence, not rerun here.
- `packages/explorEDA/src/lib/project/snapshots.ts` — `SnapshotFile`, `parseSnapshot`. Current persisted snapshots use ordered row arrays and materialize row objects on load.
- `packages/explorEDA/src/providers/DataLayerProvider.tsx` — `getDataAndCrossfilterWrapper`, `restoreAnalysisFromStructure`. Current consumers build row-oriented state, profiles, and filters.
- `packages/explorEDA/src/lib/readers/readTable.ts` — `readTableFile`. Arrow import is already supported; that alone does not establish transport benefit.
- `docs/intent/columnar-data-transport/intent-brief.md` — related intent; status reconciled against implementation in the brief.
- `docs/intent/database-adapters/intent-brief.md` — related intent; status reconciled against implementation in the brief.
- [Apache Arrow Columnar Format](https://arrow.apache.org/docs/format/Columnar.html) — primary comparison/technical source, accessed 2026-10-20.
