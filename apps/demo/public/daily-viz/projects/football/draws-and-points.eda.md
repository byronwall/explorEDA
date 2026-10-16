# A drawn group match distributes fewer points

**How does the draw rate affect the number of group-stage points available to teams?** Each row is one 2018 World Cup group-stage match.

```eda
eda query=r
group_field:cat=r.group label="Group"
date:date=r.date label="Date"
team1:cat=r.team1 label="First team"
team2:cat=r.team2 label="Second team"
goals1:num=r.goals1 label="Goals, first team"
goals2:num=r.goals2 label="Goals, second team"
total_goals:num=r.total_goals label="Goals in the match"
result:cat=r.result label="Result"
```

## 1. First separate drawn from decisive matches

The result categories are defined directly from equal or unequal final goals. They do not incorporate shootouts or subjective assessments of play.

```eda
row @nb-football-draws-and-points-chart-1 result title="First separate drawn from decisive matches" x.title="Rows"
```

## 2. Result counts inside each group

The count cells reveal differences in group draws under the same schedule length. A missing category should not be confused with a missing match.

```eda
heatmap @nb-football-draws-and-points-chart-2 group_field columnField=result aggregation=count showValues=true title="Result counts inside each group"
```

**Finding.** Draws represent 18.75% of the group-stage matches.

## 3. Draws can still have different goal totals

A draw may be scoreless or high-scoring. This distribution prevents the draw category from being treated as a synonym for a low-event match.

```eda
boxplot @nb-football-draws-and-points-chart-3 total_goals color=result title="Draws can still have different goal totals" y.title="Goals in the match"
```

## 4. The two final goal counts

Draws lie where the two scores are equal. First and second are listing order, not home advantage, and coincident scorelines still represent separate games.

```eda
scatter @nb-football-draws-and-points-chart-4 x=goals1 y=goals2 color=result title="The two final goal counts" x.title="Goals, first team" y.title="Goals, second team"
```

**Finding.** The group-stage matches contain 122 total goals.

## 5. The rows behind the charts

Sort a column or select rows to check any value above. Selections in a notebook stay with their own chart.

```eda
table @nb-football-draws-and-points-records date,group_field,team1,team2,goals1,goals2,result title="Records behind this comparison"
```

## Takeaway

A decisive match supplies three total team points; a draw supplies two. Comparing groups by points without acknowledging that rule can obscure why equal schedules produce different point pools.

## Limits

This is arithmetic under the declared three-points-for-a-win and one-for-a-draw rule, not a measure of match quality. It describes group-stage final scores only and says nothing about later knockout results.
