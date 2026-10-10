# References for edit chart features in place

[Direct user request](../../comparison-opportunities/resources/editorial-and-editing-request.md) is the authority for this initiative.
This is a new user request, not an additional Pro recommendation.
The [existing Pro resources](../../comparison-opportunities/resources/README.md) remain available as context.

## Current foundation

Source inspected at `a50df9985ed3ff54d0f6ca368c0b369829b8a927`. No runtime or browser acceptance is claimed.

- [packages/explorEDA/src/components/settings/LabelsSettingsTab.tsx](../../../../packages/explorEDA/src/components/settings/LabelsSettingsTab.tsx) — Existing title and axis-label settings inputs.
- [packages/explorEDA/src/components/ChartSettingsContent.tsx](../../../../packages/explorEDA/src/components/ChartSettingsContent.tsx) — Live updates, invalid-range handling, and edit-session reset.
- [packages/explorEDA/src/components/PlotChartPanel.tsx](../../../../packages/explorEDA/src/components/PlotChartPanel.tsx) — Title inside drag-handle; Alt title tracing; read-only handling.
- [packages/explorEDA/src/components/charts/AxisFieldActions.tsx](../../../../packages/explorEDA/src/components/charts/AxisFieldActions.tsx) — Modifier-click and context-menu field inspection.
- [packages/explorEDA/src/components/charts/Axis/AxisLayer.tsx](../../../../packages/explorEDA/src/components/charts/Axis/AxisLayer.tsx) — Axis label focus, pointer events, and trace actions.
- [packages/explorEDA/src/types/ChartTypes.ts](../../../../packages/explorEDA/src/types/ChartTypes.ts) — Axis min/max declarations and existing shared chart settings.
- [docs/ui-defaults.md](../../../../docs/ui-defaults.md) — Local nonmodal settings; live edits; read-only history; mark tracing and chart movement.

## Related intent

- [editorial-chart-styling](https://github.com/byronwall/explorEDA/blob/91b627d7307a4a14c7f123a713ce5f45662a3d22/docs/intent/editorial-chart-styling/intent-brief.md).
- [axis-domain-controls](../../axis-domain-controls/intent-brief.md).
- [current-analysis-trust](../../current-analysis-trust/intent-brief.md).

Mechanisms remain provisional. The intent map separates explicit outcomes from proposed gestures and API choices.

## Product feedback

[Annotated product direction](../../comparison-opportunities/resources/product-feedback-2026-10-06.md) supplies the current audience and priorities. The [full records](../../comparison-opportunities/resources/product-feedback-2026-10-06.json) preserve uncertainty.
