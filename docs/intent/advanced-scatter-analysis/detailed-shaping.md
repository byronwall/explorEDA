# Scatter — what we are adding

**Outcome:** Understand relationships through fitted curves, objective measures, and inspectable distributions.

**Primary flow:** Choose a method → compare groups and facets → inspect results → filter from another chart.

## Feature scope

```text
Scatter analysis
├── ADD TO THE PACKAGE
│   ├── Regression — one selected method per chart definition
│   │   ├── Linear: line, equation, slope, offset, R²
│   │   ├── Polynomial: degree control, curve, equation, coefficients
│   │   ├── LOESS: smoothing control, curve, method-appropriate results
│   │   ├── Separate fits: each color group within each facet
│   │   ├── Optional overall fit: within each facet; off by default
│   │   └── Results: equation on chart; compact group/facet inspection
│   ├── Paired summaries — with field names, units, and population
│   │   ├── Valid and excluded pair counts
│   │   ├── X/Y means and standard deviations
│   │   ├── Sample covariance matrix and Pearson correlation
│   │   └── Pooled and categorical-group summaries
│   ├── Hexagonal counts — compare with existing rectangular cells
│   │   ├── Bin size, count colors, legend, optional point overlay
│   │   ├── Inspect counts and exact contributing source rows
│   │   └── Optional bin selection must select exact contributors
│   ├── Smoothed 2D density
│   │   ├── Contour lines and filled density regions
│   │   ├── Bandwidth and contour-level controls
│   │   ├── Point overlay; distinguish group colors from density colors
│   │   └── Coordinate space, normalization, and legend units
│   ├── Paired marginals — X and Y histograms
│   │   └── Bin controls and counts matching the stated population
│   └── Shared experience
│       ├── Optional displays; save and restore their settings
│       ├── Source inspection, visible group/facet identity, method help
│       ├── Keep chart visible during settings and result inspection
│       └── Explain unavailable results; preserve normal gestures
├── OTHER SCIENTIFIC PROPOSALS — NATIVE SCOPE STILL OPEN
│   ├── Principal covariance axes: directions and variance along each
│   ├── Data ellipse: fitted distribution contour and coverage control
│   ├── Mean confidence region: separate mode, level, assumptions, count
│   └── Mahalanobis distance
│       ├── Point-level D and D²; coloring or highlighting
│       ├── Nested distance contours; most-distant-row inspection
│       └── Visible reference population and scored population
└── LATER POSSIBILITIES — NOT COMMITTED NATIVE FEATURES
    ├── Spearman correlation; selected-versus-reference cohorts
    ├── Identity and engineering tolerance lines
    ├── Residual displays; confidence bands; separate prediction bands
    ├── Reusable predicted-value/residual fields
    ├── Robust regression, covariance, and distance
    ├── Scatter matrix; observation uncertainty marks; ordered trajectories
    └── Prediction and tolerance regions
```

## Behavior that defines the feature

| Situation | Expected result |
| --- | --- |
| Brush this scatter | Selection changes; regression does not refit. |
| Filter from another chart | Regression recomputes from the eligible rows. |
| Split by group and facet | Each group/facet gets its own fit and results. |
| Change method parameters | All facets of this definition share them; other definitions stay independent. |
| Inspect many fits | Prioritize curves and equations; make remaining results available in compact inspection. |
| Fit unavailable | Warning icon explains why on hover and keyboard focus; no silent method substitution. |
| Missing, categorical, or singular inputs | Explain exclusions or unavailable methods; do not invent numeric results. |
| Adjust density | Contours and filled regions respond to bandwidth and level settings; the legend states their meaning. |
| Change display scale | Keep scientific meaning and stated coordinate space consistent. |

## Boundaries and open choices

**Working scale:** About 10,000 rows across ten groups. Facet count and measured capacity remain open.

**Result meaning:** R² and other fit measures must match the selected method. LOESS does not promise one global equation or slope. Data ellipses, mean regions, prediction regions, and tolerance regions remain distinct.

**Population:** Counts, exclusions, and reference scope must be visible. The settled regression brush rule does not automatically set every other model's policy. Statistics retain eligible rows even if drawing uses a labeled rendering cap.

**Existing context:** Rectangular density cells and field-driven bubble sizes already exist. This tree adds no separate composition editor or general chart framework.

**Delivery:** Regression, summaries, hexagonal counts, marginals, and smoothed 2D density are planned package additions. Other scientific layers retain separate scope decisions. The tree describes scope, not current availability.

[Intent](intent-brief.md) · [Shape rationale](shape-brief.md) · [Implementation plan](implementation-plan.md)
