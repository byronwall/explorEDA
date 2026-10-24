# Build rolling calendar summaries with exact records

Decision: add a chart-local pooled rolling overlay to Calendar summaries, then add explicitly named equal-period means.
The [implementation plan](../../intent/rolling-windows/implementation-plan.md) defines two shippable milestones and exact fixture values.
No feature code is included. Build means planned work, not approval to ship.

Topic score: **18/20** — Capability 4, Pro advantage 5, Buildable 5, Momentum 4.
Mode: Methods. [Pro conversation](https://chatgpt.com/c/6adcb140-c7a0-83ea-94d9-a1a6522f3f5b).
Pro completed after 24m17s. Both reports were collected and read. No follow-up was needed.
Source checked against refreshed main `95832bd473884aeae23453af0888b4ca5187820d`.
Original reports, ZIP, and scratch evidence remain under ignored tmp/.

## Key findings

- A trailing K-period window includes actual calendar slots, including gaps. Use UTC `[start,end)` boundaries.
- Pool observations first. Daily inputs `[10,20]` and `[90]` give mean 40; equal-period means give 52.5.
- Calendar span, valid numeric support, and collection coverage are separate. Gap-to-zero drawing never supplies observations.
- Peer filters precede calculation; own selection follows it. A rolling point selects its exact source members.
- Keep bucket statistics and contributors once. Freshly merge compensated statistics; resolve large evidence sets on demand.
- Current row IDs are positions. Existing refresh remapping is conditional; settings imported onto unrelated data need explicit treatment.

## Local dispositions

| Pro ID | Disposition | Local decision                                                                                         |
| ------ | ----------- | ------------------------------------------------------------------------------------------------------ |
| RW-01  | Build       | Calendar overlay earns a complete feature without a new preparation engine.                            |
| RW-02  | Build       | Trailing actual UTC periods keep membership clear through gaps and unequal months.                     |
| RW-03  | Build       | Count members; sum/mean use finite inputs, with distinct support and denominators.                     |
| RW-04  | Build       | Show calendar availability and numeric support; leave collection coverage unknown.                     |
| RW-05  | Build       | Preserve peer-before/own-after evaluation and local/facet population.                                  |
| RW-06  | Build       | Exact member/used/excluded sets, facet-accessible traces, and snapshot selections belong in M1.        |
| RW-07  | Build       | Fresh compensated bucket merging and lazy provenance; narrow any shared reducer change.                |
| RW-08  | Build, M2   | Equal-period mean is a separate estimand with period support and visible weights.                      |
| RW-09  | Explore     | Coverage-based totals/rates need explicit collection/exposure assumptions.                             |
| RW-10  | Defer       | Elapsed, positional, centered, and local-time modes change membership and need distinct contracts.     |
| RW-11  | Explore     | Reusable output follows proven lineage/filter semantics; it is not an M1 prerequisite.                 |
| RW-12  | Avoid       | No silent mean-of-means, synthetic observations, inferred deduplication, or generic expression engine. |

## What local review changed

The source confirms UTC boundaries, exact contributors, own/peer scope, positional IDs, and common trace nonce invalidation.
The header target list retains only the first chart-role source. New facet targets need explicit routing.
`timePointFilters` preserves unrelated owned filters, so base-after-rolling must remove the old ID filter.
The current scalar registry is row-local. It does not provide an ordered window operation.

The plan omits Pro's separate method-version field. One deployed implementation does not need another compatibility mechanism.
It also avoids making a global aggregation rewrite a prerequisite. Calendar base/rolling parity remains mandatory.
`restoreFromStructure` serves current rows, undo, and host echo. Blanket ID clearing there would destroy valid selections.
The plan scopes clearing to an explicit import with unbound rows and reuses existing refresh remapping.
The current `ChartDataPreview` is a capped source-row preview, not a rolling-data export owner.
Keep it intact; put small output/evidence downloads in the new trace and use existing image export.
The plan corrects browser discovery to `.e2e.ts` plus an explicit project. Capacity limits remain measurement proposals.

Existing calendar/chart tests pass 13 tests. Docs checks and independent fixture arithmetic are recorded in the [run record](run.md).
The scratch checks prove arithmetic and membership expectations, not the unbuilt feature or its performance.
No mounted rolling flow, browser acceptance, persistence, or export behavior is claimed.

## Sources and open questions

Primary-source spot checks confirm the relevant method differences:
[Observable Plot](https://observablehq.com/plot/transforms/window) counts elements and makes anchor/strictness explicit;
[pandas rolling](https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.rolling.html) separates positional/offset support defaults;
[slider periods](https://slider.r-lib.org/reference/slide_period.html) defines calendar groups;
[pandas precision notes](https://pandas.pydata.org/docs/user_guide/window.html) warn about rolling accumulation error.
The choice of UTC half-open calendar windows is a local design decision, not a claim that those tools share that default.

Implementation must prove the fresh-import boundary without changing same-data undo, and measure the proposed workload.
Coverage metadata and duration-weighted physical-signal means remain separate capabilities.
