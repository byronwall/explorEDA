# Two assays sort 178 wines into their three cultivars

**How different is the chemistry of wines from three grape cultivars?** Each row is one wine from the same region of Italy, analyzed for thirteen constituents and labeled with the cultivar it was made from. Two of those thirteen numbers, flavanoids and color intensity, are enough to tell most of the wines apart.

```eda
eda query=r
total_phenols:num=r.total_phenols label="Total phenols"
flavanoids:num=r.flavanoids label="Flavanoids"
od_ratio:num=r.od_ratio label="OD280/OD315 of diluted wines"
color_intensity:num=r.color_intensity label="Color intensity"
hue:num=r.hue label="Hue"
proline:num=r.proline label="Proline (mg/L)"
cultivar:cat=r.cultivar label="Cultivar"
```

## Three clusters in one scatter

Cultivar 2 sits low on color intensity, cultivar 3 sits low on flavanoids and high on color, and cultivar 1 is high on both. Two straight cuts, drawn as the boxes, recover the label for most wines: the two-assay rule names the right cultivar for 91.6% of the wines. The misses are cultivar 2 wines that stray into the other two boxes.

```eda
scatter @nb-wine-cultivar-chemistry-chart-1 x=flavanoids y=color_intensity color=cultivar title="Flavanoids and color intensity, one point per wine" x.title="Flavanoids" y.title="Color intensity" {
  region x=0.2..1.57 y=3.8..13.2 "Cultivar 3"
  region x=1.6..5.2 y=3.8..13.2 "Cultivar 1"
  region x=0.2..5.2 y=1.1..3.75 "Cultivar 2"
}
```

## Cultivar 1 has four times cultivar 3's flavanoids

The boxes do not touch. Mean flavanoids in Cultivar 1 were 2.982. Mean flavanoids in Cultivar 3 were 0.781. The lowest cultivar 1 wine measured 2.19, above the highest cultivar 3 wine at 1.57. Cultivar 2, with a mean of 2.081, spans both ranges, which is why flavanoids alone cannot finish the job.

```eda
boxplot @nb-wine-cultivar-chemistry-chart-2 flavanoids color=cultivar title="Flavanoids by cultivar" y.title="Flavanoids" {
  rule y=1.57 "Highest cultivar 3 wine"
  rule y=2.19 "Lowest cultivar 1 wine"
}
```

## The pattern runs through the whole phenol family

Each line is one wine across six assays. Cultivar 3 runs low on flavanoids, total phenols, the OD ratio, and hue, then crosses to the top on color intensity. Cultivar 1 runs high on proline, the only assay where it stands alone. Flavanoids and total phenols had correlation 0.865, so the first three axes mostly repeat one fact.

```eda
parallel @nb-wine-cultivar-chemistry-chart-3 flavanoids,total_phenols,od_ratio,hue,color_intensity,proline color=cultivar title="Six assays, one line per wine"
```

## Takeaway

The three cultivars are chemically distinct, and the distinction is mostly about phenols: cultivar 3 has few, cultivar 1 many, and cultivar 2 is pale. Two assays sort nine wines in ten; the parallel plot shows the same split on four more.

## Limits

This is the UCI wine recognition dataset: 178 wines from one region and one period, not a survey of these cultivars. The publisher gives no units for most assays. The cultivar is a grape variety, not a quality grade.
