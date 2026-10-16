# Airflow tracks ammonia loss more closely than any other setting

**Which plant settings move with the ammonia lost up the stack?** Each row is one recorded plant operating day.

```eda
eda query=r
stackloss:num=r.stackloss label="Stack loss (10 × % ammonia)"
airflow:num=r.airflow label="Airflow (coded)"
watertemp:num=r.watertemp label="Cooling water (°C)"
acidconc:num=r.acidconc label="Acid concentration (coded)"
sequence:num=r.sequence label="Sequence"
loss_pct:num=r.loss_pct label="Ammonia lost (%)"
air_band:cat=r.air_band label="Air band"
```

## 1. Airflow and recorded loss

A straight fit summarizes the observed cloud; it does not isolate airflow from the other operating conditions.

```eda
scatter @nb-stackloss-operating-conditions-chart-1 x=airflow y=stackloss regression=linear title="Airflow and recorded loss" x.title="Airflow (coded)" y.title="Stack loss (10 × % ammonia)"
```

## 2. Water temperature and recorded loss

The second predictor may move with the first. Comparing two separate scatters does not establish their independent effects.

```eda
scatter @nb-stackloss-operating-conditions-chart-2 x=watertemp y=stackloss title="Water temperature and recorded loss" x.title="Cooling water (°C)" y.title="Stack loss (10 × % ammonia)"
```

**Finding.** Airflow and source-scaled stack loss had correlation 0.920.

## 3. Source-coded acid concentration

Keep the original coding visible instead of inventing a physical concentration unit. The dictionary records that limitation.

```eda
scatter @nb-stackloss-operating-conditions-chart-3 x=acidconc y=stackloss title="Source-coded acid concentration" x.title="Acid concentration (coded)" y.title="Stack loss (10 × % ammonia)"
```

## 4. Loss percentage across airflow groups

This presentation converts the documented loss scaling only. The airflow split is the sample median, so it is an analytical comparison rather than a safe operating threshold.

```eda
boxplot @nb-stackloss-operating-conditions-chart-4 loss_pct color=air_band title="Loss percentage across airflow groups" y.title="Ammonia lost (%)"
```

**Finding.** Cooling-water temperature and source-scaled stack loss had correlation 0.876.

## 5. The rows behind the charts

Sort a column or select rows to check any value above. Selections in a notebook stay with their own chart.

```eda
table @nb-stackloss-operating-conditions-records sequence,airflow,watertemp,acidconc,stackloss,loss_pct title="Records behind this comparison"
```

## Takeaway

Read the paired measurements before reducing the process to a single predictor. The scatter and grouped distributions reveal association, while the source table keeps the measurement scale explicit.

## Limits

The observations are selected operating days, not a randomized trial. Airflow and acid concentration retain source-coded units. A fitted descriptive relationship should not be used as an operating recommendation.
