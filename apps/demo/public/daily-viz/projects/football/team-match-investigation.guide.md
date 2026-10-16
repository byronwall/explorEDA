# Follow a team’s group profile back to its matches

Which individual match appearances produced a team’s group-stage scoring and points?

## Investigation sequence

1. Select a team: its three appearances should remain, with each row linked to the team summary and the original match.
2. Then select Win; this narrows appearances, while the repeated full-group points lookup remains the team’s fixed whole-group total.
3. Do not sum the repeated group_points field across appearances. Clear selections to recover 96 appearances from 48 matches.

## Fixed-snapshot findings

The largest team group-stage goal total was 9 goals.
Teams earning at least seven group points represented 15.62% of the selected teams.

## Limits

Teams faced different opponents, and the small group-stage schedule is not a strength-adjusted experiment. No advancement ranking is inferred because all tie-break procedures are outside this analysis.

Eight panels contain an instruction note, six analytical/selector/metric views, and a source table. Runtime cross-filtering and trace behavior are pending local verification. The query uses one base population; related lookup totals are not additive repeated measures.

## Source credit

OpenFootball World Cup 2018 group-stage final scores; public-domain dedication.
[Full provenance](../../datasets.json); [field dictionary](fields.json).
