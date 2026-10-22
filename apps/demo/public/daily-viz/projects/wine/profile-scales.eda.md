# Proline reads in the thousands and hue under two, so each assay needs its own ruler

**Why can't thirteen wine assays share one axis?** Each row is one Italian wine with thirteen chemical measurements. The numbers are honest but incommensurable: proline is reported in milligrams per liter and runs to 1,680, while hue is a ratio that never reaches two. Put them on one scale and twelve assays flatten into a line along the floor.

```eda
eda query=r
alcohol:num=r.alcohol label="Alcohol (% vol)"
malic_acid:num=r.malic_acid label="Malic acid (g/L)"
ash:num=r.ash label="Ash"
ash_alkalinity:num=r.ash_alkalinity label="Alkalinity of ash"
magnesium:num=r.magnesium label="Magnesium (mg/L)"
total_phenols:num=r.total_phenols label="Total phenols"
flavanoids:num=r.flavanoids label="Flavanoids"
nonflavanoid_phenols:num=r.nonflavanoid_phenols label="Nonflavanoid phenols"
proanthocyanins:num=r.proanthocyanins label="Proanthocyanins"
color_intensity:num=r.color_intensity label="Color intensity"
hue:num=r.hue label="Hue"
od_ratio:num=r.od_ratio label="OD280/OD315 of diluted wines"
proline:num=r.proline label="Proline (mg/L)"
cultivar:cat=r.cultivar label="Cultivar"
```

## Each axis gets its own ruler

A parallel plot scales every axis to its own field, so a wine's line shows where it sits among the 178 on each assay. The maximum recorded proline value was 1680.0 mg/L. The maximum recorded hue value was 1.710. On a shared axis the hue column would be a dot at zero; here it spreads the full height and separates cultivar 3 at the bottom.

```eda
parallel @nb-wine-profile-scales-chart-1 alcohol,malic_acid,magnesium,flavanoids,color_intensity,hue,proline color=cultivar title="Seven assays, one line per wine, each axis on its own scale"
```

## The rulers differ a thousandfold

The summary puts the scales side by side as numbers. Summing proline over the wines gives 780 times the sum of hue. Magnesium runs in the tens and hundreds, alcohol between 11 and 15, and the phenol assays mostly between zero and five.

```eda
summary @nb-wine-profile-scales-chart-2 title="Range and typical value of each assay"
```

## Proline alone picks out cultivar 1

The largest-scaled field also carries the clearest signal for one cultivar. Mean proline in Cultivar 1 was 1,116 mg/L. Mean proline in Cultivar 2 was 520 mg/L. The line at 760 mg/L sits above almost every cultivar 2 and 3 wine: 96.6% of cultivar 1 wines are at or above 760 mg/L, against 8.4% of the others.

```eda
boxplot @nb-wine-profile-scales-chart-3 proline color=cultivar title="Proline by cultivar" y.title="Proline (mg/L)" {
  rule y=760 "760 mg/L"
}
```

## Takeaway

The thirteen assays describe the same wines on rulers a thousandfold apart, so any view that shares an axis shows only proline. Scale each axis to its own field and the small-valued assays, hue and flavanoids, separate the cultivars as well as the large one does.

## Limits

The publisher gives units for few of the assays; proline and magnesium are taken as milligrams per liter and hue as a ratio. Parallel axes are independent, so the slope between two axes measures nothing physical. No classifier is fitted.
