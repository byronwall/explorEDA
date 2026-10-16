# One operating day can change a small-sample fitted slope

**How much does the airflow–loss slope change when each observation is omitted in turn?** Each row is one recorded plant operating day.

```eda
eda query=r
stackloss:num=r.stackloss label="Stack loss (10 × % ammonia)"
airflow:num=r.airflow label="Airflow (coded)"
sequence:num=r.sequence label="Sequence"
fitted:num=r.fitted label="Fitted loss (10 × % ammonia)"
residual:num=r.residual label="Residual (10 × % ammonia)"
loo_slope:num=r.loo_slope label="Slope without this day"
slope_shift:num=r.slope_shift label="Slope shift (slope units)"
```

## 1. The complete-sample descriptive fit

Start with every original observation. The sensitivity exercise must remain anchored to the model that would otherwise be reported.

```eda
scatter @nb-stackloss-leave-one-out-chart-1 x=airflow y=stackloss regression=linear title="The complete-sample descriptive fit" x.title="Airflow (coded)" y.title="Stack loss (10 × % ammonia)"
```

## 2. Residuals from that same fit

A residual is recorded minus fitted loss. Large residuals and influence are related concepts, but one is not a substitute for the other.

```eda
scatter @nb-stackloss-leave-one-out-chart-2 x=fitted y=residual title="Residuals from that same fit" x.title="Fitted loss (10 × % ammonia)" y.title="Residual (10 × % ammonia)"
```

**Finding.** The smallest leave-one-out airflow slope was 0.9479 loss units per airflow unit.

## 3. The slope after omitting each source row

The horizontal position identifies the omitted row. These are refits of almost the same small dataset, not independent slope estimates.

```eda
scatter @nb-stackloss-leave-one-out-chart-3 x=sequence y=loo_slope title="The slope after omitting each source row" x.title="Sequence" y.title="Slope without this day"
```

## 4. Does a large residual imply a large slope shift?

Compare the two diagnostics directly. The prepared shift subtracts the complete-sample slope and preserves its sign.

```eda
scatter @nb-stackloss-leave-one-out-chart-4 x=residual y=slope_shift title="Does a large residual imply a large slope shift?" x.title="Residual (10 × % ammonia)" y.title="Slope shift (slope units)"
```

**Finding.** The largest leave-one-out airflow slope was 1.0982 loss units per airflow unit.

## 5. The rows behind the charts

Sort a column or select rows to check any value above. Selections in a notebook stay with their own chart.

```eda
table @nb-stackloss-leave-one-out-records sequence,airflow,stackloss,residual,loo_slope,slope_shift title="Records behind this comparison"
```

## Takeaway

An influential point is a reason to inspect the record and the model, not a license to delete it. Preserve the original fit and every omitted-row result side by side.

## Limits

Leave-one-out fits diagnose sensitivity, not data validity. The omitted points are not automatically errors, and the single-predictor model ignores other measured process conditions.
