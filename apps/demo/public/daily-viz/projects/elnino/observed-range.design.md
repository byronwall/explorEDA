# Each year's warmest and coolest months, 1950 to 2010

**Question.** How wide is the gap between a year's warmest and coolest month?

- **Encoding.** A min–max band surrounds an annual mean path. The band uses measured monthly extremes.
- **Ordering.** Calendar-year order, with no smooth curves or forecast extension.
- **Baseline.** No artificial zero baseline for a position-encoded Celsius series.
- **Scale.** One shared linear temperature scale spans the mean and both bounds.

## What this design gives up

The month that produced an extreme is lost. The band is not sampling uncertainty, a prediction interval, or a native forecast.

The lower and upper bounds are observed monthly minima and maxima, not confidence intervals. Annual summaries give months equal weight and erase timing within the year.
