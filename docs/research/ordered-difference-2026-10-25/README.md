# Build reusable observation comparisons

Design topic: ordered lag and difference preparation, scored **18/20**.
Build **Compare observations** as an explicit `ordered` query step.
It names a population and complete order, then adds reusable previous-value and numeric-change fields.

[Implementation plan](../../intent/ordered-difference/implementation-plan.md) · [Run record](run.md) · [Pro conversation](https://chatgpt.com/c/6addaf82-cf90-83ea-94fd-87064519928f)

## Decision

Ship text/API authoring with inspection, persistence, notebook reuse, docs, and a runnable readings project first.
Then add compact visual authoring and dependency-checked movement across an adjacent filter.
Keep current row identity and membership. Store predecessor evidence separately.

The exact fixture demonstrates why query position matters.
Removing a2a before preparation makes a2b's change **8**; removing it afterward leaves change **4**.
The latter inspector must still open a2a as a dependency, without counting it as a current member.
Missing measures keep their positions. Unresolved full-order ties block the affected partition, while other partitions remain usable.

## Local review

Checked against origin/main `95832bd4`, unchanged after refresh:

- `calculateFrame` sees one row. The existing six-operation union needs an explicit new member.
- `queryFields` evaluates empty tables, so schema cannot depend on successful comparisons.
- `aggregateFrame` supplies numeric measure ledgers; predecessor dependencies must not enter its membership unions.
- `useAnalysisEvaluation` retains old results and bindings, while the project wrapper passes current tables to inspection.
- `projectFile.ts` has two operation allowlists and a recursive aggregate fallback which need explicit ordered handling.
- `writeFolder.ts::projectFileText` omits every implicit query ID, including one edited after load.
- Notebook/analysis readers pass rows without evaluated fields. Compiler, exporter, React host, and chart write-back need schema forwarding.
- `sourceFromRows` can generate unique-looking positional keys. Bare-key selection encoding cannot prove refresh identity.

The local plan narrows Pro's identity proposal.
Exact selections in prepared queries are session/evaluation-generation scoped and become unresolved after refresh or reopen.
This also invalidates stable-key selections. It avoids source-origin metadata, generated-column reconstruction, and a key-recipe system.
Selection survival is separate work. No outside-demand gate applies.

## Recommendation dispositions

Build means include in the proposed plan, not approval to implement or ship.

| Pro ID | Local disposition | Reason                                                                                                             |
| ------ | ----------------- | ------------------------------------------------------------------------------------------------------------------ |
| OD-01  | Build             | Use one explicit ordered project operation.                                                                        |
| OD-02  | Build             | Save typed order terms and require a unique full order.                                                            |
| OD-03  | Build             | Block the affected eligible partition when ties remain.                                                            |
| OD-04  | Build             | Retain unusable partition/order rows with reasons.                                                                 |
| OD-05  | Build             | Missing measures keep their observation positions.                                                                 |
| OD-06  | Build             | Raw lag and shared finite-number subtraction preserve clear semantics.                                             |
| OD-07  | Build             | Compact comparison evidence stays separate from current membership.                                                |
| OD-08  | Build             | Query-filter position controls the preparation population.                                                         |
| OD-09  | Build             | Inspection uses the accepted result's project and source tables.                                                   |
| OD-10  | Build, narrowed   | An applied-generation guard invalidates all exact selections after refresh/reopen; selective survival is deferred. |
| OD-11  | Build, scoped     | Complete native/text/folder/schema round trips; omit unrelated empty-key validation and generated-key changes.     |
| OD-12  | Build             | Add visual preview/edit and bounded filter movement in M2.                                                         |
| OD-13  | Build             | Ship exact fixtures, docs, and runnable examples in each milestone.                                                |
| OD-14  | Explore           | Measure the real evaluator and worker path before optimizing.                                                      |
| OD-15  | Defer             | Duration and rate require clock and unit rules.                                                                    |
| OD-16  | Defer             | Skip-missing neighbors, lead, and calendar comparisons answer different questions.                                 |
| OD-17  | Avoid             | Generic windows and canonical chart-local lag enlarge or weaken this boundary.                                     |
| OD-18  | Avoid             | A lineage platform, cache, index, cap, or backend lacks a demonstrated need.                                       |

## Sources and evidence limits

Spot-checked primary sources:

- [PostgreSQL window tutorial](https://www.postgresql.org/docs/current/tutorial-window.html): analytic order differs from display order; filter placement changes the input population.
- [PostgreSQL function reference](https://www.postgresql.org/docs/current/functions-window.html): positional lag and its null behavior.
- [Polars over](https://docs.pola.rs/api/python/stable/reference/expressions/api/polars.Expr.over.html): explicit within-partition order and mapping results to row positions.
- [Tableau Prep multi-row calculations](https://help.tableau.com/current/prep/en-us/prep_multirow_calculations.htm): partition/order controls, offset, preview, and participating records.

These support the boundary and workflow. The selected tie, missing-order, and refresh rules are our proposals.
Pro also compared DuckDB and pandas; their defaults do not define explorEDA semantics.

A locally authored SQLite oracle independently checks the fixture maps, filter placement, totals 16/16/12,
offset two, descending order, input reversal, empty/singleton data, and refreshed values 10/-2.
No downloaded program ran. No implementation, mounted browser, persistence, or performance acceptance is claimed.
Original reports remain under ignored tmp/. No follow-up was needed.

Open tradeoff: refresh/reopen requires exact re-selection, including stable keyed rows.
The plan chooses this simpler boundary. Duration, rate, and selective selection survival remain deferred.

## Preserved Pro result materials

[Complete original Pro artifacts](../../intent/ordered-difference/assets/pro-results/ordered-difference-2026-10-25/ASSET_INDEX.md) are preserved under the intent entry. ZIP containers remain local.
