# Nine draws cost the 2018 group stage nine points

**How much did draws shrink the points on offer?** Each row is one of the 48 group matches at the 2018 World Cup. A win pays three points to one side; a draw pays one to each, two in all. So every draw removes a point from the pool, and the groups that drew most had the least to divide.

```eda
eda query=r
group_field:cat=r.group label="Group"
date:date=r.date label="Date"
team1:cat=r.team1 label="First team"
team2:cat=r.team2 label="Second team"
total_goals:num=r.total_goals label="Goals in the match"
result:cat=r.result label="Result"
points_awarded:num=points_awarded label="Points awarded"
points_possible:num=points_possible label="Points possible"
```

## Group B drew three times; three groups never drew

Each cell counts a group's matches by result. 9 of the 48 matches were drawn, 18.75% of the group stage. Group B, with Portugal, Spain, Iran, and Morocco, drew three of its six, starting with Portugal 3-3 Spain. Groups A, F, and G produced a winner every time.

```eda
heatmap @nb-football-draws-and-points-chart-1 group_field columnField=result aggregation=count showValues=true sortBy=label title="Matches by group and result, 2018 World Cup" x.title="Result" y.title="Group"
```

## The points pool: 135 of a possible 144

Each bar is the points a group handed out over its six matches, with the full eighteen marked. Six decisive matches would pay 144 points across the stage; the nine draws cut the total awarded to 135. Group B's teams shared 15 points, three fewer than Groups A, F, and G, which paid the full 18 each.

```eda
group @nb-football-draws-and-points-pool sum(points_awarded) by=group_field
row @nb-football-draws-and-points-chart-2 group_field group=nb-football-draws-and-points-pool title="Points awarded in each group's six matches" x.title="Points awarded" {
  rule x=18 "Full 18"
}
```

## The draws were not dull ones

Each box holds the goals in one result type. Draws averaged 2.89 goals a match, more than the decisive matches at 2.46. Only one draw was goalless, Denmark 0-0 France on the last matchday, and four others finished 2-2 or 3-3.

```eda
boxplot @nb-football-draws-and-points-chart-3 total_goals color=result title="Goals per match, drawn against decisive" y.title="Goals in the match"
```

## Takeaway

Nine draws took nine points out of the group stage, and they fell unevenly: Group B lost three, three groups lost none. A group's points total is partly a record of how often its matches ended level, before it says anything about how strong its teams were.

## Limits

One tournament's group stage, under the three-one-zero points rule. Points awarded is arithmetic on the result, not the official table, which also applies tie-breaks. Nothing here says why a match ended level.
