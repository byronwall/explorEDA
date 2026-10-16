# Most 2018 group matches were decided by one goal or fewer

**How close were the 48 group-stage matches of the 2018 World Cup?** Each row is one 2018 World Cup group-stage match.

```eda
eda query=r
group_field:cat=r.group label="Group"
date:date=r.date label="Date"
team1:cat=r.team1 label="First team"
team2:cat=r.team2 label="Second team"
goals1:num=r.goals1 label="Goals, first team"
goals2:num=r.goals2 label="Goals, second team"
total_goals:num=r.total_goals label="Goals in the match"
margin:num=r.margin label="Winning margin (goals)"
result:cat=r.result label="Result"
```

## 1. How many goals did a match contain?

The unit is one match, so each final score contributes once. Team-appearance rows would double the count and require a different denominator.

```eda
hist @nb-football-group-goals-chart-1 total_goals bins=8 title="How many goals did a match contain?" x.title="Goals in the match" y.title="Rows"
```

## 2. A high total need not mean a wide margin

Each match has two derived measures from the same score. Coincident points remain separate records and should not be deduplicated.

```eda
scatter @nb-football-group-goals-chart-2 x=total_goals y=margin opacity=0.6 title="A high total need not mean a wide margin" x.title="Goals in the match" y.title="Winning margin (goals)"
```

**Finding.** The mean group-stage match total was 2.542 goals.

## 3. Match-total distributions by group

Every group has the same intended match schedule, but a small number of games makes broad group rankings fragile.

```eda
boxplot @nb-football-group-goals-chart-3 total_goals color=group_field title="Match-total distributions by group" y.title="Goals in the match"
```

## 4. Drawn and decisive final scores

A draw is defined by equal final goals. This is not a claim about whether a match was tactically balanced or whether either team deserved to win.

```eda
row @nb-football-group-goals-chart-4 result title="Drawn and decisive final scores" x.title="Rows"
```

**Finding.** Matches with a margin no greater than one goal represented 68.75% of the group stage.

## 5. The rows behind the charts

Sort a column or select rows to check any value above. Selections in a notebook stay with their own chart.

```eda
table @nb-football-group-goals-records date,group_field,team1,team2,goals1,goals2,total_goals,margin title="Records behind this comparison"
```

## Takeaway

Match totals describe spectacle; margins describe closeness. They can move independently, so a high-scoring match should not automatically be called uncompetitive.

## Limits

Only the group stage is included. Final scores exclude penalty shootouts and contain no playing-time, shot, or possession information. The first listed side is not treated as a home team.
