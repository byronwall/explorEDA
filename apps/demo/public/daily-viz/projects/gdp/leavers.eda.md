# Three economies left the top twelve; three took their places

**Who dropped out of the world's twelve largest economies since 1980, and who replaced them?** Each row is one of seventeen economies in one year from 1980 to 2023, with GDP in current US dollars. Nine economies sat in the top twelve in both 1980 and 2023. Spain, Mexico, and the Netherlands were in the 1980 table and are not in the 2023 one; India, Russia, and South Korea are in the 2023 table and were not in 1980. Australia and Iran passed through in between.

```eda
eda query=gdp
country:cat=gdp.Country label="Economy"
year:num=gdp.Year label="Year"
trillions:num=trillions label="GDP (trillion US$)"
billions:num=billions label="GDP (billion US$)"
t2023:num=trillions_2023 label="GDP in 2023 (trillion US$)"
status:cat=status label="Top-twelve status"
scale @movers field=gdp.Country map=Spain:#c77a45,Mexico:#e0a84b,Netherlands:#d9c27a,India:#1f6fb2,"South Korea":#2a9d8f,Russia:#6c5b9e
```

## The leavers did not shrink; the joiners outgrew them

All six movers grew in dollar terms. Spain's economy grew 7.0-fold from 1980 to 2023 and Mexico's 8.7-fold, while South Korea's grew 27.7-fold and India's 18.8-fold. The paths cross: South Korea passed Spain in 2012 and India passed the United Kingdom in 2022.

```eda
scatter @nb-gdp-leavers-1 x=year y=trillions color=country title="GDP of the three leavers and three joiners, log scale" x.title="Year" y.title="GDP (trillion US$)" y.scale=log pointSize=2 colorScale=movers where.status=Left,Joined {
  connect.groupField=gdp.Country connect.orderField=gdp.Year connect.labels=end
  callout "South Korea passes Spain" on=gdp.Country:"South Korea",gdp.Year:2012 offset=-150,30
}
```

## The whole table, year by year

Each cell is one economy's GDP in one year, rows in the 1980 order. The top rows darken steadily; China's row turns from pale to dark after 2005; the Netherlands, Spain, and Mexico stay pale while India and South Korea darken below them.

```eda
heatmap @nb-gdp-leavers-2 country columnField=year measureField=trillions aggregation=sum sortBy=data maxCategories=17 maxColumns=44 showValues=false title="GDP by economy and year (trillion US$)"
```

## In 2023 the joiners produced $7.4 trillion; the leavers $4.6 trillion

The three economies that joined the top twelve produced $7.39 trillion in 2023; the three that left produced $4.55 trillion. India alone produced $3.50 trillion, more than Spain's $1.62 trillion and the Netherlands' $1.14 trillion together. South Korea, which produced $67 billion in 1980, produced $1.84 trillion in 2023.

```eda
bar @nb-gdp-leavers-3 status group=bystatus where.status=Left,Joined,"Passed through" title="GDP in 2023 by top-twelve status (trillion US$)" y.title="GDP (trillion US$)" x.title="Top-twelve status"
group @bystatus sum(t2023) by=status
```

## Takeaway

Nobody fell out of the top twelve by shrinking. Spain, Mexico, and the Netherlands grew six- to ninefold in dollars and were overtaken by economies that grew eighteen- to twenty-eight-fold. The table is a race, and the exits are relative.

## Limits

Current dollars mix real growth with exchange rates, which flatter or punish an economy in any given year. Russia has no data before 1988. Top-twelve status is read from this file of seventeen economies; a smaller economy outside it never appears.
