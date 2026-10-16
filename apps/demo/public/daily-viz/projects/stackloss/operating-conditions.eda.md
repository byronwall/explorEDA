# Plant operating conditions and recorded ammonia loss

**Reader question.** Which measured operating conditions vary alongside the recorded loss?

**Population.** one recorded plant operating day. The supplied snapshot is fixed. This article describes the unfiltered data; exploratory chart selections do not update the written findings.

```eda
eda query=r
id:cat=r.id label="Id"
stackloss:num=r.stackloss label="Stackloss (10 × percent ammonia lost)"
airflow:num=r.airflow label="Airflow (source airflow units)"
watertemp:num=r.watertemp label="Watertemp (°C)"
acidconc:num=r.acidconc label="Acidconc (source-coded acid concentration)"
sequence:num=r.sequence label="Sequence"
loss_pct:num=r.loss_pct label="Loss pct (%)"
fitted:num=r.fitted label="Fitted (10 × percent ammonia lost)"
residual:num=r.residual label="Residual (10 × percentage-point loss residual)"
loo_slope:num=r.loo_slope label="Loo slope (stackloss units per airflow unit)"
slope_shift:num=r.slope_shift label="Slope shift (slope units)"
air_band:cat=r.air_band label="Air band"
```

## 1. Airflow and recorded loss

A straight fit summarizes the observed cloud; it does not isolate airflow from the other operating conditions.

```eda
scatter @nb-stackloss-operating-conditions-chart-1 x=airflow y=stackloss regression=linear title="Airflow and recorded loss" x.title="Airflow (source airflow units)" y.title="Stackloss (10 × percent ammonia lost)"
```

## 2. Water temperature and recorded loss

The second predictor may move with the first. Comparing two separate scatters does not establish their independent effects.

```eda
scatter @nb-stackloss-operating-conditions-chart-2 x=watertemp y=stackloss title="Water temperature and recorded loss" x.title="Watertemp (°C)" y.title="Stackloss (10 × percent ammonia lost)"
```

**Computed finding.** Airflow and source-scaled stack loss had correlation 0.920. This calculation uses 21 eligible rows after the recorded filter and field-completeness rule. [Calculation and contributing IDs](../../evidence/findings/nb-stackloss-operating-conditions.json).

## 3. Source-coded acid concentration

Keep the original coding visible instead of inventing a physical concentration unit. The dictionary records that limitation.

```eda
scatter @nb-stackloss-operating-conditions-chart-3 x=acidconc y=stackloss title="Source-coded acid concentration" x.title="Acidconc (source-coded acid concentration)" y.title="Stackloss (10 × percent ammonia lost)"
```

## 4. Loss percentage across airflow groups

This presentation converts the documented loss scaling only. The airflow split is the sample median, so it is an analytical comparison rather than a safe operating threshold.

```eda
boxplot @nb-stackloss-operating-conditions-chart-4 loss_pct color=air_band title="Loss percentage across airflow groups" y.title="Loss pct (%)"
```

**Computed finding.** Cooling-water temperature and source-scaled stack loss had correlation 0.876. This calculation uses 21 eligible rows after the recorded filter and field-completeness rule. [Calculation and contributing IDs](../../evidence/findings/nb-stackloss-operating-conditions.json).

## 5. Inspect the records behind the comparison

The table exposes the source values or prepared values actually used above. Select a row to inspect the calculation inputs; clear chart selections before comparing a live chart with the fixed prose. Notebook selections are local to their chart, not linked across the page.

```eda
table @nb-stackloss-operating-conditions-records sequence,airflow,watertemp,acidconc,stackloss,loss_pct title="Records behind this comparison"
```

## What the comparison supports

Read the paired measurements before reducing the process to a single predictor. The scatter and grouped distributions reveal association, while the source table keeps the measurement scale explicit.

## Limits

The observations are selected operating days, not a randomized trial. Airflow and acid concentration retain source-coded units. A fitted descriptive relationship should not be used as an operating recommendation.

## Source and preparation

Brownlee historical plant data; distributed by statsmodels; Public domain (dataset-specific distributor statement). Historical source version: statsmodels 0.14.6; original historical series, not a live revision

Data credit and license: [stackloss provenance](../../datasets.json). The accompanying [field dictionary](../../evidence/fields/stackloss.json) gives units and missingness for every field. [Preparation source](../../evidence/scripts/prepare.py) records the transformation; [computed evidence](../../evidence/findings/nb-stackloss-operating-conditions.json) records filters, denominators, source-row IDs, and CSV hashes.

**Reading units.** stackloss: 10 × percent ammonia lost; airflow: source airflow units; watertemp: degrees Celsius; acidconc: source-coded acid concentration; sequence: source row sequence; loss_pct: % ammonia lost.
