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

Each dot is one state in one election. The band within five points of a tie was crowded in 1976 and nearly empty in 2012. In 1976, 37.3% of states were decided by under five points. In 2012, 7.8% were. The closest of all sits on the line: Florida's 2000 margin was 0.0 points, and it decided the presidency.

```eda
scatter @nb-elections-polarization-2 x=year y=margin color=winner title="Every state's margin, every election" x.title="Year" y.title="Democratic margin (points)" {
  band y=-5..5 "Within five points"
  callout "Florida 2000: a tie" on=State:Florida,Year:2000 offset=-110,-30
}
```

## Utah and the District anchor the ends

Each cell is one state's margin in one election, blue for Democratic and red for Republican, on a scale fixed from 40 points either way. The District of Columbia's margin reached 86.4 points in 2016, and Utah's reached -52.2 in 1980. Down the middle, the pale rows of the 1970s give way to columns of saturated color: the same states, further apart.

```eda
heatmap @nb-elections-polarization-3 state columnField=year_label aggregation=average measureField=margin maxCategories=51 maxColumns=11 sortBy=label showValues=false title="Democratic margin by state and election, 1976 to 2016" x.title="Election" {
  colorDomain.min=-40 colorDomain.max=40
}
```

## Takeaway

In 1976, nineteen states were close enough to swing. By 2012 there were four. Campaigns now fight over a handful of states because only a handful are close.

## Limits

Margins are shares of all votes cast; third-party candidates widen or narrow them. 2016 had eleven close states, so the trend is not a straight line.
