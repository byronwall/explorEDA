# Goal difference predicted group points, except for the teams that drew

**Did the teams that scored most also take the most points?** Each row is one of the 32 teams at the 2018 World Cup after its three group matches: goals for, goals against, and points. Goal difference tracks points closely, but the rule that pays a draw one point and a narrow win three leaves a few teams well off the line.

```eda
eda query=teams
team:cat=teams.team label="Team"
group_field:cat=teams.group label="Group"
goals_for:num=teams.goals_for label="Goals scored"
goals_against:num=teams.goals_against label="Goals conceded"
points:num=teams.points label="Points"
goal_difference:num=teams.goal_difference label="Goal difference"
```

## Points follow goal difference, up to a point

Each dot is one team, placed by its goal difference and its points. The fitted line is steep and the correlation between goal difference and points was 0.90. Teams with a positive goal difference averaged 6.54 points; teams with a negative one averaged 2.29. The exceptions are the drawers: Iran, Japan, and Senegal all finished level on goals with four points, while Mexico won two matches and lost one by three, for six points from a goal difference of minus one.

```eda
scatter @nb-football-points-and-goals-chart-1 x=goal_difference y=points regression=linear title="Points against goal difference, 32 teams" x.title="Goal difference" y.title="Points" {
  callout "Mexico: 6 points, −1 goal difference" on=teams.team:Mexico offset=-150,-14
  callout "Iran, Japan, Senegal: 4 points, level" on=teams.team:Japan offset=40,16
}
```

## Belgium scored nine; Panama let in eleven

Each dot is one team by goals scored and conceded, so the best teams sit bottom right. Belgium's 9 goals was the most any team scored, and Panama's 11 conceded was the most any team let in; the two met in Group G, 3-0. Uruguay, top left of the cluster, went through its group without conceding.

```eda
scatter @nb-football-points-and-goals-chart-2 x=goals_for y=goals_against color=group_field title="Goals scored and conceded after three matches" x.title="Goals scored" y.title="Goals conceded" {
  callout "Belgium" on=teams.team:Belgium offset=-20,-20
  callout "Panama" on=teams.team:Panama offset=-20,-20
  callout "Uruguay" on=teams.team:Uruguay offset=20,10
}
```

## Three teams took all nine points

The table ranks all 32 teams by points, best first. 3 teams won all three matches: Belgium, Croatia, and Uruguay. Five of the 32, 15.62%, reached seven or more. At the bottom, Egypt and Panama went home without a point.

```eda
table @nb-football-points-and-goals-chart-3 team,group_field,goals_for,goals_against,goal_difference,points sortBy=teams.points sortDirection=desc title="The 32 teams by group-stage points"
```

## Takeaway

Over three matches, goal difference explains most of the points table but not all of it. The rule that rewards a win three times as much as a draw lets a team like Mexico outscore its goal difference, and leaves three level-on-goals sides stuck on four.

## Limits

Thirty-two teams, three matches each, against different opponents, so neither goals nor points are strength-adjusted. Points are from results alone; the official table also applies tie-breaks that are not in this data.
