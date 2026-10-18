# Independent evidence review

Reviewed on 2026-10-18. Local HEAD and the submitted source baseline are `b07f3cf3483130f6cc3391bba47a87f616c93321`.

## Repository checks

| Claim                                         | Evidence checked                                                                                                                            | Result and limit                                                                                                                                                                                         |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Grouped outputs exist                         | `packages/explorEDA/src/types/AnalysisProject.ts`: `AggregateStep`, `AnalysisView`; `src/lib/analysis/evaluateProject.ts`: `aggregateFrame` | Confirmed in source. Steps can consume another step in the same query. No query-as-source operator exists in the step union.                                                                             |
| Entity reduction handles expansion repetition | `aggregateFrame` uses the source reference of the entity field when available                                                               | Confirmed. It selects one representative per source identity. Distinct physical rows with duplicate business keys remain distinct. It is not data cleaning.                                              |
| Ambiguity is not absence                      | `lookupFrame` selects only one match; `filterFrame` accepts null/undefined for `is-null`                                                    | Confirmed. Both no match and multiple matches project undefined. Diagnostics must gate business classification.                                                                                          |
| Membership differs from numeric input         | `aggregateFrame` builds group references and separate `measureContributors`; count takes a separate branch                                  | Confirmed. Context references can accompany numeric candidates. Count has no numeric candidate entry. Conflicting entities make the whole numeric measure unavailable.                                   |
| Row identity fallback needs care              | `components/project/sourceRowIdentity.ts`: `sourceRowIdentities`, `resolveSourceRow`                                                        | Newly checked beyond Pro's packet. Duplicate or missing keys use positional row references. This supports a refresh/restore investigation; it does not prove selection drift.                            |
| Snapshot reads finish before publication      | `server/sources/read.ts`: `readSnapshot`; `refresh.ts`: `readAndWrite`, `writeWhole`                                                        | Newly checked read implementation. Limits throw before returning a snapshot. Publication follows the read and uses a temporary file rename. Per-source behavior does not establish a shared transaction. |
| Existing SQL example repeats order amount     | `apps/demo/src/docs/pages/database-sources.mdx`, Connections and sources                                                                    | Confirmed: the return join selects `o.amount`. A future recipe must state its return grain and prevent an unexplained additive interpretation. No docs-site change in this PR.                           |
| Inspection may need a bounded repair          | `QueryStageRows.tsx`: `Cell`, `relatedRecords`; `ProjectQueryPanel.tsx`: frame label                                                        | Missing cells render a dash. Related records are contextual. No browser evidence establishes which repair the author task needs.                                                                         |

The missing helper review strengthens specific claims. It does not certify all driver behavior, refresh orchestration, chart consumers, or saved-state behavior.

## Current primary sources

These pages were independently opened on 2026-10-18. Pro's detailed source list remains in the unchanged report.

| Source                                                                                     | Verified claim                                                                                     | Decision effect                                                                                               |
| ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| [DuckDB UNPIVOT](https://duckdb.org/docs/current/sql/statements/unpivot)                   | SQL-standard syntax includes `INCLUDE NULLS`.                                                      | A null-preserving upstream route exists. Actual recipe, driver types, and author effort still need execution. |
| [Observable Framework data loaders](https://observablehq.github.io/framework/data-loaders) | Build uses cached outputs unless invalidated. Loader failure differs from successful empty output. | State freshness and failure scope explicitly. A successful build does not imply a fresh read.                 |
| [Evidence Models](https://docs.evidence.dev/core-concepts/models)                          | Current docs describe model grain and manual/scheduled refresh.                                    | Use the current product comparison. Do not infer demand for the same infrastructure.                          |
| [OpenRefine expressions](https://openrefine.org/docs/manual/expressions)                   | Transformations run once; the editor previews rows and offers error policies.                      | Consider visible before/after feedback. Do not assume spreadsheet recalculation semantics.                    |

The recommendation is an inference from existing local capability and implementation cost. External documentation supplies alternatives, not proof of user demand. Other secondary comparison claims remain attributed to Pro; no competitor runtime test was performed.

## Validation boundaries

- Archive inventory, CRC, paths, file types, UTF-8, and all five published hashes passed.
- Each separately downloaded Markdown companion matches its archive member byte for byte.
- All four substantive artifacts were read. Ten recommendation IDs and six queue entries are present.
- Source inspection is separate from runtime evidence. The 18-row proof, SQL setup, and author flow remain unrun.
- Root repository checks are recorded in the run record. They do not execute the proposed proof.
- This PR changes repository research and intent links only. No changed product flow requires viewport screenshots or a package changeset.
