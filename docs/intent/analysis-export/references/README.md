# Export references

[Product-feedback annotation 4](../../comparison-opportunities/resources/product-feedback-2026-10-06.json) requests image export and a separate intent. Slides and PDF reports remain possible later outputs.

## Current foundation

- [Chart panel](../../../../packages/explorEDA/src/components/PlotChartPanel.tsx): current actions; no common image-export route.
- [Scatter rendering](../../../../packages/explorEDA/src/components/charts/ScatterPlot/ScatterPlot.tsx): Canvas points, SVG guides, and special layers.
- [Saved state](../../../../packages/explorEDA/src/types/SavedDataStructure.ts): JSON settings and full-analysis exports remain separate from static images.
- [Current styles](../../../../packages/explorEDA/src/index.css): chart presentation that an authored export should reflect.

Source inspected at `a50df9985ed3ff54d0f6ca368c0b369829b8a927`. No fresh export or browser proof is claimed.

## Related intent

- [Editorial styling](../../editorial-chart-styling/intent-brief.md): global style links, explicit overrides, and editorial live layout.
- [Renderer-independent replay](../../renderer-independent-replay/intent-brief.md): a future semantic reproduction contract; not a prerequisite for an image.
- [Data-bound narrative](../../data-bound-narrative/intent-brief.md): a possible later report-content source; not required for user-authored captions.

Named visual references are newspapers and annual or investor-relations reports. Specific layouts and font choices require a later visual study.
