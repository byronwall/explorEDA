# References for durable editorial chart styling

[Direct user request](../../comparison-opportunities/resources/editorial-and-editing-request.md) is the authority for this initiative.
This is a new user request, not an additional Pro recommendation.
The [existing Pro resources](../../comparison-opportunities/resources/README.md) remain available as context.

## Current foundation

Source inspected at `a50df9985ed3ff54d0f6ca368c0b369829b8a927`. No runtime or browser acceptance is claimed.

- [packages/explorEDA/src/index.css](../../../../packages/explorEDA/src/index.css) — :root/.dark tokens; .eda-panel-expanded header typography.
- [packages/explorEDA/src/types/ChartTypes.ts](../../../../packages/explorEDA/src/types/ChartTypes.ts) — BaseChartSettings title and axis labels; AxisSettings text sizes.
- [packages/explorEDA/src/types/SavedDataStructure.ts](../../../../packages/explorEDA/src/types/SavedDataStructure.ts) — Saved chart settings and color scales; no common editorial style definition.
- [packages/explorEDA/src/components/PlotChartPanel.tsx](../../../../packages/explorEDA/src/components/PlotChartPanel.tsx) — TraceTitle and compact header title classes.
- [packages/explorEDA/src/components/settings/AxisSettingsTab.tsx](../../../../packages/explorEDA/src/components/settings/AxisSettingsTab.tsx) — Small tick and axis-label text choices.
- [packages/explorEDA/src/components/charts/Axis/axisPlan.ts](../../../../packages/explorEDA/src/components/charts/Axis/axisPlan.ts) — Font sizes, label truncation, and spacing calculations.

## Related intent

- [in-place-chart-editing](../../in-place-chart-editing/intent-brief.md).
- [saved-view-templates](../../saved-view-templates/intent-brief.md).
- [composed-analytical-graphics](../../composed-analytical-graphics/intent-brief.md).

Mechanisms remain provisional. The intent map separates explicit outcomes from proposed gestures and API choices.

## Product feedback

[Annotated product direction](../../comparison-opportunities/resources/product-feedback-2026-10-06.md) supplies the current audience and priorities. The [full records](../../comparison-opportunities/resources/product-feedback-2026-10-06.json) preserve uncertainty.
