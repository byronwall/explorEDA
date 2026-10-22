# Drop one day and the airflow slope moves from 0.95 to 1.10

**How much does one day change the fitted airflow slope?** Each row is one of the 21 operating days behind the stack-loss fit, with the slope that a straight line would have if that day were left out. With so few days, two of them matter: day 21, which lost far less ammonia than its airflow predicts, and day 1, which lost more.

```eda
eda query=r
stackloss:num=r.stackloss label="Stack loss (10 × % ammonia)"
airflow:num=r.airflow label="Airflow (coded)"
sequence:num=r.sequence label="Day"
residual:num=r.residual label="Residual (10 × % ammonia)"
loo_slope:num=r.loo_slope label="Slope without this day"
slope_shift:num=r.slope_shift label="Slope shift"
```

## One day sits far below the line

With all 21 days, the fit gains 1.0203 units of loss per unit of airflow. Day 21 ran at airflow 70 and lost 15, where the line expects about 27; its residual, the largest in the sample, was -12.29. Day 1, at the top right, lost 4.5 more than the line predicts.

```eda
scatter @nb-stackloss-leave-one-out-chart-1 x=airflow y=stackloss regression=linear title="Stack loss against airflow, all 21 days" x.title="Airflow (coded)" y.title="Stack loss (10 × % ammonia)" {
  callout "Day 21: 12 below the line" at=70,15 offset=-40,40
  callout "Day 1: 4.5 above" at=80,42 offset=-80,20
}
```

## Leave day 21 out and the slope jumps

Each point is the slope refitted without that day, against the full-sample line. Nineteen of the points sit within a hair of it. Without day 21, the slope rises to 1.0982 units of loss per unit of airflow. Without day 1, the slope falls to 0.9479 units of loss per unit of airflow. 18 of the 21 days move the slope by less than 0.03.

```eda
scatter @nb-stackloss-leave-one-out-chart-2 x=sequence y=loo_slope title="Airflow slope with each day left out" x.title="Day left out" y.title="Slope without this day" {
  rule y=1.0203 "All 21 days: 1.02"
  callout "Without day 21: 1.10" pick=max offset=-40,20
  callout "Without day 1: 0.95" pick=min offset=20,-20
}
```

## Big residuals move the slope the other way

The two diagnostics line up: the days with the largest residuals are the days whose removal shifts the slope most, and the shift runs opposite to the residual. A day below the line pulls the slope down, so removing it pushes the slope up. Residual and slope shift had correlation -0.690. Most days cluster at the origin, moving nothing.

```eda
scatter @nb-stackloss-leave-one-out-chart-3 x=residual y=slope_shift title="Slope shift against residual, one point per day" x.title="Residual (10 × % ammonia)" y.title="Slope shift" {
  rule y=0 "No change"
  rule x=0 "On the line"
}
```

## Takeaway

The airflow slope is about one, but how close to one depends on two of 21 days: drop day 21 and it reads 1.10, drop day 1 and it reads 0.95. An influential point is a reason to check the record, not a license to delete it; report the full fit and say which days carry it.

## Limits

Leave-one-out refits measure sensitivity, not whether a day is wrong. The single-predictor model ignores cooling-water temperature and acid concentration, which also vary across these days. Slopes are in the source's coded airflow units.
