# The CO₂ record is missing 59 weeks, and 35 of them are four outages

**When the Mauna Loa record goes blank, how long does it stay blank?** Each row is one run of consecutive missing weeks in the weekly CO₂ series, 1958 to 2001: 22 runs in all. Most are a single week. A handful are the kind of outage that matters, and one of them, in early 1964, lasted four months.

```eda
eda query=gaps
date:date=gaps.date label="First missing week"
end_date:date=gaps.end_date label="Last missing week"
length:num=gaps.length label="Missing weeks in a row"
year:num=gaps.year label="Year"
before:num=gaps.before label="CO₂ before the gap (ppm)"
after:num=gaps.after label="CO₂ after the gap (ppm)"
change:num=change label="Change across the gap (ppm)"
```

## One outage dwarfs the rest

Each point is one run, placed at its year; its height is the number of weeks lost. The longest run spans 18 weeks, from 25 January to 23 May 1964. Nineteen of the 22 runs fall before 1970; after 1970 the record loses a week in 1976, four weeks in 1984, and one in 1985, and then nothing.

```eda
scatter @nb-co2-missing-runs-chart-1 x=year y=length title="Missing runs by year and length" x.title="Year" y.title="Missing weeks in a row" {
  callout "18 weeks, January to May 1964" pick=max offset=60,20
  rule y=1 "One week"
}
```

## Most runs are one week; most missing weeks are not

Count runs and the picture is benign: 63.6% of runs are a single missing week, and the median run is 1 week. Count weeks and it flips. The four runs of four weeks or more hold 59.3% of all missing weeks, so the typical blank in the record belongs to an outage, not a skipped reading.

```eda
hist @nb-co2-missing-runs-chart-2 length bins=18 title="Runs by length" x.title="Missing weeks in a row" y.title="Runs" {
  rule x=4 "Four weeks or more"
}
```

## The air did not move while nobody was watching

Each point compares the last reading before a gap with the first after it. The points hug the diagonal: across the 22 gaps, the reading after averaged -0.04 ppm different from the reading before, and the largest jump in either direction was 2.2 ppm. Even the four-month gap closed with CO₂ 2.2 ppm higher, which is one spring's seasonal climb.

```eda
scatter @nb-co2-missing-runs-chart-3 x=before y=after title="CO₂ before and after each gap" x.title="CO₂ before the gap (ppm)" y.title="CO₂ after the gap (ppm)" {
  callout "The 1964 outage" on=gaps.id:co2-gaps-00014 offset=-40,-40
}
```

## Takeaway

Missing weeks are a 1960s problem and mostly a 1964 problem: 59 blanks in 2,284 weekly slots, with the four longest outages holding three in five of them. Readings on either side of every gap sit within a seasonal step of each other, so the holes hide no surprises, only the exact shape of a few springs.

## Limits

A run is consecutive blank rows in this series, not a documented instrument failure. The values before and after a gap bound it but do not fill it; a 1964 spring peak is simply not in the record.
