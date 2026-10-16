# Goals scored and group points reward different things

**Reader question.** How do team-level scoring, defending, and points compare over the same three matches?

**Population.** one team in the completed group stage. The supplied snapshot is fixed. This article describes the unfiltered data; exploratory chart selections do not update the written findings.

```eda
eda query=teams
id:cat=teams.id label="Id"
team:cat=teams.team label="Team"
group_field:cat=teams.group label="Group"
matches:num=teams.matches label="Matches (group matches)"
goals_for:num=teams.goals_for label="Goals for (group-stage goals)"
goals_against:num=teams.goals_against label="Goals against (group-stage goals conceded)"
points:num=teams.points label="Points (group-stage points)"
goal_difference:num=teams.goal_difference label="Goal difference (group-stage goals for minus against)"
```

## 1. Scoring and conceding are separate axes

Each point is one team after its completed group matches. Teams are not independent because opponents contribute to one another’s goals-against totals.

```eda
scatter @nb-football-points-and-goals-chart-1 x=goals_for y=goals_against color=group_field title="Scoring and conceding are separate axes" x.title="Goals for (group-stage goals)" y.title="Goals against (group-stage goals conceded)"
```

## 2. Goal difference against points

Points follow win/draw/loss rules rather than a direct conversion of goal difference. Equal points can conceal different scoring profiles.

```eda
scatter @nb-football-points-and-goals-chart-2 x=goal_difference y=points color=group_field title="Goal difference against points" x.title="Goal difference (group-stage goals for minus against)" y.title="Points (group-stage points)"
```

**Computed finding.** The largest team group-stage goal total was 9 goals. This calculation uses 32 eligible rows after the recorded filter and field-completeness rule.

## 3. The distribution of group-stage points

This counts teams, not matches. The schedule creates a discrete points scale and limits the sample’s possible values.

```eda
hist @nb-football-points-and-goals-chart-3 points bins=10 title="The distribution of group-stage points" x.title="Points (group-stage points)" y.title="Source rows"
```

## 4. Scoring totals within each group

Each group’s teams share opponents within their schedule. These distributions are descriptive and not measures of an independently randomized group effect.

```eda
boxplot @nb-football-points-and-goals-chart-4 goals_for color=group_field title="Scoring totals within each group" y.title="Goals for (group-stage goals)"
```

**Computed finding.** Teams earning at least seven group points represented 15.62% of the selected teams. This calculation uses 32 eligible rows after the recorded filter and field-completeness rule.

## 5. Inspect the records behind the comparison

The table exposes the source values or prepared values actually used above. Select a row to inspect the calculation inputs; clear chart selections before comparing a live chart with the fixed prose. Notebook selections are local to their chart, not linked across the page.

```eda
table @nb-football-points-and-goals-records team,group_field,matches,goals_for,goals_against,goal_difference,points title="Records behind this comparison"
```

## What the comparison supports

The team table changes the population from matches to participants. Points and goal difference summarize different rules, so retain goals for and against instead of compressing everything into a single league table.

## Limits

Teams faced different opponents, and the small group-stage schedule is not a strength-adjusted experiment. No advancement ranking is inferred because all tie-break procedures are outside this analysis.

## Source and preparation

OpenFootball community, football.db; Public-domain dedication (OpenFootball publisher statement). Historical source version: Git blob 6069ee605e0556ffc8cc7d60983e7a369e755303

Data credit and license: [football provenance](../../datasets.json). The accompanying [field dictionary](fields.json) gives units and missingness for every field. [Preparation source](https://github.com/byronwall/explorEDA/blob/main/docs/research/daily-viz-corpus-2026-10-15/handoff/scripts/prepare.py) records the transformation; the catalogue entry records filters, denominators, source-row IDs, and CSV hashes.

**Reading units.** matches: group matches; goals_for: group-stage goals; goals_against: group-stage goals conceded; points: group-stage points; goal_difference: group-stage goals for minus against.
