# CO₂ rose about 40 ppm between the 1960s and the 1990s

**Question.** How fast did annual mean CO₂ climb at Mauna Loa?

- **Encoding.** A thin path and dots show each year's mean of its measured weeks. A band behind them spans the lowest to the highest measured week, so the seasonal swing of about 6.5 ppm stays in view.
- **Ordering.** Chronological years; no endpoint extension.
- **Baseline.** The concentration axis is not forced to zero because position, not bar length, encodes value.
- **Scale.** One linear concentration scale; partial endpoint years remain included and documented.

## What this design gives up

The band shows how wide each year's swing was, but not when in the year the peak and trough fell. Week-level gaps disappear; the related notebooks keep them.

This is the historical flask-data revision distributed with statsmodels, not the latest NOAA series. Missing weeks stay null. Weekly observations at one station are not global spatial measurements.
