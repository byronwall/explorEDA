# Indonesia's banana yields rose tenfold; Mali's fell by two fifths

**Which of the top banana producers raised their yields since the 1960s, and who stalled?** Each row is one country in one decade: the fifteen countries with the highest long-run banana yields, in tonnes per hectare, averaged over each decade from the 1960s to the 2010s. The group's average cell rose from 27.7 tonnes a hectare in the 1960s to 43.6 in the 2010s, but the countries that got there took very different paths, and two went backwards.

```eda
eda query=decades
country:cat=yields.Country label="Country"
decade:cat=yields.Decade label="Decade"
start:num=decade_start label="Decade"
yield:num=yield label="Yield (t/ha)"
y1960:num=yield_1960s label="Yield in the 1960s (t/ha)"
y2010:num=yield_2010s label="Yield in the 2010s (t/ha)"
group @by2010 sum(y2010) by=country
group @by1960 sum(y1960) by=country
```

## Two countries tripled their yields; two fell

Each cell is a decade average. Read along a row: Indonesia's yield in the 2010s was 9.77 times its 1960s figure, from 6.1 to 59.6 tonnes a hectare, and Côte d'Ivoire's was 3.34 times. Guatemala, Costa Rica, Egypt, and Israel more than doubled. Mali's was 0.59 times: from 60.0 tonnes a hectare, the highest of the 1960s, to 35.4. Panama also fell. Blank cells are decades with no published figure.

```eda
heatmap @nb-bananas-tripled-and-stalled-1 country columnField=decade measureField=yield aggregation=average sortBy=data maxCategories=15 showValues=true title="Banana yield by country and decade (tonnes per hectare)"
```

## The paths converged on forty to sixty tonnes

Plotted by decade, the fifteen lines fan in from both sides. In the 1960s the spread ran from Indonesia's 6.1 to Mali's 60.0 tonnes a hectare; in the 2010s it ran from Palestine's 26.6 to Indonesia's 59.6. Mali's 1990s peak of 62.1 tonnes a hectare was the highest cell in the table, and its fall since is the steepest.

```eda
scatter @nb-bananas-tripled-and-stalled-2 x=start y=yield color=country title="Banana yield by decade, fifteen countries (tonnes per hectare)" x.title="Decade" y.title="Yield (t/ha)" pointSize=3 where.yield=0.1.. {
  connect.groupField=yields.Country connect.orderField=decade_start connect.labels=end
  callout "Mali's 1990s peak" on=yields.Country:Mali,yields.Decade:1990s offset=-20,-30
  callout "Indonesia, 1960s" on=yields.Country:Indonesia,yields.Decade:1960s offset=30,20
}
```

## The 2010s table is Indonesia's; the 1960s table was Mali's

Ranked by their latest decade, Indonesia, Nicaragua, and Costa Rica lead at 59.6, 56.5, and 52.7 tonnes a hectare. Ranked by the 1960s, Mali, Panama, and Nicaragua led. Only Nicaragua is near the top of both lists. Morocco, Palestine, and South Korea have no figure for one of the two decades.

```eda
row @nb-bananas-tripled-and-stalled-3 country group=by2010 topN=15 title="Banana yield in the 2010s (tonnes per hectare)" x.title="Yield (t/ha)"
```

```eda
row @nb-bananas-tripled-and-stalled-4 country group=by1960 topN=15 title="Banana yield in the 1960s (tonnes per hectare)" x.title="Yield (t/ha)"
```

## Takeaway

The headline is convergence: the top producers' average yield rose by half while the spread between them narrowed. Inside it, Indonesia's tenfold rise is the whole story of the rising average, and Mali shows a yield can fall by two fifths from the top of the table.

## Limits

Only the decade averages are published figures; the yearly rows behind them are drawn to match each decade's average, so this piece reads nothing finer than a decade. The 2010s run to 2018. South Korea, Palestine, and Morocco have decades without a figure, and the fifteen countries are those with the highest long-run average, not the biggest producers.
