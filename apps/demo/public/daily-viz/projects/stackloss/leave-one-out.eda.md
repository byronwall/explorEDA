# One operating day can change a small-sample fitted slope

**Reader question.** How much does the airflow–loss slope change when each observation is omitted in turn?

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

## 1. The complete-sample descriptive fit

Start with every original observation. The sensitivity exercise must remain anchored to the model that would otherwise be reported.

```eda
scatter @nb-stackloss-leave-one-out-chart-1 x=airflow y=stackloss regression=linear title="The complete-sample descriptive fit" x.title="Airflow (source airflow units)" y.title="Stackloss (10 × percent ammonia lost)"
```

## 2. Residuals from that same fit

A residual is recorded minus fitted loss. Large residuals and influence are related concepts, but one is not a substitute for the other.

```eda
scatter @nb-stackloss-leave-one-out-chart-2 x=fitted y=residual title="Residuals from that same fit" x.title="Fitted (10 × percent ammonia lost)" y.title="Residual (10 × percentage-point loss residual)"
```

**Computed finding.** The smallest leave-one-out airflow slope was 0.9479 loss units per airflow unit. This calculation uses 21 eligible rows after the recorded filter and field-completeness rule.

## 3. The slope after omitting each source row

The horizontal position identifies the omitted row. These are refits of almost the same small dataset, not independent slope estimates.

```eda
scatter @nb-stackloss-leave-one-out-chart-3 x=sequence y=loo_slope title="The slope after omitting each source row" x.title="Sequence" y.title="Loo slope (stackloss units per airflow unit)"
```

## 4. Does a large residual imply a large slope shift?

Compare the two diagnostics directly. The prepared shift subtracts the complete-sample slope and preserves its sign.

```eda
scatter @nb-stackloss-leave-one-out-chart-4 x=residual y=slope_shift title="Does a large residual imply a large slope shift?" x.title="Residual (10 × percentage-point loss residual)" y.title="Slope shift (slope units)"
```

**Computed finding.** The largest leave-one-out airflow slope was 1.0982 loss units per airflow unit. This calculation uses 21 eligible rows after the recorded filter and field-completeness rule.

## 5. Inspect the records behind the comparison

The table exposes the source values or prepared values actually used above. Select a row to inspect the calculation inputs; clear chart selections before comparing a live chart with the fixed prose. Notebook selections are local to their chart, not linked across the page.

```eda
table @nb-stackloss-leave-one-out-records sequence,airflow,stackloss,residual,loo_slope,slope_shift title="Records behind this comparison"
```

## What the comparison supports

An influential point is a reason to inspect the record and the model, not a license to delete it. Preserve the original fit and every omitted-row result side by side.

## Limits

Leave-one-out fits diagnose sensitivity, not data validity. The omitted points are not automatically errors, and the single-predictor model ignores other measured process conditions.

## Source and preparation

Brownlee historical plant data; distributed by statsmodels; Public domain (dataset-specific distributor statement). Historical source version: statsmodels 0.14.6; original historical series, not a live revision

Data credit and license: [stackloss provenance](../../datasets.json). The accompanying [field dictionary](fields.json) gives units and missingness for every field. [Preparation source](https://github.com/byronwall/explorEDA/blob/main/docs/research/daily-viz-corpus-2026-10-15/handoff/scripts/prepare.py) records the transformation; the catalogue entry records filters, denominators, source-row IDs, and CSV hashes.

**Reading units.** stackloss: 10 × percent ammonia lost; airflow: source airflow units; sequence: source row sequence; residual: 10 × percentage-point loss residual; loo_slope: stackloss units per airflow unit; slope_shift: slope units.
