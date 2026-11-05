# Do teams that pass better win more?

Short answer: yes. In the 2023 regular season, a team's EPA per pass play tracks its win rate closely (correlation about 0.77 across 32 teams). EPA per run play also relates to winning, but more weakly (about 0.40).

Each point below is one team. Every team played 17 games, home or away. Win rate counts a game from either side. EPA per play is expected points added, averaged over a team's offensive pass or run plays in each game, then over its games.

```eda
eda query=team-game
pass:num=pass_epa label="EPA per pass play"
run:num=run_epa label="EPA per run play"
wr:num=winrate label="Win rate"
team:cat=plays.posteam label=Team
```

## Passing

```eda
scatter @pass_vs_win x=pass y=wr labelField=team regression=linear {
  title="Passing efficiency vs win rate"
}
```

Teams to the right of zero on passing EPA, such as BUF, DAL, DET, BAL and MIA, mostly won more than half their games. The weakest passing offenses (NYJ, CAR) were near the bottom of the win-rate range.

## Running

```eda
scatter @run_vs_win x=run y=wr labelField=team regression=linear {
  title="Rushing efficiency vs win rate"
}
```

The rushing cloud is flatter. Most teams were below zero EPA on runs, and the spread in win rate at any run EPA is wide. Running well helps, but passing explains more of who wins.

## Team table

```eda
table @teams team,games,pass,run,wr
```

Caveat: one season, 32 teams, and EPA is not independent of the score (teams that lead run more, which drags down run EPA). This shows association, not cause.
