# Dashboard text v2 proof

Evidence gathered while redesigning dashboard text (#336–#360). `proof/` holds the reference drafts, agent-written drafts from each round, and the [results](proof/results.md). Shipped syntax: [Dashboard text](../../../apps/demo/src/docs/pages/dashboard-text.mdx).

- `current-exports/` holds six of the 57 demo examples exported with today's `exportDocument` at `f01ff0f`. Each `### VIEW:` marker starts one saved view. The full corpus can be regenerated from `apps/demo/src/demos/examples.ts`.
- `proposed-examples/` holds the same dashboards hand-converted to the proposed syntax. They are illustrative and haven't been compiled.

Corpus baseline (57 examples): 5,031 lines and 7,474 `key=value` pairs. About 2,230 pairs (30%) are default noise and about 3,310 (44%) are `composition.*` paths.
