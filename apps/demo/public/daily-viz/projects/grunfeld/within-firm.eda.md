# Big firms invest more, but a firm's good year is a weaker signal

**Does a firm invest more in a year its market value rises?** Each row is one firm-year.

```eda
eda query=r
invest:num=r.invest label="Investment ($M, 1947)"
value:num=r.value label="Market value ($M, 1947)"
firm:cat=r.firm label="Firm"
year:num=r.year label="Year"
invest_change:num=r.invest_change label="Change in investment ($M, 1947)"
value_change:num=r.value_change label="Change in market value ($M, 1947)"
```

## 1. Firm size in the pooled levels

Each point is a firm-year rather than a distinct firm. Large firms can dominate the visual range without receiving more statistical weight per point.

```eda
scatter @nb-grunfeld-within-firm-chart-1 x=value y=invest color=firm opacity=0.6 title="Firm size in the pooled levels" x.title="Market value ($M, 1947)" y.title="Investment ($M, 1947)"
```

## 2. Change within a firm, not between firms

The preparation resets the difference at each firm boundary. No final year from one company is subtracted from the first year of another.

```eda
scatter @nb-grunfeld-within-firm-chart-2 x=value_change y=invest_change color=firm title="Change within a firm, not between firms" x.title="Change in market value ($M, 1947)" y.title="Change in investment ($M, 1947)"
```

**Finding.** Across firm-year levels, market value and investment had correlation 0.862.

## 3. Investment changes differ across firms

Group summaries retain the selected firms separately. They do not turn the repeated annual observations into independent experimental units.

```eda
boxplot @nb-grunfeld-within-firm-chart-3 invest_change color=firm title="Investment changes differ across firms" y.title="Change in investment ($M, 1947)"
```

## 4. How large are the recorded investment changes?

The cumulative distribution reveals negative and positive changes without bin choices. It weights each eligible firm-year difference equally.

```eda
ecdf @nb-grunfeld-within-firm-chart-4 invest_change direction=below title="How large are the recorded investment changes?" x.title="Change in investment ($M, 1947)"
```

**Finding.** Across valid within-firm annual changes, the correlation was 0.562.

## 5. The rows behind the charts

Sort a column or select rows to check any value above. Selections in a notebook stay with their own chart.

```eda
table @nb-grunfeld-within-firm-records firm,year,invest,value,invest_change,value_change title="Records behind this comparison"
```

## Takeaway

The pooled levels cloud mixes firm size with time movement. Within-firm differences change the unit of comparison to adjacent observations and should be named as a separate question.

## Limits

These selected historical firms are not a random sample of all businesses. First differences remain observational and can amplify measurement noise. Source monetary units are retained without an unverified multiplier.
