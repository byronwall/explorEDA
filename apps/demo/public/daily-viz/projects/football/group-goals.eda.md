# The group stage was not forty-eight identical scorelines

**Reader question.** How much of the 2018 group-stage scoring distribution sits in close games and high totals?

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

## 1. How many goals did a match contain?

The unit is one match, so each final score contributes once. Team-appearance rows would double the count and require a different denominator.

```eda
hist @nb-football-group-goals-chart-1 total_goals bins=8 title="How many goals did a match contain?" x.title="Total goals (goals per match)" y.title="Source rows"
```

## 2. A high total need not mean a wide margin

Each match has two derived measures from the same score. Coincident points remain separate records and should not be deduplicated.

```eda
scatter @nb-football-group-goals-chart-2 x=total_goals y=margin opacity=0.6 title="A high total need not mean a wide margin" x.title="Total goals (goals per match)" y.title="Margin (absolute final goal difference)"
```

**Computed finding.** The mean group-stage match total was 2.542 goals. This calculation uses 48 eligible rows after the recorded filter and field-completeness rule.

## 3. Match-total distributions by group

Every group has the same intended match schedule, but a small number of games makes broad group rankings fragile.

```eda
boxplot @nb-football-group-goals-chart-3 total_goals color=group_field title="Match-total distributions by group" y.title="Total goals (goals per match)"
```

## 4. Drawn and decisive final scores

A draw is defined by equal final goals. This is not a claim about whether a match was tactically balanced or whether either team deserved to win.

```eda
row @nb-football-group-goals-chart-4 result title="Drawn and decisive final scores" x.title="Source rows"
```

**Computed finding.** Matches with a margin no greater than one goal represented 68.75% of the group stage. This calculation uses 48 eligible rows after the recorded filter and field-completeness rule.

## 5. Inspect the records behind the comparison

The table exposes the source values or prepared values actually used above. Select a row to inspect the calculation inputs; clear chart selections before comparing a live chart with the fixed prose. Notebook selections are local to their chart, not linked across the page.

```eda
table @nb-football-group-goals-records date,group_field,team1,team2,goals1,goals2,total_goals,margin title="Records behind this comparison"
```

## What the comparison supports

Match totals describe spectacle; margins describe closeness. They can move independently, so a high-scoring match should not automatically be called uncompetitive.

## Limits

Only the supplied group stage is included. Final scores exclude penalty shootouts and contain no playing-time, shot, or possession information. The first listed side is not treated as a home team.

## Source and preparation

OpenFootball community, football.db; Public-domain dedication (OpenFootball publisher statement). Historical source version: Git blob 6069ee605e0556ffc8cc7d60983e7a369e755303

Data credit and license: [football provenance](../../datasets.json). The accompanying [field dictionary](fields.json) gives units and missingness for every field. [Preparation source](https://github.com/byronwall/explorEDA/blob/main/docs/research/daily-viz-corpus-2026-10-15/handoff/scripts/prepare.py) records the transformation; the catalogue entry records filters, denominators, source-row IDs, and CSV hashes.

**Reading units.** goals1: goals by first listed team; goals2: goals by second listed team; total_goals: goals per match; margin: absolute final goal difference.
