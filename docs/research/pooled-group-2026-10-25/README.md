# Build explicit pooled and grouped comparisons

Add **Compare groups** to Scatter Plot with an authored grouping field independent of color.
Show pooled/group/common-within slopes and correlations, then explain within/between covariance contributions.
Keep original observations, exact records, visible filter scope, and save/reopen in the same feature milestones.

Topic score: **18/20**. Mode: Methods.
[Pro conversation](https://chatgpt.com/c/6ade044e-2690-83e9-ad5a-cade5efde4b1), completed after 22m44s; no follow-up.
[Implementation plan](../../intent/pooled-group-relationships/implementation-plan.md) · [Local dispositions](decisions.md) · [Run](run.md).
This is a reviewed proposal, not an implemented feature or approval to ship.

## Findings

One pair-valid population and disjoint typed groups give exact centered identities `T=W+B`.
Common-within slope weights group slopes by within-X variation.
The between relationship weights group means by valid-pair counts.
Correlations cannot be averaged to obtain pooled correlation.
All covariance contributions use N−1; residual within covariance with N−K is a different quantity.

The five-row example has positive group slopes but pooled slope `-31/29`.
Its sample covariance is `-6.2 = 1 + (-7.2)`.
The nine-row example separates common-within slope `5/3`, weighted-means slope `1/25`, and equal-means slope `1/4`.
Direction differences describe associations. They do not identify causes or the correct intervention.

## Local review

Current main remains `95832bd4`. Existing fits and paired summaries already provide pooled/color-group statistics.
`useScatterData.ts` gets the self-excluded chart population through live Crossfilter groups, including chart population restrictions.
Comparison needs its own G column and activation. Rectangular density has a separate renderer.
Explicit empty facets need an empty intersection; current `scatterPlan.ts` checks facet array length.
Trace owner/revision routing must preserve the clicked facet.

The proposed typed-category filter solves a real boundary: raw NaN/Infinity categories cannot use finite JSON value filters.
Shared matcher, legend, chips, manual editors, Rows/workspace, save, and text paths must support it together.
Local correction: current value filters containing null also match blank/whitespace strings.
Do not silently promote them to exact missing-category keys. Preserve their visible intersection until explicitly cleared.
Also preserve same-field range/text filters; the current legend toggle removes every filter on that field.

Treat Pro's numerical direction bound as a prototype requirement, not a verified error guarantee.
Check cancellation/scale fixtures before adopting it. Avoid a general numerical framework or an unmeasured cache.
Register browser tests explicitly; the current Playwright projects do not discover arbitrary new suite names.

## Evidence and limits

Both complete reports were downloaded, safely extracted, and read. Originals remain ignored under tmp/.
Checked decisive source seams for populations, category matching, fitting activation, trace ownership, save validation, DSL, and browser discovery.
A locally authored rational normal-equation solver independently confirms five-row and nine-row coefficients, reorder, offsets, and external removal.
No downloaded code ran. Pro's reported NumPy probe does not measure explorEDA.
Preparation passed 45 targeted tests and 73 docs tests. Further collection checks are in the run record.
Application behavior, mounted comparison, browser, persistence, and performance acceptance remain future implementation work.

## Sources and open work

[Stata's methods](https://www.stata.com/manuals/xtxtreg.pdf) distinguish demeaned fitting and regression on group means.
[R's lm documentation](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/lm.html) defines weighted least squares and warns about mean-data inference.
[SciPy's Pearson reference](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.pearsonr.html) confirms constant-input unavailability and two-pair endpoints.
[Total covariance](https://arxiv.org/abs/2205.14525) provides the general identity.
[Pearl's primary discussion](https://ftp.cs.ucla.edu/pub/stat_ser/r414-reprint.pdf) separates sign reversals from causal interpretation.
These decisive sources were spot-checked locally; not every report citation was reverified.

No mathematical or demand choice blocks milestone one.
Implementation must validate numerical error accounting, complete the typed-filter lifecycle, and measure actual product costs.
Mean-point overlays remain Explore. Equal-weight means, arbitrary observation weights, rank methods, and inference remain separate.

## Preserved Pro result materials

[Complete original Pro artifacts](../../intent/pooled-group-relationships/assets/pro-results/pooled-group-2026-10-25/ASSET_INDEX.md) are preserved under the intent entry. ZIP containers remain local.
