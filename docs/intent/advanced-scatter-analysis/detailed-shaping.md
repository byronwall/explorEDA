# Scatter features — detailed shaping

The goal is to understand relationships through curves, objective measures, and inspectable distributions.

This tree shows product scope. **Add** means intended native package work. **Evaluate** means required lab comparison before deciding on native support. **Later** means a possible extension. Existing rectangular density and bubble sizing are context, not new features.

## Full feature tree

```text
Advanced scatter analysis
├── ADD: Regression
│   ├── Choose one method at a time
│   │   ├── Linear
│   │   │   ├── Fitted line
│   │   │   ├── Equation
│   │   │   ├── Slope and offset
│   │   │   └── R²
│   │   ├── N-order polynomial
│   │   │   ├── Choose degree
│   │   │   ├── Fitted curve
│   │   │   └── Equation, coefficients, and meaningful fit-quality measures
│   │   └── LOESS
│   │       ├── Choose smoothing amount
│   │       ├── Fitted curve
│   │       └── Method details and appropriate fit-quality measures
│   ├── Separate fits
│   │   ├── One fit per color group
│   │   ├── New fits within each facet
│   │   ├── Distinct coefficients and results for each group/facet
│   │   └── Optional overall fit within a facet; off by default
│   ├── Shared controls
│   │   ├── Same method and parameters across one definition's facets
│   │   └── Independent controls for separate chart definitions
│   ├── Fitting population
│   │   ├── Other charts' filters change the fit
│   │   ├── Own brushing changes selection but preserves the fit
│   │   ├── Group and facet membership limit each fit
│   │   └── Exclude missing or invalid X/Y pairs; show exclusions
│   ├── Read the results
│   │   ├── Prioritize the curve and equation on the chart
│   │   ├── Identify the group, facet, fields, and fitting population
│   │   ├── Compact inspection for results that do not fit on the chart
│   │   └── Keep each facet's detailed results available
│   └── Unavailable results
│       ├── Warning icon with explanation on hover and keyboard focus
│       ├── Explain insufficient data and unsuitable inputs
│       └── Do not silently change the selected method
├── ADD: Paired summaries
│   ├── Valid pair count and excluded pair count
│   ├── X/Y means and standard deviations
│   ├── Sample covariance matrix
│   ├── Pearson correlation
│   ├── Pooled and categorical-group results
│   └── Field names, units, and analysis population
├── ADD: Count displays and paired marginals
│   ├── Hexagonal count bins
│   │   ├── Adjustable bin size
│   │   ├── Count color and legend
│   │   ├── Optional point overlay
│   │   ├── Inspect a bin's count and exact contributing rows
│   │   └── If bin selection is offered, select exact contributors
│   ├── Compare with existing rectangular density cells
│   └── Marginal histograms
│       ├── X distribution and Y distribution
│       ├── Bin controls
│       └── Counts consistent with the stated scatter population
├── EVALUATE: Smoothed two-dimensional density
│   ├── Contour lines and filled density overlay
│   ├── Bandwidth and contour-level controls
│   ├── Optional source-point overlay
│   ├── Distinguish density colors from color-group colors
│   └── State coordinate space, normalization, and legend meaning
├── EVALUATE: Covariance geometry
│   ├── Principal covariance axes
│   │   ├── Principal directions
│   │   └── Variance along each direction
│   ├── Data ellipse
│   │   ├── Fitted distribution contour around the estimated center
│   │   ├── Coverage/level control with explicit meaning
│   │   └── Distinct from a confidence region for the mean
│   └── Confidence region for the mean
│       ├── Separate control and name
│       ├── Sample count, assumptions, and confidence level
│       └── Keep in the lab until its native use is accepted
├── EVALUATE: Mahalanobis inspection
│   ├── Point-level D and D² readouts
│   ├── Distance coloring or highlighting
│   ├── Nested distance contours
│   ├── Inspect the most distant source rows
│   └── State which rows define the reference and which receive scores
├── ADD: Shared behavior for promoted features
│   ├── Optional controls; each display can be disabled
│   ├── Save and restore chosen methods and settings
│   ├── Keep ordinary brushing and source inspection usable
│   ├── Keep group/facet identity visible in derived results
│   ├── Explain empty, categorical, and singular cases
│   ├── Preserve scientific meaning on nonlinear display axes
│   ├── Keep method help available without covering the data
│   └── Working scale: about 10,000 rows across ten groups
├── EXISTING LAB: Repeatable method comparison
│   ├── Compare experiment layers with ordinary scatter
│   ├── Seeded presets and Palmer Penguins
│   ├── Controls for fields, grouping, facets, and populations
│   ├── Reset and experiment settings export/restore
│   ├── Point, bin, and model-result inspection
│   └── Extend the comparison to the new regression methods
└── LATER: Possibilities without a native delivery commitment
    ├── Spearman rank correlation
    ├── Selected-versus-reference cohort comparison
    ├── Identity and engineering tolerance lines
    ├── Regression residual displays
    ├── Separate confidence bands and prediction bands
    ├── Reusable predicted-value or residual fields
    ├── Robust regression, covariance, and distance
    ├── Scatter matrix
    ├── Observation uncertainty marks
    ├── Ordered trajectories
    └── Prediction and tolerance regions
```

## What a user should be able to do

Choose linear regression for a scatter colored by category and split by region. Each category gets its own fit in each region. Inspect its equation, slope, offset, and R². Enable an overall fit if useful.

Brush points without changing those fits. Filter from another chart and see the fits update. Switch to polynomial or LOESS while retaining shared method controls across facets.

Enable summaries, hex counts, or marginals to inspect distributions beside the relationships. Find the exact observations behind an inspected bin. Compare experimental scientific overlays in the lab before choosing which belong in ordinary chart settings.

## Scope details still open

LOESS needs a suitable result presentation; the scope does not promise a single global equation or slope. Detailed facet information is required. Turning it into reusable calculated fields remains a later option.

The regression filter rule is settled. Reference policies for other model layers remain separate choices. Facet count and measured capacity are not yet fixed.

The current lab already covers many scientific comparisons. This tree does not claim those features are all available in the native package.

Related documents: [intent](intent-brief.md), [shape](shape-brief.md), and [implementation plan](implementation-plan.md).
