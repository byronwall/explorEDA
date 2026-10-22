# Only China broke into the top two in 44 years

**Which economies climbed the world GDP table since 1980, and how far?** Each row is one economy in one year: the seventeen economies that ranked among the world's twelve largest in any year from 1980 to 2023, with their GDP in current US dollars. The United States held first place in every one of those years. Below it, one economy rewrote the table and the rest shuffled.

```eda
eda query=gdp
country:cat=gdp.Country label="Economy"
region:cat=gdp.Region label="Region"
year:num=gdp.Year label="Year"
gdp:num="gdp.GDP (current US$)" label="GDP (current US$)"
trillions:num=trillions label="GDP (trillion US$)"
t1980:num=trillions_1980 label="GDP in 1980 (trillion US$)"
t2023:num=trillions_2023 label="GDP in 2023 (trillion US$)"
status:cat=status label="Top-twelve status"
```

## Seventeen paths, and one that crosses them all

On a log axis every economy's path is a slope you can compare. China's is the steep one: it starts at the bottom of the pack in 1980, passes the United Kingdom in 2006, Germany in 2007, and Japan in 2010. Nothing else changes lane as often.

```eda
scatter @nb-gdp-league-table-1 x=year y=trillions color=country title="GDP of the seventeen economies, 1980 to 2023, log scale" x.title="Year" y.title="GDP (trillion US$)" y.scale=log pointSize=2 {
  connect.groupField=gdp.Country connect.orderField=gdp.Year
  band x=2008..2009 "Financial crisis"
  callout "China passes Japan" on=gdp.Country:China,gdp.Year:2010 offset=-110,40
}
```

## China grew ninety-five-fold; the United States tenfold

China's GDP in 2023 was 95.4 times its 1980 figure. The United States grew 9.7-fold over the same years and Japan 3.8-fold. South Korea, the other great climber, grew 27.7-fold and India 18.8-fold. In current dollars the whole table inflated, so the comparison that matters is between the multiples, not the levels.

```eda
row @nb-gdp-league-table-2 country group=by2023 topN=17 title="GDP in 2023 (trillion US$)" x.title="GDP (trillion US$)"
group @by2023 sum(t2023) by=country
```

## The 1980 table was European

In 1980 seven of the top twelve were in Europe or North America, and the largest Asian economy after Japan was China, in twelfth place with $191 billion. In 2023 the United States produced $27.8 trillion and China $18.3 trillion; the next largest, Germany, produced $4.6 trillion. Japan's output peaked at $6.33 trillion in 2012 and has fallen since, in dollar terms.

```eda
row @nb-gdp-league-table-3 country group=by1980 topN=17 title="GDP in 1980 (trillion US$)" x.title="GDP (trillion US$)"
group @by1980 sum(t1980) by=country
```

## Takeaway

The world's top two are now the United States and China, and in 44 years no other economy came close to either. The headline "China's rise" is this: a twelfth-place economy grew ninety-five-fold while the rest of the table grew four- to tenfold.

## Limits

Current US dollars mix real growth with inflation and exchange rates, so Japan's fall since 2012 is partly a weaker yen. Russia enters in 1988, so its 1980 multiple cannot be computed. Ranks here are among these seventeen economies only.
