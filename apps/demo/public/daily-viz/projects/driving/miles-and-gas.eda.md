# Americans drove more every year for fifty years, whatever gas cost

**Did the price of gas change how much Americans drove?** Each row is one year from 1956 to 2010: the miles driven per person and the inflation-adjusted price of a gallon of gas. The path through the years says the price mattered at the margins and the trend did not care.

```eda
eda query=years
year:num=driving.Year label="Year"
miles:num=driving.Miles label="Miles driven per person"
gas:num=driving.Gas label="Gas price ($ per gallon, inflation-adjusted)"
decade:cat=decade label="Decade"
```

## The path climbs whether gas is cheap or dear

Each dot is one year, joined in order. The line snakes left and right as gas swings between $1.39 and $3.31, but it climbs almost without pause. Miles per person went from 3,675 in 1956 to 10,067 in 2005. Across the whole span, miles and gas price have a correlation of -0.174: nearly none.

```eda
scatter @nb-driving-miles-and-gas-1 x=gas y=miles color=decade connect.enabled=true connect.orderField=year title="Miles driven per person against the price of gas, 1956 to 2010" x.title="Gas price ($ per gallon, inflation-adjusted)" y.title="Miles driven per person" {
  callout "1974: first oil shock" on=driving.Year:1974
  callout "1980: gas at $3.30" on=driving.Year:1980
  callout "2008: $3.31 a gallon" on=driving.Year:2008
}
```

## Price spikes bought one bad year, then the climb resumed

Miles fell in only nine of 54 year-to-year steps, and six of those follow a price jump: 1974, 1979, 1980, 2006, 2007, and 2008. Each time the next years made the loss back. The 1980s, the decade of the second shock, added the most miles per person of any decade in the series.

```eda
line @nb-driving-miles-and-gas-2 x=year y=miles title="Miles driven per person by year" x.title="Year" y.title="Miles driven per person" {
  band x=1973.5..1974.5 "1973 shock"
  band x=1979..1981 "1979 shock"
  band x=2008..2010 "Recession"
}
```

## The 1990s were cheap and the 2000s stalled anyway

Each box is one decade’s gas prices. The 1990s averaged $1.63 a gallon, the cheapest decade, and miles rose by 1,158 per person. The 2000s averaged $2.35, and miles fell by 121 across the decade. The fall in 2009 came with gas down nearly a dollar from 2008: the recession, not the pump, parked the cars.

```eda
boxplot @nb-driving-miles-and-gas-3 gas color=decade title="Gas price by decade, inflation-adjusted" y.title="Gas price ($ per gallon)"
```

## Takeaway

For half a century, driving per person rose by about 120 miles a year regardless of the price of gas; an oil shock took back one year and no more. The series ends on the first sustained decline, and it began in 2006, two years before the price peak.

## Limits

Fifty-five annual national averages: the series cannot separate commuting from leisure, cars from trucks, or price from income and suburban growth, all of which rose together. Gas is adjusted for inflation to the recreation’s base year. The series stops in 2010, so whether the decline held is outside the data.
