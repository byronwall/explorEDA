# Measles nearly vanished within a decade of the vaccine

**What happened to measles in the United States after 1963?** Each row is one state in one year, 1928 to 2012, with reported cases per 100,000 people.

```eda
eda query=measles
state:cat=measles.State label="State"
year:num=measles.Year label="Year"
rate:num=measles.Rate label="Cases per 100,000"
calc era = year < 1963 ? "Before the vaccine" : year < 1970 ? "1963–1969" : "1970 and after"
```

## Every state, every year

Each dot is one state-year. Before 1963, rates of several hundred per 100,000 were ordinary and swung up and down in two- to three-year epidemics. After the vaccine was licensed in 1963, the cloud collapses to the floor.

```eda
scatter @nb-measles-vaccine-1 x=year y=rate title="Measles cases per 100,000, by state and year" x.title="Year" y.title="Cases per 100,000" {
  rule x=1963 "Vaccine licensed"
}
```

**Finding.** From 1950 to 1962, the average state-year saw 322.7 cases per 100,000.

**Finding.** In the 1970s, it was 17.1.

## Before, during, and after

```eda
boxplot @nb-measles-vaccine-2 rate color=era title="State-year rates by era" y.title="Cases per 100,000"
```

## Takeaway

Within seven years of licensing, measles fell by about 95%. The decline was not gradual improvement; the scatter shows a cliff.

## Limits

Reporting was incomplete before 1950 and changed in 2003, when the CDC began counting confirmed cases yearly instead of provisional cases weekly. Years a state did not report stay blank.
