# West Virginia swung 58 points to the Republicans; Vermont swung 38 the other way

**How did each state’s lean change from 1976 to 2016?** Each row is one state or the District of Columbia, with its Democratic margin in the 1976 and 2016 presidential elections, in percentage points, and the change between them. The national result barely moved across those forty years. The states underneath it traded places.

```eda
eda query=drift
state:cat=elections.State label="State"
code:cat=elections.Code label="State"
m76:num=margin_1976 label="Democratic margin, 1976 (points)"
m16:num=margin_2016 label="Democratic margin, 2016 (points)"
drift:num=drift label="Change in Democratic margin, 1976 to 2016 (points)"
direction:cat=direction label="Drifted toward"
record:cat=record label="Record"
dem_wins:num=dem_wins label="Democratic wins, 1976–2016"
group @by_drift sum(drift) by=code
```

## Appalachia and the South moved furthest, and all one way

Each bar is a state’s change in Democratic margin over forty years. West Virginia’s margin moved -58.3 points, Arkansas’s -57.0, and Alabama, Tennessee, Georgia, and Kentucky each fell by more than 35. At the top, Vermont gained 38.3 points and California 31.9. The median state drifted -3.4 points, so the big moves are not a national tide but a sorting.

```eda
bar @nb-elections-drift-1 code group=by_drift title="Change in Democratic margin by state, 1976 to 2016 (points)" x.title="State" y.title="Change (points)" {
  rule y=0 "No change"
}
```

## A state’s 1976 lean barely predicts its 2016 lean

Each dot is a state, placed by its 1976 margin and its 2016 margin. The two margins have a correlation of 0.386. The upper-left and lower-right quadrants are the switchers: 16 states that Carter won in 1976 voted Republican in 2016, and 13 that Ford won voted Democratic. States that leaned Democratic in 1976 drifted -13.1 points on average; states that leaned Republican drifted 2.5.

```eda
scatter @nb-elections-drift-2 x=m76 y=m16 color=direction title="Democratic margin in 1976 against 2016, one dot per state (points)" x.title="Democratic margin, 1976 (points)" y.title="Democratic margin, 2016 (points)" {
  rule x=0 "Tied in 1976"
  rule y=0 "Tied in 2016"
  callout "West Virginia" on=elections.Code:WV
  callout "Vermont" on=elections.Code:VT
}
```

## Eleven states never changed hands in eleven elections

Each box is the drift of states grouped by their record. 9 states voted Republican in all eleven elections, and 2, Minnesota and the District of Columbia, voted Democratic in all eleven. The 40 that flipped at least once are where the drift lives: their boxes stretch from -58 to +38, while the never-flipped states sit near the line.

```eda
boxplot @nb-elections-drift-3 drift color=record title="Change in Democratic margin by voting record, 1976 to 2016" y.title="Change (points)"
```

## Takeaway

The electoral map was redrawn by realignment, not by a tide: the median state moved three points while sixteen states moved twenty or more. The old Democratic South and the Appalachian coal states became the Republican base, and the coasts became the Democratic one.

## Limits

Two endpoints forty years apart, so a state that swung out and back, like West Virginia’s 1996 Democratic win, is read only by where it ended. Margins are shares of all votes cast, and third-party candidates in 1980, 1992, and 2016 shift them. Minnesota’s Democratic-Farmer-Labor line counts as Democratic.
