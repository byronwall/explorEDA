# R016 — Regional comparisons with trustworthy denominators

- ID: R016
- Category: Domain analysis
- Priority: 66
- Kind: follow-up
- Status: candidate
- Confidence: medium
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

A regional count map can answer where events are numerous while a rate answers a different question about a population or exposure. `planRegionMap` already performs typed joins, uses shared count, sum, and average semantics, and distinguishes regions with no rows from invalid measures. Those capabilities are delivered. The research question is whether users can establish that a geographic numerator and denominator describe the same region, time, and population before interpreting their colors as a meaningful comparison.

Compare recommending a prepared one-row-per-region rate table with a bounded denominator-aware map workflow built on any later reusable metric contract. Prepared rates keep the library simple and allow specialist source reconciliation. A native workflow could expose numerator and denominator together but must not sum a population value repeated on every event row. Also evaluate whether a separate companion table provides enough evidence without changing map settings. Geometry matching, denominator coverage, and temporal alignment should be examined explicitly; a new ratio control alone cannot guarantee comparability.

The first experiment would use regions with unequal populations, one duplicated denominator, one missing denominator, and one changed boundary identifier. Ask analysts to distinguish the largest count from the highest rate and identify incomparable regions. Acceptance requires inspectable denominator provenance and correct treatment of zero, missing, and mismatched coverage. Reject native map support if it merely duplicates a general metric definition or if the source cannot establish a common population and period. A prepared example with explicit caveats is an acceptable successful outcome of the research.

The simplest outcome is a focused preparation and inspection recipe, with low maintenance cost. Adding map-specific arithmetic would risk parallel definitions and should wait on the reusable-metrics decision rather than create a separate language. This candidate follows that seed through geographic validity, not its generic ratio syntax. Confidence is medium because the region-map implementation is well grounded but no concrete rate dataset is supplied. Its value is checking whether geographical comparison remains defensible when joins succeed technically yet the represented populations are not equivalent.

## References

- Repository: `packages/explorEDA/src/components/charts/Map/regionMapPlan.ts` — `planRegionMap`, `featureValue`, `regionKey`. Region maps join typed keys, use shared count/sum/average reduction, and distinguish empty, invalid, and valued regions.
- Repository: `packages/explorEDA/src/components/charts/Map/RegionTraceBody.tsx` — `RegionTraceBody`. The region trace is the existing place for analytical join and contributor evidence.
- Related intent: `docs/intent/reusable-analysis-metrics/intent-brief.md`.
- Related intent: `docs/intent/current-analysis-trust/intent-brief.md`.
