# One cell is one match, not one goal — design and analytical contract

**Question.** How does the draw rate affect the number of group-stage points available to teams?

**Encoding.** A waffle cell represents one group match and its color distinguishes a draw from a decisive score.
**Ordering.** Groups alphabetically; category order remains consistent across repeats.
**Baseline.** Counts start with no cells; the graphic is not normalized to a synthetic hundred-cell population.
**Scale.** Equal-size cells preserve equal match weights across groups.

## Fixed-snapshot findings

Draws represent 18.75% of the supplied group-stage matches. Eligible rows: 48; full expression, denominator, and contributing IDs are in the [evidence](../../evidence/findings/cp-football-group-match-waffles.json).

The supplied group-stage matches contain 122 total goals. Eligible rows: 48; full expression, denominator, and contributing IDs are in the [evidence](../../evidence/findings/cp-football-group-match-waffles.json).

## What this design gives up

Goal totals and the closeness of decisive matches are lost. The cells encode match counts rather than goals or team appearances.

This is arithmetic under the declared three-points-for-a-win and one-for-a-draw rule, not a measure of match quality. It describes group-stage final scores only and says nothing about later knockout results.

## Interactions and tracing

In viewing mode, selecting a repeated unit is intended to filter that repeat across a workspace. Alt-click traces contributing marks. These behaviors come from the inspected baseline contract; this artifact has not been browser-tested. Static findings above describe the unfiltered snapshot.

## Credit

OpenFootball World Cup 2018 group-stage final scores; public-domain dedication.
Full provenance and transformations: [dataset record](../../datasets.json), [fields](../../evidence/fields/football.json).
