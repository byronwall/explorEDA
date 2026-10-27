# Build checked quantities over scalar calculations

Add explicit Quantity mode, source declarations, conversion fields, and unit-aware traces. Keep row values numeric. A small owned resolver compiles compatible operations over the existing AST. This is a plan for review; no feature code changed.

Topic score: **18/20** — Capability 5, Pro advantage 5, Buildable 4, Momentum 4. See the [run record](run.md) and [Pro conversation](https://chatgpt.com/c/6ae00040-195c-83ea-b113-b68ef0db9cd1).

The [implementation plan](../../intent/quantity-calculations/implementation-plan.md) has four usable stages: standalone linear quantities, temperatures/statistics, project queries/folders, then notebooks and portable exports. Every stage includes docs and a runnable example. Neither numeric nor temporal preparation research is an implemented prerequisite.

## Why this design

Declarations describe existing numbers. Conversions create new fields. Scalar formulas stay available; checked formulas reject incompatible intermediate operations. Unknown units differ from explicit dimensionless values. Temperature readings differ from intervals. Saved output contracts keep dependent thresholds in known coordinates.

Field formatting, row calculations, query calculations, private chart reducers, and notebook writeback have distinct paths. The plan includes them explicitly. Pivot already suppresses measure suffixes on counts; preserve that behavior while adding squared-unit and temperature-role outputs.

Unit checks cannot establish the correct population, statistic, or scientific reference. Both mean trip speed `20 m/s` and pooled speed `25 m/s` can have valid units. Optional author meaning keys catch declared conflicts without claiming scientific validity.

## Review and limits

[QC01–QC23 dispositions](decisions.md) retain the scalar compiler design and defer broad catalogues, thermodynamic equations, and performance machinery. [Local evidence](evidence.md) records source checks, arithmetic, and primary-source verification. Original reports and archives remain under ignored tmp.

The earlier October 20 study asked whether to add the capability under old demand gates. This run designs it under current DIRECTION: Byron is the demand. No outside study or failed lesson is a prerequisite.

[NIST](https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b9) supports distinct reading/interval conversions. [Pint](https://pint.readthedocs.io/en/0.26.2/user/nonmult.html) provides a useful role comparison. [math.js](https://mathjs.org/docs/datatypes/units.html) documents browser-compatible units and affine cautions. These sources support the comparison; the chosen Kelvin restriction and immutable output contracts are product policy.

No blocking product question remains for M1. Implementation must verify all reducer wrappers and measure bundle/interaction costs. Feature, browser, persistence, and performance acceptance remain unrun.
