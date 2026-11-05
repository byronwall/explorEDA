# Do teams that pass better win more games?

This notebook uses the 2023 NFL regular season. For each team it measures how
efficient the offense was on pass plays and on run plays, using expected points
added (EPA) per play. It then compares that to the team's win rate.
Each team's 17 games count once, whether it played at home or away.

```eda
eda query=team-stats
```

## Passing efficiency and winning

Each point is one team. The line is a linear fit.

```eda
scatter @pass x=teams.pass_epa y=teams.win_rate title="Pass EPA per play vs win rate" {
  regression=linear
  x.title="Pass EPA per play"
  y.title="Win rate"
}
```

Teams with a better pass offense won more often. Pass EPA per play explains about 57% of the spread in win rate (R² 0.57, correlation 0.75). San Francisco led at +0.27 EPA per pass and won 12 games. The Jets (-0.30) and Patriots (-0.26) were worst; Carolina (-0.25) won 2.

## Running efficiency and winning

```eda
scatter @run x=teams.run_epa y=teams.win_rate title="Run EPA per play vs win rate" {
  regression=linear
  x.title="Run EPA per play"
  y.title="Win rate"
}
```

Run efficiency shows a weaker link to wins: R² is 0.16 (correlation 0.40). Run EPA per play ranges only from about -0.17 to +0.07, much narrower than the pass range.

## Conclusion

Yes, in 2023 teams that passed better won more. Pass EPA per play is a strong predictor of win rate, and run EPA is a weak one. This is a correlation across 32 teams. Teams that lead late may run more, and good quarterbacks and good teams go together, so the data does not show that passing causes wins.

## All teams

```eda
table @all teams.team,teams.games,teams.wins,teams.win_rate,teams.pass_epa,teams.run_epa title="Team efficiency and record"
```
