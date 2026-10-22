# One American in forty was over 65 in 1850; by 2000 it was one in eight

**How did the age and sex profile of the United States change from 1850 to 2000?** Each row is one five-year age group of one sex in one decennial census, fifteen censuses from 1850 to 2000 with the number of people counted. In 1850 the country was a pyramid: nearly half its people were children and almost nobody was old. By 2000 the pyramid had become a column with a bulge, the baby boom, working its way up, and the old were mostly women.

```eda
eda query=pop
year:num=pop.Year label="Census year"
age:cat="pop.Age group" label="Age group"
sex:cat=pop.Sex label="Sex"
people:num=pop.People label="People"
millions:num=millions label="People (millions)"
surplus:num=surplus label="Men minus women (millions)"
band:cat=band label="Age band"
scale @bands field=band map="Under 15":#e8a33d,"15 to 64":#c9ced6,"65 and over":#1f6fb2
scale @sexes field=pop.Sex map=Male:#1f6fb2,Female:#c23b22
group @bycensus sum(millions) by=year
```

## Children fell from two fifths of the country to one fifth

Each bar is one census, split by age band. People under 15 were 40.9% of Americans in 1850 and 21.4% in 2000. People 65 and over were 2.6% in 1850 and 12.4% in 2000. The children's band shrinks steadily until 1940, swells again in the baby-boom censuses of 1950 and 1960, then shrinks for good.

```eda
bar @nb-census-aging-pyramid-1 year seriesField=band seriesLayout=percent group=bycensus colorScale=bands forceString=true categoryOrder=data title="Share of the population by age band, each census" y.title="Share of population (%)" x.title="Census"
```

## The baby boom crosses the table as a diagonal

Each cell is one age group in one census, shaded by how many people it held. The boom enters at the bottom left: the 0–4 group held 20.5 million people in 1960, the largest any age group had been. Follow it up and to the right, five years older each decade; in 2000 the biggest group was 35–39, with 23.1 million people.

```eda
heatmap @nb-census-aging-pyramid-2 age columnField=year measureField=millions aggregation=sum sortBy=data maxCategories=19 maxColumns=15 showValues=false title="People by age group and census (millions)"
```

## Above 65, women outnumber men; it was not always so

The same table, now shaded by men minus women. Blue cells have more men, red more women. In 1850 there were 100.3 men per 100 women aged 65 and over; the frontier censuses up to 1920 show a male surplus at working ages too. By 2000 there were 69.7 men per 100 women aged 65 and over, and 51.2 per 100 aged 80 and over. The red deepens from 1950 on, as women's lifespans pulled ahead.

```eda
heatmap @nb-census-aging-pyramid-3 age columnField=year measureField=surplus aggregation=sum sortBy=data maxCategories=19 maxColumns=15 showValues=false colorDomain.min=-2.5 colorDomain.max=2.5 title="Men minus women by age group and census (millions)"
```

## The 2000 profile is a column, not a pyramid

The 2000 census by age group and sex. The bars are nearly level from birth to 50, bulge at 35–44, and only then taper. Women lead every group from 30–34 up, and above 85 there were 3.05 million women to 1.31 million men.

```eda
bar @nb-census-aging-pyramid-4 age seriesField=sex seriesLayout=grouped group=by2000 colorScale=sexes categoryOrder=data where.year=2000 title="People by age group and sex, 2000 census (millions)" y.title="People (millions)" x.title="Age group"
group @by2000 sum(millions) by=age
```

## Takeaway

In 150 years the United States went from a country of children to a country of adults: the under-15 share halved and the over-65 share quintupled. The baby boom is a one-off bulge moving through an otherwise flattening profile, and the old age it is now reaching is a largely female one.

## Limits

Decennial counts, with 1890 missing from the source; the figures are census counts, not corrected for the undercount, which was largest for young Black men in the early twentieth century. Age groups stop at 90 and over. Nothing here separates births, deaths, and immigration, which all shaped the profile.
