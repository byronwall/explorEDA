# Proof plan: retention observation after the delivered chart

Research date: **2026-10-20, America/Indianapolis** (2026-10-21 UTC). Repository: [byronwall/explorEDA](https://github.com/byronwall/explorEDA), baseline `9b16d78e3ed0742ed4d5858c1939fec9e758b510`.

**Recommendation:** retain the delivered snapshot contract while testing the smallest consequential interpretation question. RO01 defers a behavior change; RO02 places local selection/export/undo/reopen trust before this narrow proof. RO03's lesson/example, RO04's upstream table, RO05's explicit endpoint, and RO06's partial-excluded All policy remain separately conditional.

All application outputs below are **source predictions**, not executed product results. Independent arithmetic was checked without importing or executing repository code. The authenticated selected snapshot is not a runnable checkout. Human-authored coverage cards below are synthetic proof premises; they do not describe an observed outage or production dataset.

## Source anchors

- [Retention planner, all behavior](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/Retention/retentionPlan.ts): `periodStart` lines 73–81, `periodEnd` 83–88, `planRetention` 119–256; horizon 127–132; membership 140–170; flags 178–191; cohort denominator/entry rows 199–200; first qualifying activity per entity/period 201–216; summary 226–235.
- [Renderer](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/Retention/Retention.tsx): `useGetLiveIds(settings, facetIds)` and `useGetAllIds(settings)` 65–66; planner inputs 94–103; empty-cohort branch 201–209; entity-value selection 211–225; future omission and partial hatch 245–273; All rendering 493–529.
- [Trace](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/Retention/RetentionTraceBody.tsx): `RetentionTraceBody` explains cohort size, activity, period calendar rule, partial data-end date, one counted event per active entity, and selection of entities by value.
- [Row-scope hooks](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/useGetLiveData.tsx): `useGetLiveIds` intersects nonempty `facetIds`; `useGetAllIds` applies chart `localFilters` to all data IDs and has no peer/facet parameter.
- [Parsing](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/valueParsing.ts): `timeOfDay` 175–197 applies the given offset; `parseDateText` 226–271 treats absent offsets as UTC; `timestampOf` 292–307 accepts finite numeric timestamps and parsed strings.
- [Existing planner tests](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/Retention/retentionPlan.test.ts) and [renderer tests](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/Retention/Retention.test.tsx) are evidence of asserted intentions, not passing tests in this research session.

The read-only source trace additionally follows [`DataLayerProvider.getLiveItems`](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/providers/DataLayerProvider.tsx) and [`CrossfilterWrapper.getAllData`](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/hooks/CrossfilterWrapper.ts). In default linked mode, a chart's own Crossfilter dimension filter is omitted from its own grouped count; peers/workspace filters affect live IDs. The chart's `localFilters` are applied to its live population and to all IDs. Facets narrow live IDs but not all IDs. The following fixture assumes that default linked mode, no workspace filter, and stable region per entity.

## A. Core eight-row fixture

Settings: `entityField=user`, `timeField=at`, event field `event`, `entryEvent=signup`, `activityEvents=[session]`, `period=week`, `periods=4`; no local, peer, or facet restrictions. Source row IDs below are labels for the proof, not durable record keys.

| Row | Entity / event / region | Timestamp UTC |
| --- | --- | --- |
| 0 | A / signup / West | 2025-01-06T09:00:00Z |
| 1 | A / session / West | 2025-01-13T09:00:00Z |
| 2 | A / session / West | 2025-01-14T09:00:00Z |
| 3 | B / signup / West | 2025-01-08T09:00:00Z |
| 4 | B / session / West | 2025-01-08T10:00:00Z |
| 5 | C / signup / East | 2025-01-13T08:00:00Z |
| 6 | C / session / East | 2025-01-20T09:00:00Z |
| 7 | A / session / West | 2025-01-20T10:00:00Z |

`ids=allIds=[0,1,2,3,4,5,6,7]`; event maximum H is 2025-01-20T10:00:00Z. Its UTC week begins January 20. The partial predicate compares period end to **January 21 at 00:00 UTC**, the day after H's UTC date, not to H itself.

- Cohort 2025-01-06: A and B, denominator 2, entry rows `[0,3]`.
- Cohort 2025-01-13: C, denominator 1, entry row `[5]`.
- No exclusions; three entered entities.
- A's two sessions in the week of January 13 count as one active entity; row 1 is its first counted event, row 2 is not an additional contributor.

All interval labels below use **[start, end) in UTC**: the start is included and the end belongs to the next period.

Notation: `O` = source `observed=true, partial=false`; `P` = source `observed=true, partial=true`; `F` = source `observed=false, partial=false`, displayed blank. Neither O nor P certifies collection coverage. A source future cell internally has active 0/rate 0 but its displayed absence must not be reported as a measured zero.

| Cohort | Period | Active / denominator; source flag |
| --- | --- | --- |
| Jan 6 | 0 (Jan 6–13) | B: 1/2 = 50%; O; counted row `[4]` |
| Jan 6 | 1 (Jan 13–20) | A: 1/2 = 50%; O; counted row `[1]` |
| Jan 6 | 2 (Jan 20–27) | A: 1/2 = 50%; P; counted row `[7]` |
| Jan 6 | 3 (Jan 27–Feb 3) | F; display blank; counted rows `[]` |
| Jan 13 | 0 (Jan 13–20) | 0/1 = 0%; O; counted rows `[]` |
| Jan 13 | 1 (Jan 20–27) | C: 1/1 = 100%; P; counted row `[6]` |
| Jan 13 | 2 (Jan 27–Feb 3) | F; display blank; counted rows `[]` |
| Jan 13 | 3 (Feb 3–10) | F; display blank; counted rows `[]` |

All is pooled by elapsed period across reached cohorts, not a mean of cohort percentages:

| Elapsed period | Working | Source-predicted display |
| --- | --- | --- |
| 0 | (1+0)/(2+1) | Exact 1/3; chart text 33% |
| 1 | (1+1)/(2+1) | Exact 2/3; chart text 67%; includes C's partial week |
| 2 | 1/2 | 50%; includes A/B's partial week |
| 3 | No reached cohort; summary `{active:0,size:0,rate:0}` | Blank |

Use exact fractions as acceptance anchors. The source `retentionPercent` function rounds chart and All labels to whole percentages: 1/3 appears as 33% and 2/3 as 67%. The cohort trace separately permits one decimal place. These are source-predicted UI values, not a browser result. Summary cells have no partial field and the All renderer supplies no hatch or per-summary trace. This is a source-level interpretation concern, not an observed recipient error or executed defect.

### Distinguish five row/entity sets

For Jan 6 cohort, elapsed week 1:

1. Cohort members are A and B: denominator 2.
2. Entry rows are 0 and 3.
3. Active entity values are `[A]`: numerator 1.
4. First counted source event is row 1. Row 2 is another qualifying event from the same active entity, omitted from `cell.rows` to avoid counting A twice.
5. Selecting the cell stores entity value A. With no other restrictions, linked event views show rows `[0,1,2,7]`, not merely row 1 and not denominator members A+B. Under peer/workspace restrictions the linked result is still intersected with those filters; it does not override them.

## B. One unrelated late event

Append row 8: D / heartbeat / East / `2025-01-27T00:01:00Z`. D never signed up and heartbeat is not session activity. Keep all settings unchanged.

The horizon moves to January 27; D is one entity without the entry event. A/B/C cohort members, entry rows, and activity numerators stay unchanged. Flag sequences now are Jan 6 `[O,O,O,P]` and Jan 13 `[O,O,P,F]`.

| Cohort | Four elapsed-period results | Consequence |
| --- | --- | --- |
| Jan 6, size 2 | 1/2 O; 1/2 O; 1/2 O; 0/2 P | Prior partial week loses hatch; next week becomes displayed zero |
| Jan 13, size 1 | 0/1 O; 1/1 O; 0/1 P; F | Its formerly future week 2 enters the denominator |
| All | 1/3; 2/3; 1/3; 0/2 | Week 2 changes from 50% to 33.3% without another target activity event |

This is consistent with the existing common event-maximum horizon. It is not evidence that the current application is broken. Whether one late row is appropriate evidence for every entity's exposure is a separate authored-observation question.

## C. Identical recorded events, incompatible observation histories

Use the eight-row core unchanged. Provide two different external evidence cards; these cards are human-authored fixture facts, not data the current Retention planner reads.

| Evidence card | Authored observation facts | Consequence that event rows cannot establish |
| --- | --- | --- |
| Quiet complete tail | All signup/session activity for the declared population was captured continuously through an exclusive end of 2025-02-03T00:00Z; no further target events occurred after Jan 20. | Weeks Jan 20–27 and Jan 27–Feb 3 are complete; later zeros can be defended. |
| Known interruption | Capture is known through exclusive Jan 21T00:00Z, then absent from Jan 21 through Feb 3. No assertion is made about behavior during that interval. | The remainder of the Jan 20 week is unobserved and Jan 27–Feb 3 is unobserved. Do not call their absent records no activity. |

Both cards must also name the population, qualifying event types, coverage start, and responsible source. For this fixture, assume complete entry-search history from Jan 6T00:00Z and fixed A/B/C membership; this does not imply first-ever signup before that history. An actual first-ever-entry task needs sufficient earlier history.

Current source output must be identical for both cards because its inputs are identical. Both produce the core matrix and core All values. This is the decisive non-identifiability proof.

For the quiet card, a **hypothetical** common, authoritative continuous-coverage input with end-exclusive Feb 3 would justify the same count matrix as variant B but with all reached Jan 20 and Jan 27 weeks complete: All `[1/3,2/3,1/3,0/2]`. Jan 13 cohort week 3 begins exactly at the exclusive end and remains unobserved. These are proposed metadata-aware expectations, not current behavior.

For the interruption card, absence after Jan 21 cannot supply complete-week retention. A/B's Jan 20-week recorded fraction is 1/2; the full-week fraction could be 1/2 or 1 if B had an unrecorded session. C is already recorded active, so its 1/1 numerator cannot increase, although coverage is still interrupted. In the Jan 27 week, A/B's true full-week numerator could be 0, 1, or 2 and C's could be 0 or 1. This does not license imputation, replacement with survival estimates, or a zero reading.

With no evidence card, coverage remains unknown. A declared extraction timestamp or maximum event timestamp is not equivalent to the quiet card's claim. A single end cannot express an internal interruption followed by resumed collection: in a separate resumption variant, append the late heartbeat and supply an authored Jan 21–27 gap followed by resumed collection to demonstrate that limitation. Likewise, if A is observed through Feb 3 but B only through Jan 21, one global end cannot retain A's later information while correctly describing B's shorter coverage. Choosing the maximum falsely extends B; choosing the minimum discards available A follow-up. Excluding B would also change the fixed cohort denominator and must be an explicit analytical choice. No universal interval schema or per-entity engine is required to make this impossibility argument.

## D. Peer event filter removes entry rows

Reset to the eight core rows. In default linked mode, select `event=session` in a peer chart. Live IDs become `[1,2,4,6,7]`; all IDs and H remain unchanged.

- With `entryEvent=signup`, each surviving entity A/B/C lacks an entry event. The planner returns no cohorts, entered entities 0, and an excluded count of 3 without entry.
- The renderer's early empty-cohort branch displays “No entity has an entry event with a readable time.” The exclusion count is a planner fact; do not assert that the count is visible in the normal status line in this empty state.
- This is coherent filtered-entry semantics. Do not silently substitute original lifetime signup cohorts.
- Keeping the rows and setting `activityEvents=[session]` is the appropriate existing control for counting only return sessions while retaining signup membership.

Unset entry only as an explicit comparison. It changes the task to first **surviving** event: B enters Jan 6 from row 4, A enters Jan 13 from row 1, C enters Jan 20 from row 6. With activity still session and H Jan 20, their numerator sequences are B `[1,0,0,0]`, A `[1,1,0,0]`, C `[1,0,0,0]`; reached flags depend on the new cohort dates. All becomes `[3/3,1/2,0/1,blank]`. This is not a rescue of signup-based retention.

## E. Chart-local population versus facet and peer scope

Use variant B, including the late East heartbeat. Region is stable per entity so the proof does not confuse a changing event attribute with a stable entity segment.

| Configuration | Live population and horizon | Expected West cohort and All |
| --- | --- | --- |
| Retention chart `localFilters: region=West` | IDs and all IDs `[0,1,2,3,4,7]`; H Jan 20T10Z | Only Jan 6 A/B: `[1/2 O,1/2 O,1/2 P,F]`; All same fractions and blank |
| West facet, no local filter | Live IDs `[0,1,2,3,4,7]`; all IDs include East; H Jan 27T00:01Z | Only Jan 6 A/B: `[1/2 O,1/2 O,1/2 O,0/2 P]`; All same fractions |
| Peer filter `region=West`, no local filter | Same West live population, global all IDs; H Jan 27 | Same source prediction as West facet |

This proves that equal displayed entity populations need not imply equal observation horizons. Existing controls permit the author to choose a chart-local population, but they do not establish whether that population was continuously observed.

Nonempty facet IDs are required for this clean probe. `useGetLiveIds` treats an absent or empty facet list as no extra ID restriction; an empty-panel behavior claim needs its own integration context and is outside this minimal proof.

## F. UTC calendar boundary and day rounding

Separate two-row microfixture, one entity U, no scope filters:

| Row | Event timestamp supplied | UTC instant |
| --- | --- | --- |
| 0, U signup | `2024-03-31T19:55:00-04:00` | Sunday Mar 31 at 23:55Z |
| 1, U session | `2024-03-31T20:05:00-04:00` | Monday Apr 1 at 00:05Z |

These events are ten minutes apart and occur on the same local calendar date in the supplied offset. Both `entryEvent=signup` and `activityEvents=[session]` remain set, with three elapsed periods.

| Mode | Cohort start; period 1 start | Expected values and flags |
| --- | --- | --- |
| Day | Mar 31; Apr 1 | `[0/1 O,1/1 O,F]` |
| Week | Monday Mar 25; Monday Apr 1 | `[0/1 O,1/1 P,F]` |
| Month | Mar 1; Apr 1 | `[0/1 O,1/1 P,F]` |

The All row matches the single cohort. Elapsed period 1 is the next UTC calendar bucket, not a full elapsed day/week/month since entry. No retention-mode switch is required or proposed.

The exact source predicate is:

```text
observed = period_start(cell) <= period_start(max_readable_allIds_time)
partial = observed AND period_end(cell) > start_of_UTC_day(H) + 1 day
```

Consequences to test explicitly:

- Daily partial is always false for any observed daily cell, including one whose last event is 00:01 that same day.
- Set the unrelated event's timestamp in variant B to Sunday `2025-01-26T00:01Z`: the week Jan 20–27 is no longer partial even though almost all of Sunday remains after the event. Jan 27 remains future. All fractions return to core `[1/3,2/3,1/2,blank]` but the prior two partial flags are false.
- A January monthly cell with H `2025-01-31T00:01Z` is nonpartial because its end equals Feb 1, the rounded day end. This does not establish collection for the remaining 23 hours 59 minutes.

This is an exact source consequence and a source-confirmed tension with the planner comment that the ending period is marked partial. The broad documentation/trace explanation is insufficient to infer the day-rounded predicate. It is not an executed runtime defect. A decision to use instant-level cutoff versus end-of-date semantics must be named before a fix is authorized.

## G. RO06: separately evaluate excluding partial cohorts from All

Do not combine this with observation metadata. It is a distinct summary policy.

| Fixture | Current reached-cohort All | Hypothetical only-nonpartial All |
| --- | --- | --- |
| Core | `[1/3,2/3,1/2,blank]` | `[1/3,1/2,blank,blank]` |
| Late row B | `[1/3,2/3,1/3,0/2]` | `[1/3,2/3,1/2,blank]` |

The alternative excludes numerator **and** denominator of a partial cohort. Keeping its active count while dropping only its cohort size is invalid. It changes the population compared at each elapsed period; even mature-looking bins still depend on the source's day-rounded event horizon and do not acquire outage coverage. Prove a user task that needs this summary estimand before changing it. The existing All policy can also be explained without alteration.

## H. Proof stages and falsification

### Completed in research

- Read relevant authenticated source, tests, hooks, trace, renderer, and parsing utilities.
- Independently checked 16 mathematical assertions: base/late/maturity-only pooled fractions, two offset conversions, ten-minute duration, Sunday/Monday boundary, day/week/month partial examples, last-day rounding, duplicate entity count, and selected source-row enumeration. These are mathematical checks of this report, not a product test count.
- No application, TypeScript tests, browser, persistence, history, performance, or recipient-comprehension checks were run.


### Arithmetic inventory

The independent audit checked these sixteen anchors. Fractions are exact; display rounding is checked separately in a later product run.

| Anchor | Expected result | Basis |
| --- | --- | --- |
| A01 | Core All `(1/3, 2/3, 1/2, blank)` | Reached cohort membership |
| A02 | Late-event All `(1/3, 2/3, 1/3, 0/2)` | Added horizon, no target activity |
| A03 | Core nonpartial-only All `(1/3, 1/2, blank, blank)` | Alternative summary policy |
| A04 | Late nonpartial-only All `(1/3, 2/3, 1/2, blank)` | Alternative summary policy |
| A05 | Entry instant `2024-03-31T23:55Z` | Supplied −04:00 offset |
| A06 | Return instant `2024-04-01T00:05Z` | Supplied −04:00 offset |
| A07 | Elapsed time 10 minutes | Instant subtraction |
| A08 | Entry UTC weekday Sunday | UTC calendar |
| A09 | Return UTC weekday Monday | UTC calendar |
| A10 | Latest daily partial false | Apr 2 is not greater than Apr 2 |
| A11 | Latest weekly partial true | Apr 8 is greater than Apr 2 |
| A12 | Latest monthly partial true | May 1 is greater than Apr 2 |
| A13 | Sunday Jan 26 00:01 event clears weekly partial | Jan 27 equals rounded day end |
| A14 | Jan 31 00:01 event clears monthly partial | Feb 1 equals rounded day end |
| A15 | A's two week-1 sessions count once | Distinct entity set |
| A16 | Selected A source rows `[0,1,2,7]` | Enumerated fixture rows for entity A |

### Proposed source/runtime checks, UNRUN

Codex independently reconciles this source prediction to its actual baseline. Add or adapt focused planner assertions for A–G only after that review. Preserve existing tests and use the repository's normal runtime. Confirm exact rows, denominator membership, contributor row 1 versus duplicate row 2, observed/partial flags, summary numerator/denominator, no-entry branch, and local/facet/peer scope. Do not mark a browser result passed from a Python fraction.

Known commands, for a later authorized runnable checkout, **not run here**:

```bash
# Focused retention tests and type check after reconciling the fixture.
pnpm --filter exploreda exec vitest run src/components/charts/Retention/retentionPlan.test.ts src/components/charts/Retention/Retention.test.tsx
pnpm --filter exploreda check-types

# Required repository gates if Codex later prepares a review PR.
pnpm check
pnpm check:pr
```

### Proposed browser/task checks, UNRUN

At 1280, 783, and 390 pixels, verify the base chart, late-row change, partial hatches, blank cells, All values, readable trace, keyboard selection, and scoped linked table. For Jan 6 week 1 verify A selection yields four events with no other restrictions, clear it, undo/redo/reopen within the existing local-trust task. Do not reopen a separate export survey.

Ask a named user performing a real retention task, using current settings/trace, to identify: membership/entry rule; the numerator and denominator of All week 1; what a zero, a future blank, and a partial hatch mean; what can be concluded from the two coverage cards; and why a peer event filter removed the cohorts. A short neutral lesson may be tested against the same task and events. Do not tell users that a proposed input is desirable.

### Minimal direction-changing evidence

- If current controls and trace support correct interpretation, stop and retain the contract.
- If a consequential observed interpretation failure remains and a short explanation resolves it, compare RO03's one docs/example milestone; no metadata input follows automatically. One strong task failure can earn that comparison; no fixed demand count is imposed.
- Consider RO05's one explicit end input after a consequential actual task supplies authoritative coverage information and defines a common applicable population. Compare RO01/RO03 current controls and explanation, RO04 an upstream authored table, and the small input according to that task. An upstream table is a candidate, not a mandatory hurdle; irrelevant alternatives need not be exhausted serially. Require precise exclusive/inclusive semantics, handling of events beyond the endpoint, scope under local filters/facets/peers, and persistence before implementation.
- An internal gap, heterogeneous per-entity coverage, or missing proof of collection defeats the sufficiency of a single end. Keep these as upstream research constraints, not reasons to build a general coverage engine.
- A runtime contradiction of the expected matrices requires a narrow defect investigation. It does not establish product demand for a new observation model.

## I. Conditional docs and example milestone

If RO03 earns work, pair the proposed **“Read the observation window”** section in `apps/demo/src/docs/pages/retention.mdx` with proposed `apps/demo/src/demos/retentionObservation.ts`, registered through the existing demo/docs example system, in the same milestone. The example path is a proposal; no such module was created or claimed to exist.

The section should explain the delivered contract positively: UTC calendar periods; entry and activity settings; filtered-entry behavior; cohort-size denominator; event-maximum horizon; exact day-rounded partial marking; reached-cohort All pooling; active-entity selection; and the author's responsibility to know collection coverage. Pair the eight core rows and late-event toggle with the two authored coverage explanations. A docs-only example can state a supplied coverage fact in ordinary text without silently implementing a coverage API. Keep implementation caveats in the owning intent/research documents under the repository's copy rules.

If a future UI input separately earns implementation, docs and the runnable example must land with it and include source provenance, saved-settings round trip, explicit boundary convention, and deliberately unchanged entity-selection/trace semantics. The research package authorizes no implementation. **GO** for independent collection, reconciliation and the narrow proof within the existing local-trust priority; **NO-GO** for a product change until its own task and acceptance gate are satisfied. Codex owns independent review, integrity checks, reconciliation, validation, and any open review PR.
