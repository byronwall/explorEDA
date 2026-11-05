# Three things in the 2023 NFL data

## Roofs and scoring

Games under an open roof averaged 51 total points and closed-roof games 48.7, against 44.3 in domes and 42 outdoors (regular season, 2023). Open-roof is likely a tiny group, so treat it with care.

```eda
eda query=by-roof
group @avgTotal avg(games.total) by=games.roof
row @roof games.roof group=avgTotal title="Average total points by roof type"
```

## Pass and run flip on later downs

Passes gain slightly more EPA than runs on 1st and 2nd down, but on 3rd and 4th down runs come out far ahead (about +0.6 on 4th, against -0.35 for passes). Runs on those downs are likely short-yardage calls, so this is selection, not proof that running is better.

```eda
eda query=by-down
line @down x=plays.down y=epa color=plays.play_type title="Average EPA per play by down"
```

## Draft round barely predicts passer EPA

Average EPA per pass by the passer's draft round shows no trend: round 7 is best (0.13) and round 5 worst (-0.23), with round 1 near zero. Undrafted passers show as (missing). Some rounds have few passers, so the bars are noisy.

```eda
eda query=by-round
group @epaRound avg(plays.epa) by=passer.draft_round
row @round passer.draft_round group=epaRound title="Average EPA per pass by passer draft round"
```
