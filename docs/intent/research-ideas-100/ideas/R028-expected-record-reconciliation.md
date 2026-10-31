# R028 — Define explicit expectations for absent observations

- ID: R028
- Category: Data quality and missingness
- Priority: 48
- Kind: follow-up
- Status: Design plan ready for review; implementation unstarted
- Confidence: medium
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

The [October 31 Design run](../../../research/expected-records-design-2026-10-31/README.md) replaces the older demand gate below. Read the [reviewed expected-record plan](../../missingness-and-expected-records/expected-records-implementation-plan.md) for explicit tables, saved reconciliation, notebook findings, and bounded calendars. Build is a planning disposition. No feature shipped in this run.

A missing cell belongs to an observation that exists; an absent observation needs an independent reason to expect it. The repository already models source keys and relationships, while `sourceReferences` and `lookupFrame` report missing or ambiguous identities. These are useful ingredients, not proof that an expected-record workflow exists. The current missingness intent explicitly requires an expected set. The research opportunity is deciding how little additional structure can make a defensible absence claim.

Compare a second table containing explicit expected keys with a compact declared sampling schedule that generates keys over a bounded interval. The table is general and inspectable; the schedule is concise for repeated measurements but needs start, end, cadence, and exclusions. Existing lookup diagnostics may suffice for the first alternative. Do not build expectations from every observed category combination. A store closed on Sundays, for example, must not acquire fabricated missing observations merely because other stores have Sunday records.

The initial experiment should enumerate a tiny expected set by hand, then add observations with one absent key, a duplicate, a valid zero, and one unexpected key. Run the same reconciliation against an equivalent schedule-generated set. Acceptance requires exact expected, observed, absent, duplicate, and unexpected memberships, with a clear explanation that absent records have no source row to inspect. Reject any design that equates blank chart cells with expected records or cannot express legitimate gaps without special cases.

This is a precise follow-up to an uncommitted intent, not a data-quality rules platform. An explicit table could reuse existing project relationships with very little API surface; schedule generation would add saved semantics and deserve a stronger demand threshold. Keep the two approaches independently researchable. Confidence is medium because source infrastructure exists, but no supplied production sampling plan proves the need. The investigation matters when absence is itself analytical evidence and a normal row filter cannot represent the missing observation.

## References

- Repository: `packages/explorEDA/src/types/AnalysisProject.ts` — `SourceDefinition`, `RelationshipDefinition`, `AnalysisDiagnostic`. Projects already describe source keys, relations, and diagnostics.
- Repository: `packages/explorEDA/src/lib/analysis/evaluateProject.ts` — `sourceReferences`, `lookupFrame`. Existing lookup and identity diagnostics offer a baseline for explicit reconciliation.
- Repository: `packages/explorEDA/src/test/lib/analysis/evaluateProject.test.ts` — `reports ambiguity and duplicate identity without choosing the first match`. Duplicate identities and ambiguous lookups have existing tests.
- Related intent: `docs/intent/missingness-and-expected-records/intent-brief.md`.
