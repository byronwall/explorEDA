# Strikes ran 13 days longer when production was below trend

**Do strikes last longer in a slump?** Each row is one of 62 US manufacturing strikes from 1968 to 1976, with its length in days and how far industrial production sat from its trend in the month the strike began. 25 strikes began with production below trend and 37 with production at or above it. The median strike in the first group ran 38 days; in the second, 25.

```eda
eda query=r
duration:num=r.duration label="Duration (days)"
iprod:num=r.iprod label="Industrial production (deviation from trend)"
calc slump = iprod < 0 ? "Production below trend" : "Production at or above trend"
```

## The long strikes sit left of zero

Each point is one strike, placed by the production deviation when it began and its length. The fitted line slopes down: production deviation and duration had correlation -0.348. Everything over 150 days is to the left of the zero line, where production was below trend. Strikes cluster in a few columns because the deviation is a monthly figure.

```eda
scatter @nb-strikes-production-context-chart-1 x=iprod y=duration regression=linear title="Strike duration against production deviation at the start, 62 strikes" x.title="Industrial production (deviation from trend)" y.title="Duration (days)" {
  rule x=0 "Production on trend"
  callout "216 days" pick=max
}
```

## Median 38 days against 25

Split at zero and compare. Median duration at negative production deviations was 38.00 days, and median duration at nonnegative production deviations was 25.00 days. The means are further apart: 59.9 days against 31.0, because the below-trend group holds nearly all of the very long strikes.

```eda
boxplot @nb-strikes-production-context-chart-2 duration color=slump title="Strike duration by production at the start" y.title="Duration (days)"
```

## Below trend, two in five ran past two months

The cumulative curves show where the two groups differ: not in the first two weeks, where they overlap, but in the tail. 40.0% of strikes that began below trend lasted more than 60 days, against 10.8% of strikes that began at or above trend.

```eda
ecdf @nb-strikes-production-context-chart-3 duration color=slump direction=below title="Share of strikes ended by each duration, by production at the start" x.title="Duration (days)"
```

## Takeaway

Strikes that began in a slump ran a median 13 days longer and were four times as likely to pass two months. The sample cannot say why; it can say the pattern is in the tail, not the typical strike.

## Limits

Sixty-two strikes chosen for an econometrics exercise, split at zero by the analyst. The production deviation is a monthly figure, so several strikes share one value, and it describes conditions at the start, not during the strike. Nothing here identifies cause.
