# Research recommendation review

This review reconciles the October 12 Pro research packet with the current checkout and provider documentation. The report and recommendation JSON remain unchanged in `raw/2026-10-11-pro/`. Pro recommendations are proposals. Repository checks below are source inspection, not runtime proof.

## Dispositions

| ID | Disposition | Reason and qualification |
| --- | --- | --- |
| DQC-001 | adopt | Keep `AnalysisQuery` as authored intent. Use the host-owned source reader to fill the existing `ExplorEdaProject.tables` input so the local evaluator retains stages and contributors. A remote output relation remains a later read-boundary candidate. |
| DQC-002 | adopt | Preserve selected, chart-owner-excluded context, workspace, chart-local, and facet scopes. `CrossfilterWrapper.ts` applies all linked filters for global rows and separately restricts a chart to its own population. Exact facet and Rows behavior still needs caller-level confirmation. |
| DQC-003 | investigate | Output-only projected rows are not the default or runtime fallback. First return complete authorized source-table snapshots. Investigate a projection only after a named workload misses an agreed budget, and only if dependency closure covers every admitted operation and inspection path. No performance comparison is measured. |
| DQC-004 | adopt | Treat row and field completeness, schema, row grain, analysis semantics, customer/source ownership, and snapshot identity as separate admission facts. Unknown containment must fail closed. Current `DataLayerProvider.getColumnData` can return an all-undefined column for an absent field. |
| DQC-005 | defer | Add aggregate/page reads only when a named workload or required access pattern shows why complete source snapshots fail. Existing stages, source rows, and contributor behavior need a deliberate consumer path for compact results. |
| DQC-006 | adopt | Separate request relevance, semantic result identity, server-owned customer/source ownership, and actual source snapshot identity. The current worker hook rejects older request IDs, but its `revision` does not prove remote database consistency. |
| DQC-007 | adopt | Declare supported values, calculations, joins, keys, null rules, and comparison behavior. Keep unsupported cases explicit. Validate the admitted operation set before claiming parity. |
| DQC-008 | defer | Complete source snapshots let the existing evaluator keep local stage and contributor evidence. Snapshot-bound handles become necessary only if later aggregate or remote-stage paths omit that evidence. |
| DQC-009 | defer | A first complete-source read needs no general demand combiner. If later requests are shared, combine only exactly compatible scopes, ordering, page, and value semantics with direct checks. |
| DQC-010 | adopt | Use a deterministic fake with delayed, reordered, failed, and incomplete source replies, then one immutable read-only database fixture. The fixture is a proposal, not a selected production adapter or parity proof. |
| DQC-011 | defer | Defer a general optimizer, arbitrary SQL, universal translation, retained mutable snapshots, and progressive region caches until a concrete workload rejects complete source snapshots. |
| DQC-012 | reject | Reject silent truncation, unavailable-as-null evaluation, partial-as-complete admission, misleading exact previews, and identities that do not survive the stated source/snapshot scope. |

## Direct verification

The current checkout is at `28c5ac27a400aa1fd66ce99eb1e6bd4ab5c72e9c`. Source inspection confirms:

- `packages/explorEDA/src/types/AnalysisProject.ts`: `AnalysisQuery` holds source/lookup/expand/calculate/filter/aggregate steps; `AnalysisView` separately holds query ID, bindings, settings, and inspection. `AnalysisEvaluation` contains rows, stages, diagnostics, counts, and a revision.
- `packages/explorEDA/src/hooks/CrossfilterWrapper.ts`: `getFilteredRowIds` obtains the global Crossfilter population; `getChartFilteredRowIds` then applies chart-local population restrictions. `getAllData` reads chart groups that already exclude their own linked dimension.
- `packages/explorEDA/src/providers/DataLayerProvider.tsx`: `getColumnData` returns `emptyColumn` when a requested field is absent. This is safe only for the current full local data model; a remote cache must track availability before calling it.
- `packages/explorEDA/src/lib/aggregates.ts`: `poolAggregateRows` reassembles contributors and reduces them again, including entity identity. A server aggregate cannot be substituted without enough state or an explicit unsupported result.
- `packages/explorEDA/src/lib/analysis/useAnalysisEvaluation.ts`: the worker hook ignores old request IDs and retains the previous successful result for the same query while pending. This does not bind it to remote data freshness or snapshot identity.
- `packages/explorEDA/src/components/ExplorEdaProject.tsx`: current chart rows receive positional numeric `__ID` values, while separate maps connect evaluation row keys and positions. Those positions cannot serve as stable remote identity across reordered pages.
- `ExplorEdaProject` already accepts source tables, and `useAnalysisEvaluation` feeds the existing local evaluator/optional worker. Keeping complete authorized source arrays at this seam preserves the current stage, contributor, and inspection model.

No application tests, type checks, browser checks, database queries, performance measurements, or provider parity tests were run in this shaping pass.

## Current provider facts used

- PostgreSQL 18 documents that `READ COMMITTED` takes a statement snapshot, while `REPEATABLE READ` keeps a transaction snapshot. Exported snapshots remain importable only while the exporting transaction stays open. This supports the warning that an ID string alone does not guarantee later reads share data. [Transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html), [snapshot synchronization](https://www.postgresql.org/docs/current/functions-admin.html#FUNCTIONS-SNAPSHOT-SYNCHRONIZATION).
- PostgreSQL documents that `LIMIT` needs a unique order to select a predictable subset. A stable order still does not pin mutable source contents. [LIMIT and OFFSET](https://www.postgresql.org/docs/current/queries-limit.html).
- The Fetch Standard abort algorithm rejects the fetch promise and cancels/errors request or response streams. It does not define whether an application database job stopped. [Fetch Standard](https://fetch.spec.whatwg.org/#abort-fetch). The adapter must expose and prove its cancellation behavior.
- PostgreSQL's cancel documentation says a successful cancellation dispatch does not guarantee an effect. The TypeScript driver is not selected, so driver behavior remains unknown. [Canceling queries in progress](https://www.postgresql.org/docs/current/libpq-cancel.html).

## Uncertainties and cross-track handoff

The current source review does not settle whether first success must include analysis-stage inspection, how Rows search/sort callers assemble populations, or the exact facet/bin selection conversion. These require a targeted source/caller and behavior pass before implementation. The Pro source packet did not include every caller/helper, and none of these paths was executed here.

Transport must preserve typed scalar meaning, stable keys, request/result identity, server-owned customer/source scope, snapshot identity, completeness, and bounded staging. Adapter research must define supported value/step semantics, row grain and keys, schema, snapshot lifetime, result limits, and actual driver cancellation. The authenticated host instance selects its own source registry. Query and snapshot identities include that server-owned instance and source scope; a browser-supplied customer selector is not authoritative.

The source notes and customer update do not create a material unanswered query-track question. The added customer requirement belongs to the fourth hosting track; it changes the deployment context to one instance per paying customer, not this track's read and filter semantics.
