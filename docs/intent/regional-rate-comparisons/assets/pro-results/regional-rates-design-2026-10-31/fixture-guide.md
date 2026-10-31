# Regional rate fixtures and exact expectations

These are synthetic fixtures for the proposed regional comparison capability at repository baseline `ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6`. They define desired behavior. They are not a claim that explorEDA already implements these rules.

The companion files are `regional-rate-fixtures.json` and `verify-fixtures.py`. The JSON contains all input records and manually authored expected values. The dependency-free Python checker evaluates those inputs independently with rational arithmetic and compares totals, states, and exact row memberships. It does not import repository code.

## Run sheet

```bash
# Run from the directory containing both companion files.
python3 verify-fixtures.py

# Or pass an explicit fixture path when copying them into another location.
python3 verify-fixtures.py /absolute/path/to/regional-rate-fixtures.json
```

Executed during this Design mission: **46 cases passed, with 2,849 exact scalar, membership, and shape assertions**. Application tests, a built repository, and browser interactions were not executed by this checker. The source packet is a scoped snapshot, not a runnable checkout.

## Canonical comparison

The synthetic collection window is **October 2026**, represented as the half-open UTC interval `[2026-10-01T00:00:00Z, 2026-11-01T00:00:00Z)`. Population is `all-residents`, geometry vintage is `districts-v1`, and the rate is service events per 1,000 residents during that window. It is not a probability that a resident experiences an event.

| Region | Exact expected result |
| --- | --- |
| A | 12 events / 1,200 residents × 1,000 = **10**. Complete collection. |
| B | 8 events / 200 residents × 1,000 = **40**. Complete collection. |
| C | 0 events / 400 residents × 1,000 = **0**. Complete collection explicitly declared. |
| D | 0 observed events / 500 residents. Collection unknown, full numerator and rate **unavailable**. |

The count ranking puts A ahead of B. The rate ranking puts B ahead of A. C is a measured zero. D is not an additional zero.

Event source IDs are `events`; event row IDs are `a01` through `a12` and `b01` through `b08`. Denominator source ID is `exposure`; denominator row IDs are `dA`, `dB`, `dC`, and `dD`. Complete collection declarations for A–C and the unknown declaration for D are separately identified as `coverage-A` through `coverage-D`. The declaration applies to the fixture's exact common scope. Its existence never substitutes for successful loading of the event source.

### Pooled versus mean

| Selected regions | Exact expected result |
| --- | --- |
| A + B | Pooled: `20 / 1400 × 1000 = 100/7`. Mean of region rates: `(10 + 40) / 2 = 25`. |
| A + B + C | Pooled: `20 / 1800 × 1000 = 100/9`. Mean of region rates: `(10 + 40 + 0) / 3 = 50/3`. |
| A + B + C + D | Pooled rate unavailable. Observed count 20 and known denominator sum 2,300 remain inspectable; the complete numerator is unknown. D is not silently discarded. |

These are disjoint regions in one common window. The fixture does not authorize summing population snapshots across time. Population is a stock; person-hours and person-years are additive exposure quantities under a separate, explicit time convention.

### Numerator-only subtype filter

The `repair` events are `a01`–`a03` and `b01`–`b02`. Selecting that subtype produces:

- A: `3 / 1200 × 1000 = 5/2`.
- B: `2 / 200 × 1000 = 10`.
- C: `0 / 400 × 1000 = 0`.
- D: unavailable because its collection remains unknown.

The exposure contributors are unchanged. Pool A+B gives `25/7`; pool A+B+C gives `25/9`. The corresponding means are `25/4` and `25/6`. The filtered-out event rows remain recorded in `numeratorFilterExcluded`.

## Reading the fixture contract

- **`observedNumerator`** is the sum of valid observed contributions. A value of zero says only that no qualifying contribution was present in the loaded data. It is `null` when the source is unavailable.
- **`numerator`** is the complete numerator for the requested scope. It becomes `null` when collection is partial, unknown, or unobserved; when an input source is unavailable; or when a required numerator value is missing, invalid, or negative.
- **`denominator`** is the accepted exact-scope total. A numeric zero remains inspectable but cannot produce a rate. Missing, conflicting, negative, invalid, or mismatched denominator inputs leave this field `null`.
- **`rateExact`** is a reduced rational string for `scale × numerator / denominator`. `null` is an unavailable result, never a numeric zero. Fractions remain exact even when a UI would show a rounded decimal.
- **`coverage`** is the effective observation state. `coverageEvidence` identifies the saved declaration; source unavailability overrides a previously complete declaration in the effective state.
- **`reasons`** contains every blocking reason represented by the fixture, rather than selecting a single code that hides the others. **`notices`** records nonblocking operations such as an explicitly requested collapse.

Event-count numerators must be finite, nonnegative integers within JavaScript's safe-integer range, `0` through `2^53 − 1`. A prepared value of `1.5` is not one and a half events in this first capability. Weighted or fractional amounts need a separately declared measurement meaning. The boundary tests reject `9007199254740992` and accept `9007199254740991`; the accepted fixture uses exposure 1,000 and multiplier 1,000 so the exact rate also equals the accepted count.

