# R039 — Choose explicit repair policies for duplicate entity keys

- ID: R039
- Category: Data preparation and relationships
- Priority: 53
- Kind: follow-up
- Status: candidate
- Confidence: medium
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

A relationship can become unusable when two records share the key that the author expected to be unique. The evaluator already reports duplicate identities and ambiguous lookups rather than selecting the first match. `sourceFromRows` also prefers a genuinely unique key and otherwise creates a row number. Those protective behaviors are shipped. The research opportunity begins after the diagnostic: what evidence helps an analyst distinguish duplicate data from legitimate repeated events and choose an appropriate repair?

Compare a grouped duplicate inspection with guidance to select a better entity key, an explicit deduplication preparation step, and leaving the repair upstream. Deduplication must distinguish exact repeated records from conflicts under the same key. Keeping the latest record is only meaningful when the task supplies an ordering field and tie rule. A composite key may be preferable to deletion. The goal is restoring the intended row meaning, not making a warning disappear by silently reducing the table.

The first experiment should contain an exact duplicate, conflicting attributes under one customer key, and repeated events that legitimately share a customer. Reviewers must explain the desired entity before trying each repair route. Accept a path when it preserves every distinct observation or names the rows deliberately removed, then produces the expected relationship cardinality. Reject any default that keeps the first row, assumes arrival order means recency, or merges valid repeated events simply to satisfy uniqueness.

This follow-up extends current-analysis-trust and the reusable-output discussion without treating diagnostics as absent. An inspection-only recommendation has little API cost; saved deduplication or composite-key definitions would add preparation semantics and require contributor preservation. Keep scope local to one source and one relationship. Confidence is medium because the implementation exposes a concrete stop point, but user demand for in-app repair is unknown. The investigation earns its place by seeking a small continuation from an existing correctness safeguard rather than weakening that safeguard.

## Design result, October 31, 2026

The [Design study](../../../research/duplicate-repair-design-2026-10-31/README.md) recommends a named reusable repaired source.
Read the [implementation plan](../../duplicate-key-repair/implementation-plan.md) and
[original results](../../duplicate-key-repair/assets/pro-results/README.md).
Start with exact/manual whole-record choices, full evidence, relationship reuse, saving, and current notebook results.
Add declared ordering next, then composite grain and endpoints together. This is a plan, not shipped behavior or implementation approval.
The older outside-demand gate above is superseded by DIRECTION.md. R039 rank remains unchanged.

### Original references

- Repository: `packages/explorEDA/src/lib/analysis/sources.ts` — `sourceFromRows`. Source creation chooses unique keys or supplies row numbers.
- Repository: `packages/explorEDA/src/lib/analysis/evaluateProject.ts` — `sourceReferences`, `lookupFrame`. Duplicate identities receive diagnostics and ambiguous lookups do not pick one match.
- Repository: `packages/explorEDA/src/test/lib/analysis/evaluateProject.test.ts` — `reports ambiguity and duplicate identity without choosing the first match`. The conservative behavior is covered by tests.
- Related intent: `docs/intent/current-analysis-trust/intent-brief.md`.
- Related intent: `docs/intent/reusable-analysis-outputs/intent-brief.md`.
