# A drawn group match distributes fewer points

**Reader question.** How does the draw rate affect the number of group-stage points available to teams?

**Population.** one 2018 World Cup group-stage match. The supplied snapshot is fixed. This article describes the unfiltered data; exploratory chart selections do not update the written findings.

```eda
eda query=r
id:cat=r.id label="Id"
group_field:cat=r.group label="Group"
date:date=r.date label="Calendar date"
team1:cat=r.team1 label="Team1"
team2:cat=r.team2 label="Team2"
goals1:num=r.goals1 label="Goals1 (goals by first listed team)"
goals2:num=r.goals2 label="Goals2 (goals by second listed team)"
total_goals:num=r.total_goals label="Total goals (goals per match)"
margin:num=r.margin label="Margin (absolute final goal difference)"
result:cat=r.result label="Result"
```

## 1. First separate drawn from decisive matches

The result categories are defined directly from equal or unequal final goals. They do not incorporate shootouts or subjective assessments of play.

```eda
row @nb-football-draws-and-points-chart-1 result title="First separate drawn from decisive matches" x.title="Source rows"
```

## 2. Result counts inside each group

The count cells reveal differences in group draws under the same schedule length. A missing category should not be confused with a missing match.

```eda
heatmap @nb-football-draws-and-points-chart-2 group_field columnField=result aggregation=count showValues=true title="Result counts inside each group"
```

**Computed finding.** Draws represent 18.75% of the supplied group-stage matches. This calculation uses 48 eligible rows after the recorded filter and field-completeness rule.

## 3. Draws can still have different goal totals

A draw may be scoreless or high-scoring. This distribution prevents the draw category from being treated as a synonym for a low-event match.

```eda
boxplot @nb-football-draws-and-points-chart-3 total_goals color=result title="Draws can still have different goal totals" y.title="Total goals (goals per match)"
```

## 4. The two final goal counts

Draws lie where the two scores are equal. First and second are listing order, not home advantage, and coincident scorelines still represent separate games.

```eda
scatter @nb-football-draws-and-points-chart-4 x=goals1 y=goals2 color=result title="The two final goal counts" x.title="Goals1 (goals by first listed team)" y.title="Goals2 (goals by second listed team)"
```

**Computed finding.** The supplied group-stage matches contain 122 total goals. This calculation uses 48 eligible rows after the recorded filter and field-completeness rule.

## 5. Inspect the records behind the comparison

The table exposes the source values or prepared values actually used above. Select a row to inspect the calculation inputs; clear chart selections before comparing a live chart with the fixed prose. Notebook selections are local to their chart, not linked across the page.

```eda
table @nb-football-draws-and-points-records date,group_field,team1,team2,goals1,goals2,result title="Records behind this comparison"
```

## What the comparison supports

A decisive match supplies three total team points; a draw supplies two. Comparing groups by points without acknowledging that rule can obscure why equal schedules produce different point pools.

## Limits

This is arithmetic under the declared three-points-for-a-win and one-for-a-draw rule, not a measure of match quality. It describes group-stage final scores only and says nothing about later knockout results.

## Source and preparation

OpenFootball community, football.db; Public-domain dedication (OpenFootball publisher statement). Historical source version: Git blob 6069ee605e0556ffc8cc7d60983e7a369e755303

Data credit and license: [football provenance](../../datasets.json). The accompanying [field dictionary](fields.json) gives units and missingness for every field. [Preparation source](https://github.com/byronwall/explorEDA/blob/main/docs/research/daily-viz-corpus-2026-10-15/handoff/scripts/prepare.py) records the transformation; the catalogue entry records filters, denominators, source-row IDs, and CSV hashes.

**Reading units.** goals1: goals by first listed team; goals2: goals by second listed team.
