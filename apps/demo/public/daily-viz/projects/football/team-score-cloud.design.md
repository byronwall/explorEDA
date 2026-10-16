# Scoring and conceding form different group-stage profiles — design and analytical contract

**Question.** How do team-level scoring, defending, and points compare over the same three matches?

**Encoding.** One team is one point positioned by goals for and against, with group membership encoded by color.
**Ordering.** No line connects teams; listing order has no measured meaning.
**Baseline.** Both goal counts use zero baselines.
**Scale.** Shared linear goal-count scales. Equal scores can overlap and remain separate source records.

## Fixed-snapshot findings

The largest team group-stage goal total was 9 goals. Eligible rows: 32; full expression, denominator, and contributing IDs are in the [evidence](../../evidence/findings/cp-football-team-score-cloud.json).

Teams earning at least seven group points represented 15.62% of the selected teams. Eligible rows: 32; full expression, denominator, and contributing IDs are in the [evidence](../../evidence/findings/cp-football-team-score-cloud.json).

## What this design gives up

Opponent strength, match sequence, and advancement tie-break rules are not encoded. Points are not independent because teams share matches.

Teams faced different opponents, and the small group-stage schedule is not a strength-adjusted experiment. No advancement ranking is inferred because all tie-break procedures are outside this analysis.

## Interactions and tracing

In viewing mode, selecting a repeated unit is intended to filter that repeat across a workspace. Alt-click traces contributing marks. These behaviors come from the inspected baseline contract; this artifact has not been browser-tested. Static findings above describe the unfiltered snapshot.

## Credit

OpenFootball World Cup 2018 group-stage final scores; public-domain dedication.
Full provenance and transformations: [dataset record](../../datasets.json), [fields](../../evidence/fields/football.json).
