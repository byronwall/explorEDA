---
"exploreda": minor
---

ExplorEdaProject can run its queries in a worker: pass createWorker={createAnalysisWorker} from exploreda/analysis. Charts keep the last finished result while the next one runs, and late results are dropped.
