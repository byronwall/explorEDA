# R042 — Find a minimal reusable wide-to-long reshaping contract

- ID: R042
- Category: Data preparation and relationships
- Priority: 75
- Kind: new-direction
- Status: design researched; implementation proposed
- Confidence: medium
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

The October 23 [Design review](../../../research/wide-long-2026-10-23/README.md) selects one saved `unpivot` query step.
Read the [implementation plan](../../wide-long-reshape/implementation-plan.md) for its contract and milestones.
This is proposed capability, not shipped behavior.

Repeated measurements arrive as columns while useful comparisons need a measurement-name field and a value field.
Save explicit selected/kept fields, ordered mappings, stable output IDs, a declared value family, optional units, and a missing policy.
Open a copied query in a fresh view. Keep exact input-cell evidence separate from original-record membership.
Preserve raw scalars and missing pairs by default. Added source columns remain outside the saved selection.

M1 includes evaluation, authoring, exact evidence, worker consistency, JSON/text restore, documentation, and a runnable example.
M2 adds explicit refresh repair and broader selection by immediate input rows.
Multiple value families and global unit metadata remain Explore; patterns and reverse pivot remain deferred.
Keep ordinary prepared long sources supported. Do not create a general preparation graph or result catalogue.

The five-record fixture yields ten pairs, three missing pairs, five finite measurements, and numeric sum 28.5.
Drop mode yields seven pairs. Current non-nullish field count is eight in keep mode.
These arithmetic checks and existing evaluator tests do not prove the unimplemented feature.
Empty-result text restore, applied worker snapshots, exact cell evidence, and browser flows remain implementation requirements.
The current research direction supersedes this candidate's earlier outside-demand gate. Byron is the demand.

## References

- Repository: `packages/explorEDA/src/types/AnalysisProject.ts` — `AnalysisStep`, `AnalysisResultRow`, `AnalysisField`. The query-step union and result provenance define current preparation scope.
- Repository: `packages/explorEDA/src/lib/analysis/evaluateProject.ts` — `calculateFrame`, `aggregateFrame`. Existing preparation already handles scalar and grouped stages.
- Repository: `packages/explorEDA/src/lib/analysis/sources.ts` — `addSourceFromRows`. A prepared table can already be introduced as a source.
- Related intent: `docs/intent/reusable-analysis-outputs/intent-brief.md`.
