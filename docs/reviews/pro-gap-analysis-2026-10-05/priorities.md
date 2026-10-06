# Important gaps and proposed order

Reviewed on 2026-10-05 against `362db58`. These are recommendations for Byron's review, not approved implementation work.

The largest gap is confidence in the expanded analytical loop. The most important missing capability is reuse of analytical results.
Pro identifies both well. Its P0 evidence program is too broad for the first product step.
Start with one small proof batch and use its results to choose feature work.

## First: prove the results and saved state

| Order | Gap | Why it matters | Small decisive proof |
| --- | --- | --- | --- |
| 1 | Contributor and filter agreement: FILT-01/02, CALC-06, TRACE-01, UX-01/02 | A plausible chart can hide a wrong population or denominator. This affects existing work across chart types. | Use Pro's six-row fixture. Compare exact source keys, eligible numeric keys, counts, sums, and averages across table, grouped bar, card, and trace. Include blank, null, negative, and valid zero. |
| 2 | Edited-state restore and real export: DASH-03/04, TABLE-10/11 | JSON controls exist, but preset loading does not prove that users can recover their edits. | Edit a formula, filter, width, and order. Export settings and full analysis, reopen each through the actual host flow, and compare applied state and downloaded CSV bytes. Add one Region Map geometry roundtrip. |
| 3 | New selection and date semantics: FILT-02/08/11, CHART-01/03, SCALE-03 | Pair selection, Other membership, stack shares, and UTC buckets have different contracts. | Select one category-series pair. Check IDs. Resize Other and retain members. Compare UTC rollups at the offset/leap-day boundaries. Check percentage denominators and missing periods. |
| 4 | Reachable controls: FILT-03, TABLE-01/03, UX-03/04 | Correct source behavior has little value if controls cannot be found or operated. | Use keyboard focus to reach owner navigation, Clear sort, a trace, and its return path. Check the flow at 1280 and 1024 pixels. Record narrower behavior separately. |

This is a verification gap, not a report of four reproduced defects.
The chart initiative remains retired. Its waived checks remain waived.
Byron can approve this as a new bounded batch without reopening that initiative.
Pro's BT03, BT07, BT10, BT11, BT12, BT18, BT22, and BT29 contain useful starting steps.
Do not run all 35 scenarios before getting value from the first batch.

## Then: choose the missing capability with a real consumer

| Rank | Missing capability | Current support and remaining limit | Recommendation |
| --- | --- | --- | --- |
| 1 | Reusable intermediate results: DATA-08, CALC-08, TRACE-02 | Named grouped summaries exist. Pivot, density, and modeled outputs are not general downstream chart inputs. | Pick one task: use a named grouped result in two different views. Prove shared scope and contributor identity. Defer a universal transform graph. |
| 2 | Source identity and saved analyses: DATA-04, DASH-02/04/06, TABLE-09 | Positional IDs and manual JSON support one snapshot. They do not identify the same record after replacement or provide named host saves. | For retained discoveries, define a source key and source binding first. Then add the smallest host save/reopen flow. Keep storage in the host. |
| 3 | Relative date windows: FILT-11 | UTC Calendar and line summaries exist. Rolling/completed periods and stepping remain absent. | Add one period use case with explicit reference time and save semantics. Check month end, leap day, and timezone offsets. |
| 4 | Content auto-fit: TABLE-02 | Drag/keyboard resize and Reset width exist. Reset width uses the field name, not cell content. | A small direct improvement for wide or unknown tables. Use a bounded sample and a width cap; no new layout system is needed. |
| 5 | Default and field eligibility explanations: DATA-01/03, DASH-01 | Profiles, conversion previews, Fields, and header distributions exist. Preflight and role guidance remain partial. | Improve the point where a user picks fields or applies conversion. Preserve Summary plus rows as the initial view. |

These ranks reflect repeated transcript outcomes and dependency value.
They are not effort estimates. A concrete current task can move relative dates or auto-fit ahead of broader reuse.
Source identity is urgent when retaining selections across changed data; it is less urgent within an exported fixed snapshot.

## Keep separate

Advanced scatter and compact authoring already have [plans](../../intent/advanced-scatter-analysis/intent-brief.md).
The [authoring plan](../../intent/config-authoring-dsl/intent-brief.md) remains separate from runtime coverage.
Pro correctly keeps both planned-only. Choose them for a real analysis or authoring task, not to improve a completion score.

Multi-source joins, server projection, rich cells, hierarchy layouts, and renderer-independent scenes retain transcript support.
Their current scope is parked or task-dependent. Geometry joins do not establish analytical multi-source support.
Heatmaps do not establish correlation or expected-observation analysis.
These ideas need a data contract and a consumer before implementation.

Measure performance before selecting workers or caching changes.
The 10,000-row examples show data shape. They do not establish a capacity guarantee.

## What Pro got right, and what needs restraint

Accept its correction of stale feature claims, its separation of plans from code, and its honest browser limit.
Accept its narrow matrix interpretation: reviewed means one recorded assignment, not complete feature certification.

Do not treat every untested feature as a defect. Pro reproduced no new runtime defect.
Do not make all evidence infrastructure a P0 prerequisite for product work.
A current ledger, a reachable review target, and retained proof for the next batch are enough to start.
The complete [reconciliation ledger](reconciliation.json) retains each of the 92 outcome decisions.
