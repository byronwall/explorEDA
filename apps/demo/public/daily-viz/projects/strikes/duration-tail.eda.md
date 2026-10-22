# The average strike lasted 43 days; the typical one, 27

**How long does a strike last?** Each row is one of 62 US manufacturing strikes from 1968 to 1976, with its length in days. The mean strike ran 43 days and the median 27. The sixteen days between them belong to a handful of disputes that ran past a hundred days, and whichever number you quote, you are describing a different strike.

```eda
eda query=r
duration:num=r.duration label="Duration (days)"
sequence:num=r.sequence label="Strike (record order)"
calc slump = iprod < 0 ? "Production below trend" : "Production at or above trend"
iprod:num=r.iprod label="Industrial production (deviation from trend)"
```

## Half the strikes were over in 27 days

Count the strikes by length. The tall bars are all short: a third of the strikes ended within two weeks. The median recorded duration was 27.00 days, but the mean recorded duration was 42.66 days, because the bars never quite stop; they trail off to the right past 200 days.

```eda
hist @nb-strikes-duration-tail-chart-1 duration bins=36 title="Strikes by duration, US manufacturing 1968 to 1976" x.title="Duration (days)" y.title="Strikes" {
  rule x=27 "Median"
  rule x=42.66 "Mean"
}
```

## One strike in five ran past two months

The cumulative curve gives the share of strikes that had ended by any length. It climbs steeply through the first month and then flattens: 33.9% of strikes ended within two weeks, and 22.6% of strikes lasted more than 60 days. The curve does not reach the top until the longest strike, at 216 days.

```eda
ecdf @nb-strikes-duration-tail-chart-2 duration direction=below title="Share of strikes ended by each duration" x.title="Duration (days)"
```

## Eight strikes over a hundred days set the mean

Each strike in the order it appears in the file. The 8 strikes that ran longer than 100 days are easy to pick out, and the five longest together account for 29.11% of all strike days in the sample. Three of them, records 23 to 25, began in the same month, when production was below trend; the 216-day strike is one of those.

```eda
scatter @nb-strikes-duration-tail-chart-3 x=sequence y=duration color=slump title="Duration of each strike, in record order" x.title="Strike (record order)" y.title="Duration (days)" {
  rule y=mean "Mean"
  rule y=median "Median"
  callout "216 days" pick=max
}
```

## Takeaway

A typical manufacturing strike in this sample lasted four weeks; the average was six, because one strike in eight ran past a hundred days. The mean is the right number for total days lost and the wrong one for what a strike is like.

## Limits

Sixty-two strikes selected for an econometrics exercise, not all US strikes of the period. Durations are for completed strikes, so nothing here describes a dispute still running. Record order is the file's order, not a date.
