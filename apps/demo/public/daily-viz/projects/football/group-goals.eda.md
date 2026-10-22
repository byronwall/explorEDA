# Two in three World Cup group matches were decided by a goal or less

**How close were the 2018 World Cup's group matches?** Each row is one of the 48 group-stage matches in Russia, with its final score. Half of them were settled by exactly one goal, and the most common scorelines were the two tightest ones.

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
calc margin_label = margin == 0 ? "0: draw" : margin == 1 ? "1 goal" : margin == 2 ? "2 goals" : margin == 3 ? "3 goals" : "5 goals"
calc winner_goals = max(goals1, goals2)
calc loser_goals = min(goals1, goals2)
calc winner_label = winner_goals == 0 ? "0 goals" : winner_goals == 1 ? "1 goal" : winner_goals == 2 ? "2 goals" : winner_goals == 3 ? "3 goals" : winner_goals == 5 ? "5 goals" : "6 goals"
calc loser_label = loser_goals == 0 ? "0 goals" : loser_goals == 1 ? "1 goal" : loser_goals == 2 ? "2 goals" : "3 goals"
```

## Half the matches were won by a single goal

Each bar counts matches by the gap between the two sides at the final whistle. 50.00% of matches were won by exactly one goal, and 18.75% were drawn. Together, 68.75% of the group stage was decided by one goal or less. Only two matches, Russia 5-0 Saudi Arabia and England 6-1 Panama, were won by five.

```eda
group @nb-football-group-goals-margins count by=margin_label
bar @nb-football-group-goals-chart-1 margin_label group=nb-football-group-goals-margins title="Group matches by winning margin, 2018 World Cup" x.title="Winning margin" y.title="Matches" categoryOrder=label
```

## 1-0 and 2-1 account for half of all scorelines

Each cell counts matches with that winner's score and loser's score. The two cells beside the diagonal hold the bulk: 27.08% of matches finished 1-0 and 22.92% finished 2-1. Every draw sits on the diagonal, from a single 0-0 to Portugal 3-3 Spain. Nothing above 3-3 and nothing wider than 6-1.

```eda
heatmap @nb-football-group-goals-chart-2 loser_label columnField=winner_label aggregation=count showValues=true sortBy=label columnSortBy=label title="Matches by scoreline: loser's goals down, winner's goals across" x.title="Winner's goals" y.title="Loser's goals"
```

## Group G scored four a match, Group C one and a half

Each box holds one group's six matches by goals scored. The tournament averaged 2.54 goals a match. Group G, with Belgium and England putting eleven past Panama and Tunisia, averaged 4.00 goals a match. Group C, where France, Denmark, and Peru managed one goal or none in four of six games, averaged 1.50.

```eda
boxplot @nb-football-group-goals-chart-3 total_goals color=group_field title="Goals per match by group" y.title="Goals in the match" {
  rule y=mean "Tournament average"
}
```

## Takeaway

The group stage was tight: a one-goal result was the norm and a rout the exception. The spread between groups was in goals, not closeness. Group G's four-goal games and Group C's goalless ones were both mostly decided by a single goal.

## Limits

Forty-eight matches from one tournament's group stage. Final scores only, so nothing about shots, possession, or late goals. The first-listed side is not a home team.
