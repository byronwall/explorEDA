# The clock-hour pattern depends on which days were supplied

**Reader question.** Do recurring UTC hours have similar signed and absolute errors within each supplied month?

**Population.** one month and UTC clock hour. The supplied snapshot is fixed. This article describes the unfiltered data; exploratory chart selections do not update the written findings.

```eda
eda query=clock
id:cat=clock.id label="Id"
month_label:cat=clock.month_label label="Month label"
hour:num=clock.hour label="Hour (UTC clock hour)"
hour_label:cat=clock.hour_label label="Hour label"
error:num=clock.error label="Error (MWh)"
abs_error:num=clock.abs_error label="Abs error (MWh)"
hours:num=clock.hours label="Hours (supplied hours)"
```

## 1. Signed error by UTC clock hour and month

The position of each cell carries calendar structure. Signed values retain direction, while the shared unit keeps all cells comparable.

```eda
heatmap @nb-ercot-clock-coverage-chart-1 hour_label columnField=month_label aggregation=average measureField=error showValues=true title="Signed error by UTC clock hour and month"
```

## 2. Absolute error asks a different question

Absolute errors measure miss size regardless of sign. A cell can have a small signed mean even when its positive and negative errors are both substantial.

```eda
heatmap @nb-ercot-clock-coverage-chart-2 hour_label columnField=month_label aggregation=average measureField=abs_error title="Absolute error asks a different question"
```

**Computed finding.** The best-supported month-hour cell contains 31 supplied hours. This calculation uses 53 eligible rows after the recorded filter and field-completeness rule. [Calculation and contributing IDs](../../evidence/findings/nb-ercot-clock-coverage.json).

## 3. How much support is behind each mean?

Pair the estimated mean with the actual contributing-hour count. This makes unequal support visible rather than encoding a sparse cell as if it were a complete month.

```eda
scatter @nb-ercot-clock-coverage-chart-3 x=hours y=abs_error color=month_label title="How much support is behind each mean?" x.title="Hours (supplied hours)" y.title="Abs error (MWh)"
```

## 4. Variation across clock-hour means

These boxes summarize cell means, not individual hourly errors. They help compare clock patterns but should not be substituted for the raw-hour distribution.

```eda
boxplot @nb-ercot-clock-coverage-chart-4 error color=month_label title="Variation across clock-hour means" y.title="Error (MWh)"
```

**Computed finding.** The least-supported month-hour cell contains 1 supplied hour. This calculation uses 53 eligible rows after the recorded filter and field-completeness rule. [Calculation and contributing IDs](../../evidence/findings/nb-ercot-clock-coverage.json).

## 5. Inspect the records behind the comparison

The table exposes the source values or prepared values actually used above. Select a row to inspect the calculation inputs; clear chart selections before comparing a live chart with the fixed prose. Notebook selections are local to their chart, not linked across the page.

```eda
table @nb-ercot-clock-coverage-records month_label,hour_label,hours,error,abs_error title="Records behind this comparison"
```

## What the comparison supports

Read the count before comparing the error. The table preserves each cell denominator so an apparently unusual hour can be distinguished from a scarcely observed boundary cell.

## Limits

These are means over available dates for a UTC clock hour. Partial boundary months have fewer observations, and the clock is not local Texas time. A mean of these cells is not automatically an hour-weighted monthly mean.

## Source and preparation

U.S. Energy Information Administration / ERCOT; U.S. public domain (EIA-authored data). Historical source version: Authorized repository baseline ea8b52ff742f11d1fb89457acabbcd27b0bd04e7

Data credit and license: [ercot provenance](../../datasets.json). The accompanying [field dictionary](../../evidence/fields/ercot.json) gives units and missingness for every field. [Preparation source](../../evidence/scripts/prepare.py) records the transformation; [computed evidence](../../evidence/findings/nb-ercot-clock-coverage.json) records filters, denominators, source-row IDs, and CSV hashes.

**Reading units.** error: MWh for the supplied hour; abs_error: MWh for the supplied hour; hours: supplied hours.
