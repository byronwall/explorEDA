# R097 — Small analytical invariants across complete user workflows

- ID: R097
- Category: Testing and reproducibility
- Priority: 20
- Kind: robustness
- Status: candidate
- Confidence: high
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

The repository already has an unusually useful reliability test: it edits a formula, filters its result, checks the table and CSV, and restores saved settings. Its fixed three-row example establishes a strong starting point. Research could determine which additional invariants cover whole workflows with little maintenance. For example, a permutation of source rows should preserve an order-independent aggregate when logical identities and contributor meaning are retained. That condition matters because positional IDs and order-sensitive calculations cannot be treated as interchangeable.

Compare a small set of generated metamorphic cases with a curated family of explicit regression fixtures. A hybrid could generate only values and retain carefully authored workflow sequences. Candidate properties include save/restore equivalence, idempotent application of an unchanged setting, and commutation of genuinely independent conjunctive filters. State exceptions for floating-point accumulation, first/last operations, ordered windows, and invalid values before writing assertions. The aim is to detect disagreements among public outputs, not to reproduce reducer code in a second test implementation.

Start with three transformations and small seeded tables containing duplicate display values, missing values, and stable record keys. Exercise the provider, visible rows, and CSV through existing seams; compare contributor sets as well as totals. In a later isolated experiment, introduce a known stale-cache or wrong-population fault to assess detection. Accept properties that reveal distinct plausible failures and yield understandable minimal cases. Reject any property with invalid assumptions, redundant coverage, excessive nondeterminism, or a harness whose complexity exceeds the small correctness risks it protects.

This high-confidence robustness candidate extends current-analysis-trust and informs release-gated-checks without changing the present suite or CI. It differs from reducer parity by testing transitions across layers, and from example-claim review by using controlled synthetic evidence. Source inspection establishes the current fixture; no tests were executed here. A compact approach should need no public API or mandatory dependency. The work earns its place because a solo maintainer can gain broad analytical assurance from a few well-chosen properties, provided their mathematical boundaries remain explicit.

## References

- `packages/explorEDA/src/test/providers/analysisReliability.test.tsx` — `keeps the table, active derived filter, edited formula, CSV, and restored analysis in agreement`. Already tests a complete formula/filter/export/restore sequence.
- `packages/explorEDA/src/test/providers/projectIdentity.test.tsx` — `keeps a logical order selection through source reorder and removal`. Exercises logical selection identity within project workflows.
- `packages/explorEDA/src/providers/DataLayerProvider.tsx` — `saveToStructure`, `restoreFromStructure`. Provides the public state transitions that an invariant harness can exercise.
- `packages/explorEDA/src/components/charts/DataTable/DataTableToolbar.tsx` — `toTableCsv`. Exposes a concrete output for comparing analytical results.
- `docs/intent/current-analysis-trust/intent-brief.md` — related intent; status reconciled against implementation in the brief.
- `docs/intent/release-gated-checks/intent-brief.md` — related intent; status reconciled against implementation in the brief.
