# The clock-hour pattern depends on which days were supplied

**Do recurring UTC hours have similar signed and absolute errors within each month?** Each row is one month and UTC clock hour.

```eda
eda query=clock
month_label:cat=clock.month_label label="Calendar month"
hour:num=clock.hour label="Hour (UTC)"
hour_label:cat=clock.hour_label label="Clock hour"
error:num=clock.error label="Error (MWh)"
abs_error:num=clock.abs_error label="Absolute error (MWh)"
hours:num=clock.hours label="Hours"
```

## 1. Signed error by UTC clock hour and month

The position of each cell carries calendar structure. Signed values retain direction, while the shared unit keeps all cells comparable.

```eda
heatmap @nb-ercot-clock-coverage-chart-1 hour_label maxCategories=24 columnField=month_label aggregation=average measureField=error showValues=true title="Signed error by UTC clock hour and month"
```

## 2. Absolute error asks a different question

Absolute errors measure miss size regardless of sign. A cell can have a small signed mean even when its positive and negative errors are both substantial.

```eda
heatmap @nb-ercot-clock-coverage-chart-2 hour_label maxCategories=24 columnField=month_label aggregation=average measureField=abs_error title="Absolute error asks a different question"
```

**Finding.** The best-supported month-hour cell contains 31 hours.

## 3. How much support is behind each mean?

Pair the estimated mean with the actual contributing-hour count. This makes unequal support visible rather than encoding a sparse cell as if it were a complete month.

```eda
scatter @nb-ercot-clock-coverage-chart-3 x=hours y=abs_error color=month_label title="How much support is behind each mean?" x.title="Hours" y.title="Absolute error (MWh)"
```

## 4. Variation across clock-hour means

These boxes summarize cell means, not individual hourly errors. They help compare clock patterns but should not be substituted for the raw-hour distribution.

```eda
boxplot @nb-ercot-clock-coverage-chart-4 error color=month_label title="Variation across clock-hour means" y.title="Error (MWh)"
```

**Finding.** The least-supported month-hour cell contains 1 hour.

## 5. The rows behind the charts

Sort a column or select rows to check any value above. Selections in a notebook stay with their own chart.

```eda
table @nb-ercot-clock-coverage-records month_label,hour_label,hours,error,abs_error title="Records behind this comparison"
```

## Takeaway

Read the count before comparing the error. The table preserves each cell denominator so an apparently unusual hour can be distinguished from a scarcely observed boundary cell.

## Limits

These are means over available dates for a UTC clock hour. Partial boundary months have fewer observations, and the clock is not local Texas time. A mean of these cells is not automatically an hour-weighted monthly mean.
