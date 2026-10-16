# Clock-hour error cells need their coverage context — design and analytical contract

**Question.** Do recurring UTC hours have similar signed and absolute errors within each supplied month?

**Encoding.** Each cell encodes the mean absolute miss for one supplied month and UTC clock hour.
**Ordering.** Months and padded clock labels follow calendar order.
**Baseline.** Absolute error starts at zero; an empty cell is not zero.
**Scale.** One shared linear color ramp; native value ramps may rescale under filtering.

## Fixed-snapshot findings

The best-supported month-hour cell contains 31 supplied hours. Eligible rows: 53; full expression, denominator, and contributing IDs are in the

The least-supported month-hour cell contains 1 supplied hour. Eligible rows: 53; full expression, denominator, and contributing IDs are in the

## What this design gives up

Cell means hide individual hours. The accompanying clock notebook exposes hours per cell.

These are means over available dates for a UTC clock hour. Partial boundary months have fewer observations, and the clock is not local Texas time. A mean of these cells is not automatically an hour-weighted monthly mean.

## Interactions and tracing

In viewing mode, selecting a repeated unit is intended to filter that repeat across a workspace. Alt-click traces contributing marks. These behaviors come from the inspected baseline contract; this artifact has not been browser-tested. Static findings above describe the unfiltered snapshot.

## Credit

EIA / ERCOT; authorized repository snapshot; U.S. public-domain data.
Full provenance and transformations: [dataset record](../../datasets.json), [fields](fields.json).
