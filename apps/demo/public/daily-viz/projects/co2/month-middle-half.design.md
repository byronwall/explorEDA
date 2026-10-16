# CO₂ peaks in May and bottoms out in September

**Question.** How far above or below its own year does each month sit?

- **Encoding.** Native unweighted quartiles form a band and medians are connected across ordered months.
- **Ordering.** Padded month labels preserve January-to-December order.
- **Baseline.** Zero is each underlying year’s measured-week mean, not a universal absolute concentration.
- **Scale.** Shared linear residual scale; the summary is recomputed from eligible live rows.

## What this design gives up

This representation hides the absolute concentration trend and each individual week. Means quoted in the companion are distinct from the drawn medians.

Centering by an available-week annual mean does not remove every within-year trend. Incomplete years and uneven missingness can shift the reference. Residuals are not a fitted seasonal model.
