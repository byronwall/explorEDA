# The 2012 and 2013 columns are empty, not zero

**What do an export's blank last years do to a chart?** Each row is one of twelve countries in one year from 1960 to 2013, with its total fertility rate or a blank. The file's headers run to 2013, but no country has a value after 2011. A chart that reads blanks as zero shows fertility collapsing in a year; one that carries 2011 forward invents two years of data. This export keeps the blanks blank.

```eda
eda query=r
country:cat=r.country label="Country"
year:num=r.year label="Year"
fertility:num=r.fertility label="Births per woman"
year_label:cat=r.year_label label="Year"
coverage:cat=r.coverage label="Cell"
observed:num=r.observed label="Published"
```

## Every path stops at 2011

Each path is one country's last twelve years, and every one ends at the same point. The axis runs to 2013 because the file does, and the shaded band is what the file holds there: nothing. In the 2012 rows, 100.0% of values are missing. In the 2011 rows, 0.0% are.

```eda
scatter @nb-fertility-empty-end-years-chart-1 x=year y=fertility color=country title="Births per woman, 2000 to 2013, as exported" x.title="Year" y.title="Births per woman" x.min=2000 x.max=2013 where.observed=1 {
  connect.orderField=year connect.groupField=country connect.labels=end pointSize=2
  band x=2012..2013 "No published values"
}
```

## Two blank columns in a full grid

Each cell is one country-year, dark where the file holds a value. Fifty-two columns are full and the last two are empty for every country, so the gap is the export's, not any one country's. 624 of the 648 country-years hold a value, and the 24 that do not all sit in 2012 and 2013.

```eda
heatmap @nb-fertility-empty-end-years-chart-2 country columnField=year_label maxColumns=60 aggregation=average measureField=observed sortBy=label showValues=false title="Country-years with a published rate, 1960 to 2013"
```

## Twelve, twelve, twelve, zero, zero

The last five years of the file, counted by whether each country-year holds a value. Twelve countries report through 2011; then the count drops to zero, not because fertility did anything but because the export ends. Overall, 3.70% of the file's cells are blank, every one of them in these two columns.

```eda
bar @nb-fertility-empty-end-years-chart-3 year_label seriesField=coverage seriesLayout=stacked color=coverage title="Country-years by whether a rate was published, 2009 to 2013" y.title="Country-years" where.year=2009..
```

## Takeaway

The file ends in 2011; the headers end in 2013. Read the blanks as zero and twelve countries' fertility collapses in a year; carry 2011 forward and two years of data appear from nowhere. Leaving the cells empty is the only honest option, and it costs two columns of white space.

## Limits

This is a snapshot of a historical export, so the blanks say the values were unavailable in this file, not that they are unavailable now. Twelve countries chosen for contrast, not a sample.
