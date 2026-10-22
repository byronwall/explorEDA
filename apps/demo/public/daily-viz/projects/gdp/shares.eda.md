# Japan once made a quarter of the big economies' output; now China does

**How have the United States, China, and Japan divided the output of the world's largest economies?** Each row is one of the seventeen economies that ranked in the world's top twelve in any year from 1980 to 2023. This piece reads each economy's share of the seventeen's combined GDP in current US dollars. The combined total grew from $8.5 trillion in 1980 to $82.3 trillion in 2023, and most of what changed inside it is three economies.

```eda
eda query=gdp
country:cat=gdp.Country label="Economy"
year:num=gdp.Year label="Year"
trillions:num=trillions label="GDP (trillion US$)"
bloc:cat=bloc label="Bloc"
scale @blocs field=bloc map="United States":#1f6fb2,China:#c23b22,Japan:#e8a33d,"The other fourteen":#c9ced6
scale @three field=gdp.Country map="United States":#1f6fb2,China:#c23b22,Japan:#e8a33d
group @byyear sum(trillions) by=year
```

## China took the share Japan gave up

Each bar is one year, split into the shares of the three economies and the other fourteen. In 1995 Japan made 22.2% of the combined total; by 2023 it made 5.3%. China made 2.2% in 1980 and 22.2% in 2023. The other fourteen's share hardly moved.

```eda
bar @nb-gdp-shares-1 year seriesField=bloc seriesLayout=percent group=byyear colorScale=blocs forceString=true title="Share of the seventeen economies' combined GDP, by year" y.title="Share of combined GDP (%)" x.title="Year"
```

## The United States kept a third throughout

The United States made 33.5% of the combined total in 1980 and 33.8% in 2023. Its share peaked at 42.9% in 1985, when the dollar was strong, and bottomed at 27.6% in 2011. In 1980 the United States produced 14.9 times China's output; in 2023 it produced 1.52 times.

```eda
scatter @nb-gdp-shares-2 x=year y=trillions color=country title="GDP of the United States, China, and Japan (trillion US$)" x.title="Year" y.title="GDP (trillion US$)" pointSize=2 colorScale=three where.country="United States",China,Japan {
  connect.groupField=gdp.Country connect.orderField=gdp.Year connect.labels=end
  band x=2008..2009 "Financial crisis"
}
```

## The whole table grew tenfold

Stacked, the same bars show the combined total growing from $8.5 trillion to $82.3 trillion. The United States' layer grows steadily; China's appears after 2000 and is a quarter of the stack by 2023; Japan's layer stops growing in the mid-1990s.

```eda
bar @nb-gdp-shares-3 year seriesField=bloc seriesLayout=stacked group=byyear colorScale=blocs forceString=true title="Combined GDP of the seventeen economies, by year (trillion US$)" y.title="GDP (trillion US$)" x.title="Year"
```

## Takeaway

The United States' share of the big economies' output is the same third it was in 1980. The change is beneath it: Japan's quarter became China's quarter, and the two swapped over roughly fifteen years.

## Limits

Shares are of these seventeen economies, not of the world. Current dollars move with exchange rates, which is why Japan's share peaks in 1995 and the United States' in 1985. Russia and India lack some early years, which slightly shrinks the early totals.
