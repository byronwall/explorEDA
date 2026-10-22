# Twenty OECD countries raised their tax take since 2000; fourteen cut it

**Did rich countries tax more or less in 2023 than in 2000?** Each row is one of 34 OECD members with central government tax revenue as a share of GDP in both years. The average country's share was 20.3% of GDP in 2000 and 20.4% in 2023: no change at all. Underneath, twenty countries rose and fourteen fell, by as much as nine points, and the ones that started high were the ones that fell.

```eda
eda query=countries
country:cat=readings.Country label="Country"
direction:cat=readings.Direction label="Direction"
share_2000:num=share_2000 label="2000 (% of GDP)"
share_2023:num=share_2023 label="2023 (% of GDP)"
change:num=change label="Change, 2000 to 2023 (points)"
start_band:cat=start_band label="Starting share"
scale @dir field=readings.Direction map=Rose:#1f6fb2,Fell:#c23b22
group @bychange average(change) by=country
```

## The average hid twenty risers and fourteen fallers

Each line is one country from its 2000 reading to its 2023 reading. The lines cross in both directions: 58.8% of the countries rose. Colombia rose 6.3 points, from 11.2% to 17.5% of GDP, and Mexico 5.1 points. Ireland's change was -8.8 points, from 26.3% to 17.5%, and Belgium's -4.8 points.

```eda
parallel @nb-tax-who-rose-1 share_2000,share_2023 color=direction colorScale=dir title="Central government tax revenue, 2000 and 2023 (% of GDP)"
```

## Ranked by change, Colombia leads and Ireland trails

The median country's share rose 0.70 points; the mean change was 0.11 points because the big falls outweigh the many small rises. The United States' change was -2.4 points, to 10.6% of GDP, the second-lowest share in the group after Switzerland's 8.7%. Denmark kept the highest share, 32.0% of GDP, in both years.

```eda
bar @nb-tax-who-rose-2 country group=bychange where.direction=Rose title="The twenty countries whose share rose, 2000 to 2023 (points of GDP)" y.title="Change (points of GDP)" x.title="Country"
```

```eda
bar @nb-tax-who-rose-3 country group=bychange where.direction=Fell title="The fourteen whose share fell, 2000 to 2023 (points of GDP)" y.title="Change (points of GDP)" x.title="Country"
```

## Countries that started high came down

Plot each country's change against where it started. The 19 countries at or above 20% of GDP in 2000 changed by -0.54 points on average; the 15 below 20% changed by 0.95 points on average. Ireland and Belgium, Sweden and Israel all started above 26% and fell. Colombia, Mexico, Chile, and Latvia all started below 17% and rose.

```eda
scatter @nb-tax-who-rose-4 x=share_2000 y=change color=direction colorScale=dir regression=linear title="Change against the 2000 share, 34 OECD countries" x.title="Tax revenue in 2000 (% of GDP)" y.title="Change to 2023 (points of GDP)" {
  rule y=0 "No change"
  callout "Ireland" on=readings.Country:Ireland offset=20,20
  callout "Colombia" on=readings.Country:Colombia offset=20,-20
}
```

## Takeaway

The OECD's tax take did not move in 23 years, but almost every country's did. The pattern is mild convergence: high-tax states shaved a point or two, low-tax states added one or two, and the spread from Switzerland to Denmark stayed about 23 points wide.

## Limits

The indicator counts central government revenue only, so federal countries such as the United States, Germany, Switzerland, and Canada read far below their total tax burden. Four OECD members without both readings, Japan, Australia, New Zealand, and Türkiye, are left out. Two years, 2000 and 2023, cannot show what happened in between.
