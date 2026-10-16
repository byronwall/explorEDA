# Goals scored and group points reward different things

**How do team-level scoring, defending, and points compare over the same three matches?** Each row is one team in the completed group stage.

```eda
eda query=teams
team:cat=teams.team label="Team"
group_field:cat=teams.group label="Group"
matches:num=teams.matches label="Matches"
goals_for:num=teams.goals_for label="Goals scored"
goals_against:num=teams.goals_against label="Goals conceded"
points:num=teams.points label="Points"
goal_difference:num=teams.goal_difference label="Goal difference"
```

## 1. Scoring and conceding are separate axes

Each point is one team after its completed group matches. Teams are not independent because opponents contribute to one another’s goals-against totals.

```eda
scatter @nb-football-points-and-goals-chart-1 x=goals_for y=goals_against color=group_field title="Scoring and conceding are separate axes" x.title="Goals scored" y.title="Goals conceded"
```

## 2. Goal difference against points

Points follow win/draw/loss rules rather than a direct conversion of goal difference. Equal points can conceal different scoring profiles.

```eda
scatter @nb-football-points-and-goals-chart-2 x=goal_difference y=points color=group_field title="Goal difference against points" x.title="Goal difference" y.title="Points"
```

**Finding.** The largest team group-stage goal total was 9 goals.

## 3. The distribution of group-stage points

This counts teams, not matches. The schedule creates a discrete points scale and limits the sample’s possible values.

```eda
hist @nb-football-points-and-goals-chart-3 points bins=10 title="The distribution of group-stage points" x.title="Points" y.title="Rows"
```

## 4. Scoring totals within each group

Each group’s teams share opponents within their schedule. These distributions are descriptive and not measures of an independently randomized group effect.

```eda
boxplot @nb-football-points-and-goals-chart-4 goals_for color=group_field title="Scoring totals within each group" y.title="Goals scored"
```

**Finding.** Teams earning at least seven group points represented 15.62% of the selected teams.

## 5. The rows behind the charts

Sort a column or select rows to check any value above. Selections in a notebook stay with their own chart.

```eda
table @nb-football-points-and-goals-records team,group_field,matches,goals_for,goals_against,goal_difference,points title="Records behind this comparison"
```

## Takeaway

The team table changes the population from matches to participants. Points and goal difference summarize different rules, so retain goals for and against instead of compressing everything into a single league table.

## Limits

Teams faced different opponents, and the small group-stage schedule is not a strength-adjusted experiment. No advancement ranking is inferred because all tie-break procedures are outside this analysis.