The JSON is an independent conformance packet, not the production `AnalysisProject` wire schema. Names can be adapted at the integration boundary, but the values, statuses, and membership distinctions must survive that adaptation.

The normalized packet declares the region universe in `regions` and additionally discovers valid numerator keys. The production adapter must form the full typed union of numerator, denominator, and explicitly requested keys before calling equivalent conformance cases; the small oracle does not implement a general project-stage planner. Its numerator input is already scoped to the declared population/boundary. Unexpected incompatible numerator rows block affected groups; mixed-population or mixed-boundary sources require an explicit upstream filter. Other-window denominator candidates are retained as exclusions before uniqueness is checked.

### Mapping to the proposed TypeScript contract

`proposed-contract.ts` describes the proposed application-facing model. This fixture schema is intentionally a smaller normalized oracle contract; the JSON must not be passed directly to a production evaluator as though it were an accepted serialized `AnalysisProject`.

| Fixture vocabulary | Proposed application mapping |
| --- | --- |
| `denominator`, `denominatorContributors`, and related fields | The exposure total and exposure-role evidence. Preserve the separate arithmetic contribution units and backing rows. |
| `{ sourceId, rowId }` | A source-qualified stable record reference using `sourceId` and the source's `rowKey`; these fixture row IDs stand in for validated stable keys. |
| `collection-unknown` | The public diagnostic `coverage-unknown`. Other collection-state codes should likewise be mapped deliberately to the public coverage vocabulary. |
| Effective `coverage: "unavailable"` | A public source-availability failure and `source-unavailable` issue. Keep the historical coverage assertion separately; do not add `unavailable` to the collection-status enum merely to match the oracle. |
| `coverageEvidence` | A resolved author/source coverage declaration for the exact comparison grain; its identity is not proof that the source currently loaded. |
| `rateExact` | An exact test oracle for the public numeric result, with display rounding tested separately. Rational strings are not a requirement for production storage. |
| `denominatorPolicy` | An explicit input-preparation/duplicate policy. Policies for later milestones are conformance scenarios, not an assertion that M1 accepts every fixture mode. |

Integration tests should convert each fixture through a small test adapter and compare the public result to these exact values and evidence sets. This keeps fixture format choices from becoming accidental public API requirements.

### Memberships and duplicated values

References always contain both `sourceId` and `rowId`. An event row `events:same` and an exposure row `exposure:same` are different records.

- `numeratorCandidates` includes same-region source records considered for the comparison. `numeratorScopeExcluded` identifies records outside the exact window or incompatible numerator scope. `numeratorFilterExcluded` identifies records excluded by the selected subtype. `numeratorContributors` contains only accepted selected numeric contributions.
- `numeratorRejectedRows` records known-region rows with invalid event times or unacceptable prepared count values. An event with an invalid timestamp is not silently treated as outside the requested window: its possible membership is unknown, so its known region's complete numerator is unavailable.
- `denominatorCandidates` retains same-region rows inspected for alignment, including a row rejected for time or boundary mismatch. `denominatorContributors` identifies the records that actually supply arithmetic values.
- `denominatorScopeExcluded` identifies other-window or otherwise nonmatching candidates. When an exact requested-grain row exists, an exposure for September and another for November are not duplicate October exposures. They remain traced exclusions while October's row contributes.
- Under strict uniqueness, even identical denominator duplicates block the rate. An explicit later-stage collapse is a different policy. It picks the smallest stable row ID as the deterministic representative and retains every equal backing row in `denominatorRepresentedRows`.
- `denominatorContributionUnits` makes the arithmetic explicit: one value for the declared regional grain, one representative record, and all represented evidence. Three equal copies of population 200 contribute **200**, not 600. Conflicting values have no accepted denominator contribution unit.
- An event source with exposure repeated on each event row requires explicit extraction. Equality can establish that the present copies agree. It cannot create a denominator or observation evidence for a region with no rows.

### Attribution, unmatched regions, and selected sets

An in-window event with a missing or invalid region cannot be assigned to A, B, or another region with confidence. The strict default therefore blocks every possibly affected requested regional rate with `unknown-attribution`. `orphanNumeratorCandidates` preserves the source record, rejected-key reason, and whether it may affect the requested window. If the event has a valid timestamp that is clearly outside the window, it remains orphan evidence but does not contaminate the current comparison.

A valid, known region key E has a different meaning. It becomes its own group; without an exposure E is unavailable. Its existence does not make A or B unavailable. This fixture intentionally makes the distinction between missing attribution and a known unmatched key testable.

An empty selected set is unavailable. Repeating the same selected key is an explicit invalid request; the oracle does not double-count its numerator or exposure while deduplicating only its provenance. An unresolved selected key produces an unavailable pooled result and an `unresolvedRegions` list, while retaining evidence for the resolved portion. It never raises an unhandled lookup error or silently publishes the resolved subset's rate.

## Case index

