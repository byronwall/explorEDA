# R013 — Concurrency summaries with explicit interval semantics

- ID: R013
- Category: Domain analysis
- Priority: 94
- Kind: follow-up
- Status: planned; Methods research complete, implementation unapproved
- Confidence: medium
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

October 30 Methods result: build a finite-window concurrency strip with half-open occupancy and exact contributor queries.
The [local plan](../../timeline-concurrency/implementation-plan.md) defines three increments, each with docs and examples.
Read the [research summary](../../../research/timeline-concurrency-methods-2026-10-30/README.md) and
[eight original artifacts](../../timeline-concurrency/assets/pro-results/timeline-concurrency-methods-2026-10-30/README.md).
Current DIRECTION supersedes this historical brief's outside-demand gate.
The retired domain-analysis paths below are historical references, not prerequisites.

A timeline can show bookings without making it easy to answer when a resource is double-booked or how long its occupancy exceeds a threshold. `planTimeline` already prepares intervals and stable lanes. `overlapsWindow` deliberately keeps intervals that merely touch a selected window, and open ends remain eligible. That record-selection rule is useful, but it does not decide whether two adjacent bookings occupy a resource simultaneously. The domain-analysis shape names a concurrency strip as later work.

Compare a sweep-line concurrency strip with highlighting overlapping intervals directly in each lane. A third alternative is a prepared interval-summary table visualized using existing charts. The strip supports duration questions; highlighting makes individual conflicts easier to find. Define whether occupancy uses half-open intervals, how zero-duration events behave, and what cutoff bounds open intervals. Preserve the current inclusive window filter unless a separate decision changes it. Capacity planning, recurring reservations, and editing schedules should remain outside this analytical proof.

The first experiment would hand-check adjacent bookings, a three-way overlap, a zero-duration event, and one open-ended booking with a declared horizon. Calculate the count on each boundary interval and total duration above one occupant. Acceptance requires exact counts and durations, source contributors for every segment, and an explanation users can distinguish from window-overlap selection. Reject the candidate if the real task depends on resource capacities, recurrence, or scheduling operations, or if a simple prepared table answers it with little effort. No new geometry should precede the interval calculation.

A pure concurrency summary and one small rendering layer would have moderate cost and could reuse the current lane and time-domain preparation. Persisted settings should be limited to a clear cutoff and display choice if needed. This is a precise follow-up to shipped Timeline, whose existing tests already establish boundary behavior. Confidence is medium because the mathematical experiment is small but the expected user workflow is not yet observed. Its place in the backlog is justified by a distinct interval question rather than adding another chart solely for catalogue symmetry.

## References

- Repository: `packages/explorEDA/src/components/charts/Timeline/timelinePlan.ts` — `planTimeline`, `overlapsWindow`, `TimelineInterval`. The plan has source intervals; overlap selection intentionally includes touching endpoints and open ends.
- Repository: `packages/explorEDA/src/components/charts/Timeline/timelinePlan.test.ts` — `keeps intervals that share time with the window, touching included`, `treats an open end as not yet ended`. Inclusive selection behavior is tested.
- Repository: `docs/intent/domain-analysis-views/shape-brief.md` — `Timeline concurrency strip and overlap highlighting`. The shape lists concurrency as later scope.
- Related intent: `docs/intent/domain-analysis-views/intent-brief.md`.
- Related intent: `docs/intent/domain-analysis-views/shape-brief.md`.
