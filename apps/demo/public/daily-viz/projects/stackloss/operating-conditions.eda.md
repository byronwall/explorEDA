# Airflow explains most of the ammonia lost up the stack

**Which plant settings move with the ammonia lost up the stack?** Each row is one of 21 days at a plant that oxidizes ammonia to nitric acid, recorded by Brownlee in 1960: the airflow into the plant, the cooling-water inlet temperature, the acid concentration, and the share of ammonia that escaped unconverted. Airflow is the setting to watch.

```eda
eda query=r
stackloss:num=r.stackloss label="Stack loss (10 × % ammonia)"
airflow:num=r.airflow label="Airflow (coded)"
watertemp:num=r.watertemp label="Cooling water (°C)"
acidconc:num=r.acidconc label="Acid concentration (coded)"
loss_pct:num=r.loss_pct label="Ammonia lost (%)"
air_band:cat=r.air_band label="Airflow band"
```

## Loss rises almost in step with airflow

Each point is one day. The fitted line climbs about one unit of loss for each unit of airflow, and the points hug it: airflow and stack loss had correlation 0.920, so the line explains about 85% of the variation in loss. The day in the callout is the exception the next notebook is about.

```eda
scatter @nb-stackloss-operating-conditions-chart-1 x=airflow y=stackloss regression=linear title="Stack loss against airflow, one point per day" x.title="Airflow (coded)" y.title="Stack loss (10 × % ammonia)" {
  callout "Day 21: airflow 70, loss only 15" at=70,15 offset=-40,40
}
```

## Water temperature tracks it nearly as well

Cooling-water temperature and stack loss had correlation 0.876. But the two settings move together: airflow and cooling-water temperature had correlation 0.782, because the plant ran hotter on the days it ran harder. The two scatters are largely the same story told twice. Acid concentration and stack loss had correlation 0.400, far behind.

```eda
scatter @nb-stackloss-operating-conditions-chart-2 x=watertemp y=stackloss regression=linear color=air_band title="Stack loss against cooling-water temperature, one point per day" x.title="Cooling water (°C)" y.title="Stack loss (10 × % ammonia)"
```

## High-airflow days lost more than twice the ammonia

Split the days at the median airflow of 58. On days at or above median airflow the plant lost 2.09% of its ammonia; on days below median airflow it lost 0.92%. Each line is one day across the three settings and the loss: the high-airflow lines run high on every axis, and the low-airflow lines run low, with acid concentration the one axis where they cross.

```eda
parallel @nb-stackloss-operating-conditions-chart-3 airflow,watertemp,acidconc,loss_pct color=air_band title="Three settings and the loss, one line per day"
```

## Takeaway

Push more air through the plant and more ammonia escapes, almost in proportion. Cooling-water temperature looks nearly as important only because it rises with airflow; acid concentration barely registers. On this plant, the airflow dial is the ammonia-loss dial.

## Limits

Twenty-one selected operating days, not a controlled trial, and the airflow and acid fields are in the source's coded units. Airflow and water temperature move together, so these single-setting fits cannot separate their effects. A fitted line is a description, not an operating recommendation.
