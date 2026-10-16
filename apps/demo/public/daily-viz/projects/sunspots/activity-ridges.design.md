# Annual sunspot activity has different distributions across eras

**Question.** How has the spread of yearly sunspot activity shifted across three centuries?

- **Encoding.** One native kernel-density trace summarizes annual sunspot numbers in each broad historical span.
- **Ordering.** Half-century labels in ascending order; the final span is incomplete.
- **Baseline.** The horizontal scale includes zero; ridge height is a shared density peak, not an observation count.
- **Scale.** A shared activity domain allows horizontal comparison. Density peaks may rescale with active filters in this baseline.

## What this design gives up

Smoothing hides individual years and depends on bandwidth. Unequal era counts remain in the source notebook.

The historical series is preserved as and is not the current revised international sunspot-number series. Annual averages obscure monthly peaks; this is not a forecast of the next cycle.
