---
title: "Scatter plot matrix with diagonal distributions — shape brief"
slug: "scatter-plot-matrix"
phase: shape
status: draft
last_updated: "2026-10-06"
---

# Scatter plot matrix — what we are adding

**Outcome:** A user opens one ggpairs-style view on unfamiliar data with any mix of numeric, categorical, boolean, and date fields. Every pair gets a sensible cell for its types, every field shows its distribution on the diagonal, and a brush anywhere lights up that subset everywhere.

**Primary flow:** Add a Scatter Matrix → pick 5–10 fields and optionally a group color → scan distributions, pairs, and summaries → brush a cell → read the subset in every cell → Alt-click a point to trace it.

## Feature scope

```text
Scatter Matrix (new view type, beside Scatter Plot and Parallel Coordinates)
├── PLANNED ADDITIONS
│   ├── Fields: one ordered list of any type, capped at 10, chosen with FieldMetadata
│   │   └── Numeric and date fields get continuous axes; categorical and boolean get bands
│   ├── Cell content, chosen per region (lower, upper) and per pair type
│   │   ├── Numeric × numeric: scatter (lower default), correlation (upper default), blank
│   │   ├── Numeric × categorical: box plot (upper default), jittered points (lower default), blank
│   │   ├── Categorical × categorical: count tiles (upper default), stacked bars (lower default), jittered points
│   │   └── Jitter width option, 0 to a full band, for any jittered cell
│   ├── Diagonal, chosen per field type
│   │   ├── Numeric or date: density (default), histogram, or name only
│   │   └── Categorical: bar counts (default) or name only
│   ├── Correlation cell: Pearson r and n, plus one line per group when colored
│   ├── Group color (optional categorical field): points, densities, bars, and correlation lines
│   ├── Shared frame: field strips top and right, ticks left and bottom, one domain per field
│   ├── Selection
│   │   ├── Brush any off-diagonal cell → filters on its two fields (range or categories)
│   │   ├── Click a box, tile, or bar segment → selects its categories
│   │   ├── Brush or click a diagonal → one-field filter
│   │   └── A new brush replaces the old one; empty click clears; context dims everywhere
│   ├── Usable count n shown only where missing values reduce it
│   └── Trace: Alt-click a point → its row is ringed in every point cell
├── EVALUATE BEFORE COMMITTING
│   ├── Contour as a numeric × numeric option
│   ├── Binned point cells above a row threshold, if 100k rows redraw too slowly
│   └── Open a pair as a full chart
└── LATER POSSIBILITIES
    ├── Violin and faceted-histogram mixed cells; group-dodged box plots
    ├── Significance stars, Spearman, association measures for categorical pairs
    └── Lasso, several brushes, drag reordering inside the matrix
```

## Behavior

| Situation | Expected result |
| --- | --- |
| Any off-diagonal cell | Its x is the column field's axis and its y the row field's axis, whatever it draws. So one brush rule works everywhere: ranges on continuous axes, spanned categories on bands. |
| Box plot with a brush | Gray boxes summarize every row; a narrower colored box summarizes the selection in each category. |
| Count tile or stacked bar with a brush | Area shows all rows; the filled share shows the selection. |
| A field has more than 12 categories | The 11 most common appear plus Other; selecting Other selects the remaining values. |
| A row lacks one field | It still appears in every cell that does not need that field; reduced n is shown. |
| The matrix's own brush changes | Domains, bands, and correlations hold still; only highlighting changes. |
| Another chart filters rows | Those rows leave; summaries recompute. |
| Card narrower than the minimum cell size | The matrix scrolls within its card. |

## Decisions and boundaries

**Appetite:** One new view type covering every field type with a small set of intentional cell kinds, one group color, one brush, and trace. Not a general plot-any-pair framework.

**Key decision:** Every cell shares its fields' axes, and cell kinds only change what is drawn. This keeps brushing, dimming, domains, and trace identical across scatter, box, tile, and bar cells, and lets new cell kinds arrive later without new selection rules. It reuses the scatter view's band axes, deterministic jitter, and band-aware brush filters.

**Key decision:** Build one view (fields, cell kinds per region and pair type, group color, filters), like Parallel Coordinates, rather than a grid of chart cards. Saved layouts, linked filters, trace, and dimming come from existing paths; the Scatter Plot stays unchanged.

**Key decision:** One canvas for point cells, positions computed once per field, cached gray context. Benchmark the worst case: both triangles as points at 10 × 100k, plus mixed fields whose selected box statistics recompute on every brush.

**Key decision:** Dates are continuous in the matrix, not bands as in today's scatter view. A date column with thousands of values is unreadable as bands.

**Boundary:** Regression, marginals, bubbles, and facets stay out of cells. Pairwise-valid rows per cell; no complete-case mode. Correlation ignores the matrix's own brush. Box plots ignore group color in the first release.

**First proof:** **Try:** Penguins with bill length, body mass, species, and sex: scatter, jittered points, box plots, count tiles, and stacked bars, with histogram and bar diagonals. Brush a scatter cell, then click a box. Then time 10k/100k rows at 3, 5, and 10 fields, both all-numeric and half categorical. **Observe:** Each gesture creates the expected two filters; every cell kind dims consistently; r matches the paired summary; n drops where values are missing. **Decide:** Aim for 100 ms at 5 × 100k and stay under 500 ms at 10 × 100k; otherwise filter on brush release or evaluate binned cells. If a cell kind's dimming reads poorly, fix that kind before adding more.

See the [intent brief](intent-brief.md) and the [implementation plan](implementation-plan.md).