| Fixture | Expected distinction |
| --- | --- |
| RR-F01 | Count/rate reversal; valid zero; unknown collection; exact pooled/mean values; no silent omission. |
| RR-F02 | Prepared N/D table gives the same regional and pooled values; one source row has separate numerator and denominator roles. |
| RR-F03 | Repeated exposure on event rows rejected without an extraction policy. |
| RR-F04 | Explicit equal-value extraction: `3/200 × 1000 = 15`, not 5; all three backing rows retained. |
| RR-F05 | Conflicting denominator values 200 and 250 block the rate. |
| RR-F06 | Two identical denominator rows block under default uniqueness. |
| RR-F07 | Explicit collapse: `2/200 × 1000 = 10`; representative independent of source row order. |
| RR-F08 | Loaded-empty event input plus complete collection gives zero. |
| RR-F09 | Loaded-empty event input plus unknown collection gives unknown full numerator. |
| RR-F10 | Missing event source overrides a stale complete-collection declaration. |
| RR-F11 | Zero exposure is visible but invalid as a divisor. |
| RR-F12 | Missing exposure value. |
| RR-F13 | Missing exposure row. |
| RR-F14 | Negative exposure cannot contribute. |
| RR-F15 | Invalid exposure cannot contribute. |
| RR-F16 | Numeric region `1` and string region `"1"` remain separate: rates 10 and 40. |
| RR-F17 | `repair` numerator filter keeps fixed denominator and exact excluded memberships. |
| RR-F18 | Start is included and end excluded in the half-open UTC interval. |
| RR-F19 | Region match with wrong period stays unavailable. |
| RR-F20 | Region match with wrong boundary version stays unavailable. |
| RR-F21 | Region match with wrong population stays unavailable. |
| RR-F22 | Partial collection: observed count 2, complete numerator unknown, exposure 500 visible. |
| RR-F23 | Equal local row IDs in different sources remain distinct references. |
| RR-F24 | Negative prepared numerator blocks the full numerator and rate. |
| RR-F25 | Invalid prepared numerator blocks the full numerator and rate. |
| RR-F26 | Missing prepared numerator is not zero. |
| RR-F27 | Region C remains selected with no event row; its exposure record remains reachable. |
| RR-F28 | Missing exposure input cannot reuse cached healthy denominator rows. |
| RR-F29 | Event intensity `3 events / 1 hour = 3` is allowed. |
| RR-F30 | A declared proportion with numerator 3 and denominator 2 is invalid. |
| RR-F31 | A plausible quotient is not proof that a numerator is a subset of an eligible population. |
| RR-F32 | Decimal exposure 20.5 has exact scaled rate `2000/41`. |
| RR-F33 | Explicitly unobserved collection differs from complete collection with zero events. |
| RR-F34 | Repeated exposure extraction cannot invent an absent-region denominator. |
| RR-F35 | Conflicting repeated exposure remains invalid even when extraction is enabled. |
| RR-F36 | Fractional prepared event count `1.5` blocks the numerator and rate. |
| RR-F37 | Prepared event count `9007199254740992` exceeds the safe-integer limit and blocks the rate. |
| RR-F38 | Count `9007199254740991` is accepted; with D=1,000 and scale=1,000 its exact rate is the same integer. |
| RR-F39 | In-window null, missing, and object-valued region keys block possibly affected A/B rates and retain all orphan records. |
| RR-F40 | Known unmatched key E becomes an unavailable E group while A/B rates stay valid. |
| RR-F41 | Invalid and missing timestamps on A events block A's complete numerator; B remains valid. |
| RR-F42 | September/November exposure rows are traced exclusions when the exact October row exists; no false duplicate/conflict. |
| RR-F43 | Empty pooled selection is unavailable with exact empty memberships. |
| RR-F44 | Duplicate selected region A is rejected without doubling its totals or evidence. |
| RR-F45 | Unresolved selected E makes the A+E pool unavailable and exposes the unresolved key. |
| RR-F46 | An invalid key on a known out-of-window event does not invalidate the requested window. |

## Integration limits and required application tests

This oracle is deliberately small. It evaluates normalized records, canonical UTC dates, one window, and exact disjoint regional pools. Production parsing must use the repository's existing value-parsing helpers. The oracle is not a substitute for tests of duplicate source occurrence identity, binary availability transitions, stage cycles, saved-schema validation, worker races, display ordering, joins through prepared stages, DSL round trips, callbacks, folder reopen, or real pointer/keyboard selection.

The selection fixture proves the **semantic contract** that selection exists independently of event membership. It does not prove a browser control currently behaves that way.

One concrete repository acceptance test remains proposed because this oracle has no upstream stage graph: a lookup expands one original event `events:e1` into two numerator input rows and preserves a second event `events:e2` once. The count input now contains three stage rows for two original events. Under M1's one-event-per-row declaration, reject the expanded branch with a grain diagnostic until an explicit event-identity policy establishes how those rows may be counted. Preserve all three input-row identities and their lineage; never silently count three events or infer that every source reference in a merged lineage union is an event. This test must run against the real stage evaluator, not be simulated by assigning convenient row IDs in this normalized fixture packet.

Future interval methods, population standardization, crosswalks, arbitrary partial-window exposure allocation, and overlapping region pools are outside this fixture packet. The main report and implementation plan state the proposed feature boundary and the acceptance work for those later stages.
