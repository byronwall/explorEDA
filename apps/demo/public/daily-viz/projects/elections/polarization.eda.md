# Close states became rare in presidential elections

**How many states were genuinely competitive, election by election?** Each row is one state (or DC) in one presidential election from 1976 to 2016, with the Democratic margin in percentage points.

```eda
eda query=elections
state:cat=elections.State label="State"
year:num=elections.Year label="Year"
margin:num=elections.Margin label="Democratic margin (points)"
winner:cat=elections.Winner label="Winner"
calc year_label = year == 1976 ? "1976 vote" : year == 1980 ? "1980 vote" : year == 1984 ? "1984 vote" : year == 1988 ? "1988 vote" : year == 1992 ? "1992 vote" : year == 1996 ? "1996 vote" : year == 2000 ? "2000 vote" : year == 2004 ? "2004 vote" : year == 2008 ? "2008 vote" : year == 2012 ? "2012 vote" : "2016 vote"
```

## The spread of margins widened

Each box is one election's 51 margins. The boxes get taller over time: states moved apart from each other, whichever party won nationally.

```eda
boxplot @nb-elections-polarization-1 margin color=year_label title="State margins by election" y.title="Democratic margin (points)" {
  rule y=0 "Tied"
}
```

## Fewer states near the line

Each dot is one state in one election. The band within five points of a tie was crowded in 1976 and nearly empty in 2012.

```eda
scatter @nb-elections-polarization-2 x=year y=margin color=winner title="Every state's margin, every election" x.title="Year" y.title="Democratic margin (points)" {
  band y=-5..5 "Within five points"
}
```

**Finding.** In 1976, 37.3% of states were decided by under five points.

**Finding.** In 2012, 7.8% were.

## Takeaway

In 1976, nineteen states were close enough to swing. By 2012 there were four. Campaigns now fight over a handful of states because only a handful are close.

## Limits

Margins are shares of all votes cast; third-party candidates widen or narrow them. 2016 had eleven close states, so the trend is not a straight line.
