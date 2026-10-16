# Clock-hour error cells need their coverage context

**Question.** Which hours of the day does the forecast miss most, month by month?

- **Encoding.** Each cell encodes the mean absolute miss for one month and UTC clock hour.
- **Ordering.** Months and padded clock labels follow calendar order.
- **Baseline.** Absolute error starts at zero; an empty cell is not zero.
- **Scale.** One shared linear color ramp; native value ramps may rescale under filtering.

## What this design gives up

Cell means hide individual hours. The accompanying clock notebook exposes hours per cell.

These are means over available dates for a UTC clock hour. Partial boundary months have fewer observations, and the clock is not local Texas time. A mean of these cells is not automatically an hour-weighted monthly mean.
