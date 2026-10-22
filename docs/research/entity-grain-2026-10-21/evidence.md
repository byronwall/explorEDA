# R043 checked evidence

Reviewed October 21, 2026. Baseline and refreshed origin/main: `f4cacdde180e16ad814451a8c064e394535565d6`.
Application source is unchanged. The scoped branch contains research additions only.

## Original assets

Collection checked all six assets, byte counts, hashes, and five independent companion matches.
Archive CRC, exact five-entry root inventory, flat safe paths, no symlinks, UTF-8, and report manifest checks pass.
The ZIP event wait timed out; the normal browser download succeeded. No downloaded program ran.
The four original reports were read in full. Raw originals remain separate from this review.
Pro's freeze timing and original oracle hashes are attributed provenance. Separate freeze originals were not delivered.
The complete declared oracle is included in proof-plan.md. Local probes use its fixed F2-min/F4 expectations without rewriting them.
Pro's forty arithmetic assertions are not local product tests. No broad fixture pass is inferred from them.

## Current repository checks

Source receipts authenticated baseline and pinned historical Git objects.
Current supplemental files match the same baseline. The application did not change between submission and review.

- `aggregates.ts::summarizeGroup` uses typed entity values, nullish exclusion, and `Object.is` agreement.
- `evaluateProject.ts::sourceReferences` uses occurrence fallbacks for missing/duplicate declared keys.
- `aggregateFrame` uses source origin/reference identity when available, then value/null result-row fallback.
- Its conflict guard applies to numeric sum/average; measured count keeps the surviving nonnull candidates.
- `AggregateMeasure.entityFieldId` describes conflicting values as unavailable without a count exception.
- `QueryFlow::Diagnostics` renders counts by code. It does not render the identity message.
- `QueryStageRows::relatedRecords` retains contextual source records and expands related child records.
  It is not an exact numeric contributor ledger. The current display omits `measureContributors`.
- `AggregateContributorTable` renders source ID, input, raw input, type, and reason. It omits entityKey.
- `MetricCardTraceBody` uses row wording. `planMetricCard` clears measureField for count.
- Stage `excludedCount` sums false entries across measure ledgers. It does not count unique source rows.
  The inspected flow does not display that value; no visible zero-excluded defect is claimed.

## Executed local probes

[Locally authored probe](evidence/local-probe.test.tsx), [log](evidence/local-probe.txt), and [results](evidence/local-results.json).
The probe ran from temporary `packages/explorEDA/src/test/lib/analysis/r043.probe.test.tsx`, then moved here.
To reproduce, copy it back to that path, run the command in the results file, and remove the temporary copy.
No permanent package test or product code changed. No downloaded code was executed.

1. F2-min: real shared reducer and public project evaluator. Expand x/x/y with measures 10/20/5.
   Assert exact expanded IDs, both parents and all three witness references, conflict reasons, and retained numeric y.
   Shared measured count is unavailable; project is 1. Numeric sum/average are unavailable. No-measure count stays 2.
   Negative control changes only 20 to 10: both measured counts 2, sum15, mean7.5; no diagnostics.
2. F4: real lookup, calculate copy, and project aggregates. Broken declared keys do not break distinct join keys.
   Source-origin representatives L1/L3/L5/L6 yield count4,sum30,mean7.5.
   Copied-null fallback representatives L1/L2/L3/L6 yield count4,sum27,mean6.75.
   Shared typed selected values use L3/L6, sum17; missing IDs stay excluded.
   Exact ten-source group membership survives. One missing-key and two duplicate-key diagnostics appear.
   Unique-key negative control converges to count4,sum30,mean7.5 in both project paths and shared summary.
3. Static component render: two x rows produce one entity count, two contributor records, and current row wording.
   This confirms rendered text and plan units. It does not establish browser usability or measured-count card failure.

The existing two reducer/project suites passed 17 tests at submission. Their ordinary shop controls remain unchanged.
The full frozen F1 matrix, filter hooks, pooling additions, raw number/text and signed-zero variants were not run locally.
Browser, author, persistence, restore, export, SQL, and performance proofs remain proposed.

## Independent primary-source checks

Checked October 21, 2026 using official DuckDB documentation. Direct extensionless opens initially failed;
LTS links and their visible redirect links resolved to the same 2.0 pages.

| Source                                                                      | Supported claim                                                                                                                             | Limit                                                                                                        |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| [Aggregate functions](https://duckdb.org/docs/2.0/sql/functions/aggregates) | Count rows differs from count(nonnull argument). DISTINCT works on values. Sum/average skip nulls; empty numeric groups remain unavailable. | Does not establish installed 1.5.6-r.1 driver/runtime behavior or JavaScript invalid-number policy.          |
| [FROM and JOIN](https://duckdb.org/docs/2.0/sql/query_syntax/from)          | Left joins preserve unmatched left records with null right fields; semi joins retain matched left records without fan-out.                  | Recipe types, key validity, cardinality, and provenance remain authored preconditions. SQL was not executed. |

Two independent events with equal amount10 must remain two events. Using DISTINCT(amount) would merge their values.
This is a relational inference from the documented value-level operation, not a measured product result.

## Historical boundaries

Reuse [PR451 summary](https://github.com/byronwall/explorEDA/blob/0984715cb4c0c85d0d6efa8436ab38368bd20ae1/docs/research/data-preparation-boundary-2026-10-16/README.md),
[decisions](https://github.com/byronwall/explorEDA/blob/0984715cb4c0c85d0d6efa8436ab38368bd20ae1/docs/research/data-preparation-boundary-2026-10-16/decisions.md),
and [proof proposal](https://github.com/byronwall/explorEDA/blob/0984715cb4c0c85d0d6efa8436ab38368bd20ae1/docs/research/data-preparation-boundary-2026-10-16/originals/proof-plan.md).
Its author and exact-contributor proofs remain unrun. Prepared-row provenance does not create underlying database lineage.
R026 is complete in PR465. R008 is complete in PR464. R011 reuses PR461. R077 remains a separate replacement-identity mission.
