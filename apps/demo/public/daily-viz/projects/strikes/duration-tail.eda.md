# A typical strike and a long strike tell different stories

**How far apart are the mean and median durations in this selected strike sample?** Each row is one selected manufacturing strike.

```eda
eda query=r
duration:num=r.duration label="Duration (days)"
iprod:num=r.iprod label="Industrial production (detrended)"
sequence:num=r.sequence label="Sequence"
log_duration:num=r.log_duration label="Duration (log₁₀ days)"
```

## 1. Count durations on their original day scale

A day-scale histogram keeps the operational meaning of an extended dispute. Its binning can make the dense short-duration region difficult to inspect.

```eda
hist @nb-strikes-duration-tail-chart-1 duration bins=20 title="Count durations on their original day scale" x.title="Duration (days)" y.title="Rows"
```

## 2. Read the share ending by a chosen duration

The cumulative view avoids bin choices but still describes only the observed sample. It is not a survival model for censored ongoing strikes.

```eda
ecdf @nb-strikes-duration-tail-chart-2 duration direction=below title="Read the share ending by a chosen duration" x.title="Duration (days)"
```

**Finding.** The mean recorded duration was 42.66 days.

## 3. A log transform spreads the shorter durations

The prepared log10 field changes the visual spacing, not the underlying durations. Equal horizontal distances now represent multiplicative ratios.

```eda
hist @nb-strikes-duration-tail-chart-3 log_duration bins=18 title="A log transform spreads the shorter durations" x.title="Duration (log₁₀ days)" y.title="Rows"
```

## 4. Keep the longest events attached to source rows

Sequence is only the original record position. It locates records for inspection and must not be presented as chronological trend.

```eda
scatter @nb-strikes-duration-tail-chart-4 x=sequence y=duration title="Keep the longest events attached to source rows" x.title="Sequence" y.title="Duration (days)"
```

**Finding.** The median recorded duration was 27.00 days.

## 5. The rows behind the charts

Sort a column or select rows to check any value above. Selections in a notebook stay with their own chart.

```eda
table @nb-strikes-duration-tail-records sequence,duration,log_duration,iprod title="Records behind this comparison"
```

## Takeaway

The long tail makes the average sensitive to a small number of lengthy events. Report both the central summary and the tail rather than trimming inconvenient observations without disclosure.

## Limits

The sample contains selected manufacturing strikes, not all labor disputes. Durations describe completed recorded events and should not be interpreted as a forecast for a current dispute.
