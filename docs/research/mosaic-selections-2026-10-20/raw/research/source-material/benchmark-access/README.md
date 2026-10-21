# Official benchmark access and methodology

**Source ID:** BENCH-HARNESS  
**Repository:** [uwdata/mosaic-selection-benchmarks](https://github.com/uwdata/mosaic-selection-benchmarks/tree/72b82e1bad3e96786e63bb10877b4d5cd48cc2f5)  
**Pinned ref:** `72b82e1bad3e96786e63bb10877b4d5cd48cc2f5` (25 June 2025)  
**Research access:** 21 October 2026 UTC

`access-index.json` lists fourteen inspected files: README/package metadata, benchmark/run/analyze/tile-pan code, command configuration and sparsity metadata, result plotting code, and four published CSV examples. Each entry includes an immutable URL, byte size and SHA-256. Those original files were downloaded for reading and arithmetic only; the benchmark was not executed.

No repository license was found in the inspected tree. Full source and result CSVs are not redistributed here. The following short technical excerpt from `src/run.js` identifies the implementation seam only:

```js
export async function run
```

Consult the exact source URL for complete syntax and behavior. The original analytical note is `../research-notes/performance-review.md`.

## What was verified by reading

- Table load is a separate recorded stage. Construction/update plotting omits load.
- A group of concurrent query tasks is summarized as latest completion minus earliest start, not an average of each query's duration and not browser paint.
- Prefetch is awaited after the current timed request and before the next one, creating favorable lead time outside that displayed latency.
- UK property updates its regression fit only in the benchmark.
- The sparsity script and paper Table 5 differ in airline and Gaia dimensions. Those differences are recorded, not empirically reconciled.

## Descriptive arithmetic actually performed

The independent audit recalculated group medians from four already-published CSV files. This is a check of archived values, not a new measurement. It found optimized 100-million-flight update median about 1.624 ms and construction median about 589.226 ms, while base-table load was about 3,383.144 ms. Optimized and standard runs differ in update record counts, so the report does not treat them as perfectly paired experiments.

The paper's medians and interquartile ranges, the archived CSV summaries and the proposed explorEDA p50/p95 benchmark are three different things. None is a current explorEDA runtime result.
