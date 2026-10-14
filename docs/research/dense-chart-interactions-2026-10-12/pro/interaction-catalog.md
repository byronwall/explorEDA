# Interaction catalog: dense chart configuration

Research date: 2026-10-12. Baseline: `c534378c052c9fbb2cb076d1df0d21eb0fa0965e`. **These are patterns to keep, test or defer—not accepted implementation requirements.** Pointer gestures are shortcuts to visible, keyboard-completable actions. Every pattern maps to a recommendation in [recommendations.json](recommendations.json), with scope, costs and proof. The detailed setting applicability is in [settings-inventory.csv](settings-inventory.csv).

## Worked case: right-click a scatter point → Color by

The point supplies a useful place to start, not permission to paint one record. Resolve the current chart and optional logical point from the renderer plan; do not rely on a Canvas point being a DOM element. Opening the menu changes no filters, settings, trace selection or row count. The menu could read:

```text
Scatter · Conversion against response time

THIS CHART — ALL POINTS, ALL FACETS
Color by… (all points)             Release phase

THIS RECORD — Day 31
Trace record…

Copy image
Download image
```

This is illustrative copy, not a new generic command registry. Size and other commands are outside the first proof. With overlapping points, the chart section stays usable; the record section instead offers a named candidate chooser only when trace is requested. Empty plot has only chart actions. A stale target after filtering or source replacement must be revalidated by logical identity; never silently trace whatever moved into the old pixels. Anchors: [ScatterSvg](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/ScatterPlot/ScatterSvg.tsx#L408-L423), [ScatterPoints](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/ScatterPlot/ScatterPlot.tsx), [onPanelContextMenu](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/PlotChartPanel.tsx#L605-L620).

Choosing Color by closes the menu and opens **the field search itself**, not a second closed combobox. Its heading says `Chart color · all facets`, shows the current binding and includes None. The label remains visible after the menu is gone. The small presentation seam needed in [ComboBox](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/ComboBox.tsx) should also serve [FieldSelector](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/FieldSelector.tsx#L18-L33); do not fork field rendering or color-setting logic. A field selection calls the existing scale resolution and `updateChart` under one notification hold. Searching, hovering and arrow navigation do not write. Accepting one field commits once and closes the picker. Escape before acceptance leaves both chart and shared scales untouched. Anchors: [getOrCreateScaleForField](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/hooks/useColorScales.ts#L141-L156), [holdStateChanges](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/providers/DataLayerProvider.tsx#L325-L340), [useChartEdit](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/InPlace/useChartEdit.ts#L12-L27).

### Necessary variants, not optional polish

- **No legend or no color field:** the header Color: None control and empty-plot menu provide entry. Accepting color reveals the ordinary inline legend where that chart supports one; do not add a standalone legend chart or alter layout.
- **Categorical versus numerical:** use the existing field/scale policy and explain whether colors represent categories or a numeric ramp. Do not silently reinterpret numeric IDs as categories. The categorical legend keeps click-to-filter; a numeric ramp is not a category toggle.
- **Computed fields:** include existing calculated fields with their origin badge and stable ID. Validate eligibility for the chosen encoding, rather than assuming every calculation is numeric. Formula creation/editing remains outside this picker.
- **Nulls and empty data:** preserve existing missing-value rendering and row membership. Show available field metadata and an honest empty/no-compatible-fields state. Choosing color must not filter out nulls or turn the literal word `null` into a field value.
- **Long names and duplicate aliases:** search display names and underlying identifiers; show a secondary identifier when labels collide. Keep a full accessible name and expandable details; a truncated visual label alone is insufficient.
- **Hundreds of fields:** focus search, bound the list, retain the chosen field and use existing metadata. The current ComboBox maps all options and searches display strings. A 500-field test must establish cost; bounded scrolling is not virtualization. Do not add a dependency without a measured need.
- **Existing filters:** changing color leaves the saved filter set unchanged, including a filter previously set through the old color legend. The filter bar must still identify it; offer an explicit clear action separately, not an invisible cleanup.
- **Shared colors:** binding this chart to a field may reuse a shared scale, but does not edit that scale’s palette. Palette/category changes use a separate entry that names the shared owner and affected charts. Do not promise chart-local colors before testing a deliberate scale fork.

Repository basis: [FieldSelector](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/FieldSelector.tsx#L18-L33), [FieldMetadata](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/FieldMetadata.tsx#L107-L122), [ComboBox](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/ComboBox.tsx), [ChartColorLegend](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/ColorLegend/ChartColorLegend.tsx#L30-L45), [ColorScaleControl](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/colorScales/ColorScaleControl.tsx#L31-L46). The transaction and menu sequencing are original proposals; [Tableau](https://help.tableau.com/current/pro/desktop/en-us/viewparts_marks_markproperties_color.htm) supports the encoding/legend connection, not proof that this particular explorEDA flow is usable.

### Four strong alternatives and honest input counts

| Route | Activations after locating the chart | Main tradeoff |
|---|---|---|
| Context menu → Color by → field | 3, plus search typing | Locality and scope; not inherently fewer than the existing Data route. |
| Visible Color trigger → field | 2, plus search typing | Strongest simpler comparator; some persistent chrome. |
| Alt/Option-click → field | 2, plus modifier press and search typing | Expert shortcut, hidden and potentially OS-reserved. |
| Existing settings → Color selector → field | 3 when Data is already shown | Minimal code; extra tab navigation only when actually needed. |
| Field-first selection → explicit Color target | Select field, choose target, accept; depends on implementation | Good for field-led exploration, but a target shelf/drop mode costs space. |

These are proposed logical action counts, not observed task times. A closed FieldSelector embedded in another popover adds a step and does not meet the three-activation menu sequence. The strongest local proof compares the visible-selector-only variant against the menu variant, then separately tests Alt. Keeping Alt for tracing remains a legitimate losing-or-winning alternative; it is not a constraint. Trace moves to menu plus existing header browser only if the replacement proves reachable. Alt-click opening the *object menu* instead of Color is another experimental variant: more general, but loses the direct shortcut’s one-step benefit.

## Pattern catalog

Each sequence is concrete, but the classification controls whether it belongs in the first proof. “Keep” means preserve or reuse baseline capabilities; “Explore” does not assert an existing local control. An external link denotes a documented precedent, not a hands-on result or an endorsement of all its semantics.

### P01 — Semantic Color by menu [Explore]

**Target and sequence:** Scatter point or bubble. Right-click → Color by… (all points) → search → accept field. The menu closes before the picker opens.

**Scope:** Chart encoding; all facets, not that record. **Benefit:** Moves the task to the object without changing selected rows.

**Cost/conflict:** Nearest-point identity must not imply one-point paint. **Discoverable fallback:** Visible Color trigger; chart settings Data → Color.

**Decision:** DCI-03. **Repository:** [packages/explorEDA/src/components/charts/ScatterPlot/ScatterSvg.tsx · ScatterSvg](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/ScatterPlot/ScatterSvg.tsx#L408-L423); [packages/explorEDA/src/components/charts/ScatterPlot/ScatterPlot.tsx · ScatterPoints](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/ScatterPlot/ScatterPlot.tsx); [packages/explorEDA/src/components/FieldSelector.tsx · FieldSelector](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/FieldSelector.tsx#L18-L33); [packages/explorEDA/src/components/ComboBox.tsx · ComboBox](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/ComboBox.tsx); [packages/explorEDA/src/hooks/useColorScales.ts · getOrCreateScaleForField](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/hooks/useColorScales.ts#L141-L156). **Precedent:** [Tableau](https://help.tableau.com/current/pro/desktop/en-us/viewparts_marks_markproperties_color.htm)

### P02 — Visible encoding control with an empty state [Explore]

**Target and sequence:** Chart header or encoding line. Activate Color: None or Color: Region → open the same field search → choose a field.

**Scope:** Chart binding. **Benefit:** Works before a legend exists and exposes the vocabulary.

**Cost/conflict:** Persistent chips can consume data space; test one control before a shelf. **Discoverable fallback:** Full Data settings, already reachable with S.

**Decision:** DCI-03. **Repository:** [packages/explorEDA/src/components/PlotChartPanel.tsx · onPanelContextMenu](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/PlotChartPanel.tsx#L605-L620); [packages/explorEDA/src/components/FieldSelector.tsx · FieldSelector](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/FieldSelector.tsx#L18-L33); [packages/explorEDA/src/components/ComboBox.tsx · ComboBox](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/ComboBox.tsx). **Precedent:** [JMP](https://www.jmp.com/support/help/en/19.0/jmp/about-the-graph-builder-window.shtml)

### P03 — Alt/Option direct configuration [Explore]

**Target and sequence:** Scatter plot point/space. Alt/Option-primary click without movement → Color field search → accept; Escape leaves the binding unchanged.

**Scope:** Chart color; visible owner caption. **Benefit:** One fewer menu activation for an expert repeated task.

**Cost/conflict:** OS interception and relearning; Alt-drag must cancel, not brush, in this experimental variant. **Discoverable fallback:** Color trigger and keyboard context menu.

**Decision:** DCI-04. **Repository:** [packages/explorEDA/src/components/charts/ScatterPlot/ScatterSvg.tsx · ScatterSvg](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/ScatterPlot/ScatterSvg.tsx#L408-L423); [packages/explorEDA/src/hooks/useBrush.tsx · useBrush](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/hooks/useBrush.tsx); [packages/explorEDA/src/components/PlotChartPanel.tsx · onPanelContextMenu](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/PlotChartPanel.tsx#L605-L620). **Precedent:** [MDN](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/altKey)

### P04 — Focused full editor instead of a new editor [Explore]

**Target and sequence:** Point menu or chart header. Open Chart settings with Data selected and Color focused; use the existing selector.

**Scope:** Chart settings. **Benefit:** The lowest implementation cost and strongest fallback.

**Cost/conflict:** Still surrounds one task with unrelated controls. **Discoverable fallback:** Visible Color-only selector variant.

**Decision:** DCI-16. **Repository:** [packages/explorEDA/src/components/ChartSettingsContent.tsx · ChartSettingsContent](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/ChartSettingsContent.tsx#L22-L37); [packages/explorEDA/src/components/settings/MainSettingsTab.tsx · MainSettingsTab](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/settings/MainSettingsTab.tsx#L14-L29); [packages/explorEDA/src/components/FieldSelector.tsx · FieldSelector](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/FieldSelector.tsx#L18-L33); [packages/explorEDA/src/components/PlotChartPanel.tsx · onPanelContextMenu](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/PlotChartPanel.tsx#L605-L620). **Precedent:** [Excel](https://support.microsoft.com/en-au/office/format-elements-of-a-chart)

### P05 — Trace a record without filtering it [Explore]

**Target and sequence:** Point menu. Right-click → This record: [identity] → Trace record…; then follow its contributors.

**Scope:** One logical record/mark. **Benefit:** Retains provenance without occupying the default click or a per-mark button.

**Cost/conflict:** A menu must not resolve a different row after data replacement. **Discoverable fallback:** Existing header trace target browser.

**Decision:** DCI-04. **Repository:** [packages/explorEDA/src/components/charts/ScatterPlot/ScatterPlot.tsx · ScatterPoints](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/ScatterPlot/ScatterPlot.tsx); [packages/explorEDA/src/components/PlotChartPanel.tsx · onPanelContextMenu](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/PlotChartPanel.tsx#L605-L620). **Precedent:** [Power BI](https://learn.microsoft.com/en-us/power-bi/create-reports/power-bi-on-object-interaction)

### P06 — Disambiguate only when identity matters [Explore]

**Target and sequence:** Overlapping marks. Open object menu → choose Trace nearby record… → choose a named candidate. Color by remains chart-scoped without a candidate choice.

**Scope:** Record choice separate from chart encoding. **Benefit:** Avoids a tedious hit chooser for a chart-wide operation.

**Cost/conflict:** A new candidate list requires actual plan IDs, not fabricated rows from pixels. **Discoverable fallback:** Search records in the header trace browser.

**Decision:** DCI-03. **Repository:** [packages/explorEDA/src/components/charts/ScatterPlot/ScatterPlot.tsx · ScatterPoints](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/ScatterPlot/ScatterPlot.tsx); [packages/explorEDA/src/components/charts/ScatterPlot/ScatterSvg.tsx · ScatterSvg](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/ScatterPlot/ScatterSvg.tsx#L408-L423). **Precedent:** [Power BI](https://learn.microsoft.com/en-us/power-bi/create-reports/power-bi-on-object-interaction)

### P07 — Empty-plot configuration without clearing [Explore]

**Target and sequence:** Empty scatter plot. Right-click empty plot → Chart color…; only an ordinary primary click clears the chart filter.

**Scope:** Chart. **Benefit:** No need to find a tiny mark or create a legend.

**Cost/conflict:** Do not dispatch a primary click before opening a context menu. **Discoverable fallback:** Header Color trigger.

**Decision:** DCI-02. **Repository:** [packages/explorEDA/src/components/PlotChartPanel.tsx · onPanelContextMenu](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/PlotChartPanel.tsx#L605-L620); [packages/explorEDA/src/hooks/useBrush.tsx · useBrush](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/hooks/useBrush.tsx); [packages/explorEDA/src/components/charts/ScatterPlot/ScatterSvg.tsx · ScatterSvg](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/ScatterPlot/ScatterSvg.tsx#L408-L423). **Precedent:** Original interaction proposal or repository-derived reuse; no external usability claim.

### P08 — Legend-title field replacement [Explore]

**Target and sequence:** Legend title. Use a separate chevron or title context menu → Change color field… → picker.

**Scope:** Chart encoding; not all charts on old scale. **Benefit:** The binding is changed where it is explained.

**Cost/conflict:** The category chip remains a filtering button, including its swatch. **Discoverable fallback:** Header Color trigger; full Data settings.

**Decision:** DCI-03. **Repository:** [packages/explorEDA/src/components/charts/ColorLegend/ChartColorLegend.tsx · ChartColorLegend](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/ColorLegend/ChartColorLegend.tsx#L30-L45); [packages/explorEDA/src/components/FieldSelector.tsx · FieldSelector](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/FieldSelector.tsx#L18-L33). **Precedent:** [Tableau](https://help.tableau.com/current/pro/desktop/en-us/viewparts_marks_markproperties_color.htm)

### P09 — Explicit shared categorical color editing [Explore]

**Target and sequence:** Category swatch context menu. Right-click swatch → Edit shared colors… → see scale name and affected-chart count → existing color editor.

**Scope:** Shared scale; category mapping. **Benefit:** Makes palette reach visible before changing it.

**Cost/conflict:** A chart-local-looking palette change can recolor peers. **Discoverable fallback:** Workspace Colors; separate-scale fork evaluated later.

**Decision:** DCI-07. **Repository:** [packages/explorEDA/src/components/charts/ColorLegend/ColorScale.tsx · ColorScale](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/ColorLegend/ColorScale.tsx#L25-L40); [packages/explorEDA/src/components/colorScales/ColorScaleControl.tsx · ColorScaleControl](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/colorScales/ColorScaleControl.tsx#L31-L46); [packages/explorEDA/src/hooks/useColorScales.ts · getOrCreateScaleForField](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/hooks/useColorScales.ts#L141-L156). **Precedent:** [Grafana](https://grafana.com/docs/grafana/latest/visualizations/panels-visualizations/configure-legend/)

### P10 — Numerical-ramp bounds as scale editing [Explore]

**Target and sequence:** Numeric legend ramp. Open ramp menu → Edit shared scale… → adjust scale endpoints in existing editor.

**Scope:** Shared source-field color scale. **Benefit:** Distinguishes color limits from positional axis limits.

**Cost/conflict:** A density count maximum is a different setting from a numeric field palette. **Discoverable fallback:** Workspace Colors panel.

**Decision:** DCI-07. **Repository:** [packages/explorEDA/src/components/charts/ColorLegend/ColorScale.tsx · ColorScale](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/ColorLegend/ColorScale.tsx#L25-L40); [packages/explorEDA/src/components/colorScales/ColorScaleControl.tsx · ColorScaleControl](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/colorScales/ColorScaleControl.tsx#L31-L46). **Precedent:** Original interaction proposal or repository-derived reuse; no external usability claim.

### P11 — Size binding with a truthful area scale [Explore]

**Target and sequence:** Bubble or size explanation. Open Size by… → numeric-compatible field → preserve zero/null policy; use separate Maximum radius control.

**Scope:** All bubbles; data binding distinct from pixel size. **Benefit:** Separates encoding a quantity from cosmetic marker sizing.

**Cost/conflict:** Computed field presence alone does not prove numeric validity. **Discoverable fallback:** Scatter Data settings.

**Decision:** DCI-18. **Repository:** [packages/explorEDA/src/components/charts/ScatterPlot/ScatterPlotSettingsPanel.tsx · ScatterPlotSettingsPanel](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/ScatterPlot/ScatterPlotSettingsPanel.tsx#L21-L36); [packages/explorEDA/src/components/FieldSelector.tsx · FieldSelector](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/FieldSelector.tsx#L18-L33); [packages/explorEDA/src/components/charts/ScatterPlot/PointSizeSetting.tsx · PointSizeSetting](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/ScatterPlot/PointSizeSetting.tsx#L21-L36). **Precedent:** Original interaction proposal or repository-derived reuse; no external usability claim.

### P12 — Continuous opacity adjustment [Explore]

**Target and sequence:** Explicit Points control. Open Points → drag opacity slider → chart previews → release commits one edit; Escape during edit restores its starting value.

**Scope:** All chart points. **Benefit:** Useful for overlap, unlike low-frequency palette polishing.

**Cost/conflict:** A global notification hold must not absorb another chart edit. **Discoverable fallback:** Existing numeric opacity input.

**Decision:** DCI-18. **Repository:** [packages/explorEDA/src/components/charts/ScatterPlot/ScatterPlotSettingsPanel.tsx · ScatterPlotSettingsPanel](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/ScatterPlot/ScatterPlotSettingsPanel.tsx#L21-L36); [packages/explorEDA/src/components/charts/InPlace/useChartEdit.ts · useChartEdit](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/InPlace/useChartEdit.ts#L12-L27). **Precedent:** [Origin / OriginPro](https://docs.originlab.com/origin-help/mini-toolbar/)

### P13 — Density display choice with analytical meaning [Explore]

**Target and sequence:** Chart header Points control. Choose Points, rectangular counts, hexagonal counts or smoothed density; then expose only the matching tuning control.

**Scope:** Chart display mode. **Benefit:** Resolves crowding without making every point larger.

**Cost/conflict:** Count versus density, disabled color/size and fit applicability must be explicit. **Discoverable fallback:** Data tab; labels must not conflate key density with contour.

**Decision:** DCI-18. **Repository:** [packages/explorEDA/src/components/charts/ScatterPlot/ScatterPlotSettingsPanel.tsx · ScatterPlotSettingsPanel](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/ScatterPlot/ScatterPlotSettingsPanel.tsx#L21-L36); [packages/explorEDA/src/components/charts/ScatterPlot/DensitySettings.tsx · DensitySettings](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/ScatterPlot/DensitySettings.tsx#L7-L22); [packages/explorEDA/src/components/charts/ScatterPlot/SurfaceSettings.tsx · SurfaceSettings](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/ScatterPlot/SurfaceSettings.tsx#L37-L52). **Precedent:** Original interaction proposal or repository-derived reuse; no external usability claim.

### P14 — Fit command and equation-targeted tuning [Explore]

**Target and sequence:** Scatter object menu or fit label. Choose Add fit… → method; later context-menu a fit/equation → existing RegressionSettings for that chart.

**Scope:** Fit specification; computed per color group/facet. **Benefit:** Shortens a repeated analytical comparison.

**Cost/conflict:** A clicked fitted line is not permission for an independent per-series model. **Discoverable fallback:** Fit tab.

**Decision:** DCI-18. **Repository:** [packages/explorEDA/src/components/charts/ScatterPlot/ScatterPlotSettingsPanel.tsx · ScatterPlotSettingsPanel](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/ScatterPlot/ScatterPlotSettingsPanel.tsx#L21-L36); [packages/explorEDA/src/components/charts/ScatterPlot/RegressionSettings.tsx · RegressionSettings](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/ScatterPlot/RegressionSettings.tsx#L17-L32). **Precedent:** [JMP](https://www.jmp.com/support/help/en/19.0/jmp/popup-menus-in-graph-builder.shtml)

### P15 — Inline title edit without grid drag [Keep]

**Target and sequence:** Chart title. Second mousedown opens inline text; Enter/Tab/blur commits; Escape restores. Keyboard Enter/F2 provides the direct path.

**Scope:** Chart title override. **Benefit:** Preserves an already useful local operation.

**Cost/conflict:** Do not replace the grid-safe press handler with dblclick-only handling. **Discoverable fallback:** Title menu Rename / Reset inherited title. 

**Decision:** DCI-06. **Repository:** [packages/explorEDA/src/components/charts/InPlace/useTitleEditing.tsx · useTitleEditing](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/InPlace/useTitleEditing.tsx#L26-L41); [packages/explorEDA/src/components/ChartGridLayout.tsx · ChartGridLayout](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/ChartGridLayout.tsx#L44-L59); [packages/explorEDA/src/components/charts/InPlace/useChartEdit.ts · useChartEdit](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/InPlace/useChartEdit.ts#L12-L27). **Precedent:** Original interaction proposal or repository-derived reuse; no external usability claim.

### P16 — Field replacement on an axis [Explore]

**Target and sequence:** Axis title or field label. Right-click → Change X field… → search; confirm/reset incompatible manual bounds rather than silently carrying them across.

**Scope:** Chart axis role and all facets. **Benefit:** Axis labels become semantic binding anchors.

**Cost/conflict:** Renaming the title, inspecting a field, and replacing a binding are different actions. **Discoverable fallback:** Data tab X/Y selectors.

**Decision:** DCI-06. **Repository:** [packages/explorEDA/src/components/charts/AxisFieldActions.tsx · useAxisFieldActions](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/AxisFieldActions.tsx#L44-L59); [packages/explorEDA/src/components/charts/InPlace/useAxisEditing.tsx · useAxisEditing](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/InPlace/useAxisEditing.tsx#L118-L133); [packages/explorEDA/src/components/FieldSelector.tsx · FieldSelector](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/FieldSelector.tsx#L18-L33). **Precedent:** [JMP](https://www.jmp.com/support/help/en/19.0/jmp/move-or-remove-variables-in-zones.shtml)

### P17 — Exact axis range [Keep]

**Target and sequence:** Numeric axis band/tick. Double-click band or menu Set range… → minimum/maximum; blank follows data; invalid draft never writes.

**Scope:** Chart view, not filtering. **Benefit:** Keeps exact comparisons near the ruler.

**Cost/conflict:** Log needs positive bounds; tick text must resolve to its band. **Discoverable fallback:** Axes tab numeric fields.

**Decision:** DCI-06. **Repository:** [packages/explorEDA/src/components/charts/InPlace/useAxisEditing.tsx · useAxisEditing](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/InPlace/useAxisEditing.tsx#L118-L133); [packages/explorEDA/src/components/charts/InPlace/AxisLimitFields.tsx · AxisLimitFields](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/InPlace/AxisLimitFields.tsx#L41-L56). **Precedent:** Original interaction proposal or repository-derived reuse; no external usability claim.

### P18 — Pan or stretch a numeric ruler [Keep]

**Target and sequence:** Axis body or end grip. Drag along body to pan; drag end to stretch; release commits; Escape cancels.

**Scope:** All facets of chart axis. **Benefit:** Direct manipulation without a global zoom mode.

**Cost/conflict:** Axis drag must never become a plot brush. **Discoverable fallback:** Range input; no wheel hijack.

**Decision:** DCI-06. **Repository:** [packages/explorEDA/src/components/charts/InPlace/useAxisEditing.tsx · useAxisEditing](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/InPlace/useAxisEditing.tsx#L118-L133); [packages/explorEDA/src/components/charts/InPlace/axisDrag.ts · axisDrag](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/InPlace/axisDrag.ts). **Precedent:** Original interaction proposal or repository-derived reuse; no external usability claim.

### P19 — Hidden-row marker with a local remedy [Keep]

**Target and sequence:** Axis clipped/log-warning marker. Open marker → read omitted count/reason → reset that bound or choose an eligible alternative scale.

**Scope:** Chart view restriction. **Benefit:** Explains absence where it happens.

**Cost/conflict:** Count unit may be rows, bars or periods; keep its established meaning. **Discoverable fallback:** Axes settings, source trace.

**Decision:** DCI-06. **Repository:** [packages/explorEDA/src/components/charts/InPlace/useAxisEditing.tsx · useAxisEditing](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/InPlace/useAxisEditing.tsx#L118-L133); [packages/explorEDA/src/components/charts/InPlace/useHiddenNotice.tsx · useHiddenNotice](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/InPlace/useHiddenNotice.tsx#L77-L92). **Precedent:** Original interaction proposal or repository-derived reuse; no external usability claim.

### P20 — Scale type near its axis [Explore]

**Target and sequence:** Numeric axis menu. Choose Linear / Symmetric log / eligible Log; show the same validity and omissions as Axes.

**Scope:** Chart axis, all facets. **Benefit:** Helps comparisons over orders of magnitude.

**Cost/conflict:** Do not enable true log for filled bars/areas merely because it is in the union type. **Discoverable fallback:** Axes tab.

**Decision:** DCI-06. **Repository:** [packages/explorEDA/src/components/charts/InPlace/useAxisEditing.tsx · useAxisEditing](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/InPlace/useAxisEditing.tsx#L118-L133); [packages/explorEDA/src/components/settings/AxisSettingsTab.tsx · AxisSettingsTab](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/settings/AxisSettingsTab.tsx#L15-L30). **Precedent:** Original interaction proposal or repository-derived reuse; no external usability claim.

### P21 — Explicit swap rather than ambiguous dragging [Defer]

**Target and sequence:** X/Y binding controls. Choose Swap X and Y → review role-dependent settings policy → one atomic change.

**Scope:** Chart axis roles. **Benefit:** Can accelerate relationship exploration.

**Cost/conflict:** Fields alone are insufficient: limits, labels, filters and annotations have role semantics. **Discoverable fallback:** Change the two selectors separately; defer generic swap until policy tested.

**Decision:** DCI-17. **Repository:** [packages/explorEDA/src/components/settings/MainSettingsTab.tsx · MainSettingsTab](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/settings/MainSettingsTab.tsx#L14-L29); [packages/explorEDA/src/types/ChartTypes.ts · BaseChartSettings](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/types/ChartTypes.ts#L98-L113); [packages/explorEDA/src/components/charts/ScatterPlot/ScatterPlotSettingsPanel.tsx · ScatterPlotSettingsPanel](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/ScatterPlot/ScatterPlotSettingsPanel.tsx#L21-L36). **Precedent:** [JMP](https://www.jmp.com/support/help/en/19.0/jmp/move-or-remove-variables-in-zones.shtml)

### P22 — Metric expression at a value title [Explore]

**Target and sequence:** Bar/row/heatmap/calendar metric label. Open Measure… → Count or supported reducer plus field; caption says exactly which population and definition changes.

**Scope:** Chart or shared named aggregate, explicitly distinguished. **Benefit:** Makes “count versus revenue” a first-class analytic change.

**Cost/conflict:** Named aggregates can be shared; average cannot be treated as additive. **Discoverable fallback:** Data operation/measure controls.

**Decision:** DCI-08. **Repository:** [packages/explorEDA/src/components/charts/BarChart/BarChartSettingsPanel.tsx · BarChartSettingsPanel](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/BarChart/BarChartSettingsPanel.tsx#L15-L30); [packages/explorEDA/src/components/charts/MetricCard/MetricCardSettingsPanel.tsx · MetricCardSettingsPanel](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/MetricCard/MetricCardSettingsPanel.tsx#L12-L27). **Precedent:** Original interaction proposal or repository-derived reuse; no external usability claim.

### P23 — Bin count beside the distribution [Explore]

**Target and sequence:** Histogram axis/menu. Open Bins… → change count using existing range validation → compare → commit a continuous edit once.

**Scope:** Chart binning; stable full-source reference. **Benefit:** Useful during distribution discovery.

**Cost/conflict:** New bin width/explicit boundaries are concepts, not current count-only controls. **Discoverable fallback:** Bar Data settings.

**Decision:** DCI-08. **Repository:** [packages/explorEDA/src/components/charts/BarChart/BarChartSettingsPanel.tsx · BarChartSettingsPanel](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/BarChart/BarChartSettingsPanel.tsx#L15-L30); [packages/explorEDA/src/components/charts/InPlace/useChartEdit.ts · useChartEdit](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/InPlace/useChartEdit.ts#L12-L27). **Precedent:** Original interaction proposal or repository-derived reuse; no external usability claim.

### P24 — Time grain on a time summary [Explore]

**Target and sequence:** Time-axis field label. Open Period… → day/week/month/year; week-start and missing-period policy remain in a compact extended section.

**Scope:** Chart time summary. **Benefit:** Changes the analytical question without navigating a long settings panel.

**Cost/conflict:** UTC period boundaries and average missingness must not change implicitly. **Discoverable fallback:** Line Data calendar-summary settings.

**Decision:** DCI-08. **Repository:** [packages/explorEDA/src/components/charts/LineChart/TimeSeriesSettingsPanel.tsx · TimeSeriesSettingsPanel](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/LineChart/TimeSeriesSettingsPanel.tsx#L80-L95). **Precedent:** Original interaction proposal or repository-derived reuse; no external usability claim.

### P25 — Sort and Top N at category labels [Explore]

**Target and sequence:** Category axis or Other summary. Open Order / Top N… → choose supported order and count → retain exact Other membership semantics.

**Scope:** Chart category display. **Benefit:** Ranking and reveal-more become local decisions.

**Cost/conflict:** Not all families support all sorts; resizing and Top N must not reinterpret filters silently. **Discoverable fallback:** Data tab; trace Other contributors.

**Decision:** DCI-08. **Repository:** [packages/explorEDA/src/components/charts/RowChart/RowChartSettingsPanel.tsx · RowChartSettingsPanel](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/RowChart/RowChartSettingsPanel.tsx#L17-L32); [packages/explorEDA/src/components/charts/Donut/DonutSettingsPanel.tsx · DonutSettingsPanel](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/Donut/DonutSettingsPanel.tsx#L12-L27). **Precedent:** Original interaction proposal or repository-derived reuse; no external usability claim.

### P26 — Split, stack and normalize as a coherent choice [Explore]

**Target and sequence:** Series legend/title or chart object menu. Choose Split by… → field → Grouped / Stacked / 100% when eligible.

**Scope:** Whole chart series layout. **Benefit:** Puts comparison versus composition near the result.

**Cost/conflict:** 100% needs the category denominator; negative and average restrictions remain. **Discoverable fallback:** Bar Data settings.

**Decision:** DCI-08. **Repository:** [packages/explorEDA/src/components/charts/BarChart/BarChartSettingsPanel.tsx · BarChartSettingsPanel](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/BarChart/BarChartSettingsPanel.tsx#L15-L30). **Precedent:** Original interaction proposal or repository-derived reuse; no external usability claim.

### P27 — Series-style editor without hiding data [Explore]

**Target and sequence:** Line series legend context menu. Right-click series → Style this series… → width, points, dash or axis in the existing series controls.

**Scope:** Named line series appearance. **Benefit:** Targets actual per-series settings instead of chart-wide changes.

**Cost/conflict:** Ordinary legend click must not silently switch from row filtering to hide/isolate. **Discoverable fallback:** Line settings; do not copy Grafana’s default label gesture.

**Decision:** DCI-18. **Repository:** [packages/explorEDA/src/components/charts/LineChart/LineSeriesSettings.tsx · LineSeriesSettings](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/LineChart/LineSeriesSettings.tsx#L13-L28). **Precedent:** [Grafana](https://grafana.com/docs/grafana/latest/visualizations/panels-visualizations/configure-legend/)

### P28 — Facet template editing with an explicit owner [Explore]

**Target and sequence:** Facet header. Open header menu → Facet fields / Visible facets…; caption “All panels in this chart”.

**Scope:** Chart facet template. **Benefit:** Local entry without inventing per-panel field overrides.

**Cost/conflict:** A clicked panel is not independently configurable through ordinary facet settings. **Discoverable fallback:** Facets tab.

**Decision:** DCI-09. **Repository:** [packages/explorEDA/src/components/settings/FacetSettingsTab.tsx · FacetSettingsTab](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/settings/FacetSettingsTab.tsx#L29-L44); [packages/explorEDA/src/components/PlotChartPanel.tsx · onPanelContextMenu](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/PlotChartPanel.tsx#L605-L620). **Precedent:** Original interaction proposal or repository-derived reuse; no external usability claim.

### P29 — One-panel annotation binding [Explore]

**Target and sequence:** Annotation menu within a facet. Edit note → Panel → choose this semantic facet key; reorder facets and verify the note follows the values.

**Scope:** One annotation, optionally one facet. **Benefit:** Uses the existing exception model rather than a new facet-settings system.

**Cost/conflict:** A facet index is not stable identity. **Discoverable fallback:** Notes tab Panel control.

**Decision:** DCI-13. **Repository:** [packages/explorEDA/src/components/settings/annotations/AnnotationsSettingsTab.tsx · AnnotationsSettingsTab](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/settings/annotations/AnnotationsSettingsTab.tsx#L83-L98); [packages/explorEDA/src/components/settings/annotations/AnnotationFields.tsx · AnnotationFields](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/settings/annotations/AnnotationFields.tsx). **Precedent:** Original interaction proposal or repository-derived reuse; no external usability claim.

### P30 — Annotate a record through an explicit command [Explore]

**Target and sequence:** Point context menu. Choose Add callout… → select/validate stable key → existing Notes editor; later drag only its label.

**Scope:** One keyed record, not nearest row index. **Benefit:** Captures an observation while the analyst can still see it.

**Cost/conflict:** Duplicate or missing keys must stop a record anchor from pretending to be stable. **Discoverable fallback:** Notes tab fixed-coordinate or record callout.

**Decision:** DCI-13. **Repository:** [packages/explorEDA/src/components/settings/annotations/AnnotationsSettingsTab.tsx · AnnotationsSettingsTab](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/settings/annotations/AnnotationsSettingsTab.tsx#L83-L98); [apps/demo/src/docs/pages/scatter.mdx · ## Annotations](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/apps/demo/src/docs/pages/scatter.mdx#L83-L98). **Precedent:** [Datawrapper](https://www.datawrapper.de/academy/customizing-your-scatter-plot-annotate)

### P31 — Reference line from an axis value [Explore]

**Target and sequence:** Axis context menu. Add reference line… → fixed value or explicitly named statistic/population → Notes editor.

**Scope:** Annotation; fixed versus computed population. **Benefit:** Supports targets without repurposing brushing.

**Cost/conflict:** A filtered mean moves; a fixed target does not. **Discoverable fallback:** Notes tab.

**Decision:** DCI-13. **Repository:** [packages/explorEDA/src/components/settings/annotations/AnnotationFields.tsx · AnnotationFields](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/settings/annotations/AnnotationFields.tsx); [packages/explorEDA/src/components/charts/InPlace/useAxisEditing.tsx · useAxisEditing](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/InPlace/useAxisEditing.tsx#L118-L133). **Precedent:** Original interaction proposal or repository-derived reuse; no external usability claim.

### P32 — One-shot range annotation rather than brush hijack [Explore]

**Target and sequence:** Explicit Add band tool. Choose Add band… → enter bounds initially; evaluate a one-shot drag only with a visible armed state and Escape.

**Scope:** Annotation, not selected rows. **Benefit:** Separates noting a span from filtering it.

**Cost/conflict:** Sticky drawing mode creates a costly accidental-filter/edit conflict. **Discoverable fallback:** Numeric Notes fields always work.

**Decision:** DCI-13. **Repository:** [packages/explorEDA/src/components/settings/annotations/AnnotationFields.tsx · AnnotationFields](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/settings/annotations/AnnotationFields.tsx); [packages/explorEDA/src/hooks/useBrush.tsx · useBrush](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/hooks/useBrush.tsx). **Precedent:** [Datawrapper](https://www.datawrapper.de/academy/customizing-your-scatter-plot-annotate)

### P33 — Table header commands that already work [Keep]

**Target and sequence:** Table header. Right-click → Filter, Sort, Move, Hide or Copy name; primary heading click retains sorting.

**Scope:** Header/column; action names distinguish linked filtering from local table order. **Benefit:** Retains established density and avoids duplicate tools.

**Cost/conflict:** A heading is not a chart mark; do not force click-to-filter over sorting. **Discoverable fallback:** Menu-key/touch command access; drag is optional.

**Decision:** DCI-12. **Repository:** [packages/explorEDA/src/components/charts/DataTable/DataTableContextMenu.tsx · DataTableContextMenu](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/DataTable/DataTableContextMenu.tsx#L72-L87); [apps/demo/src/docs/pages/data-table.mdx · ## Sorting](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/apps/demo/src/docs/pages/data-table.mdx#L15-L22). **Precedent:** Original interaction proposal or repository-derived reuse; no external usability claim.

### P34 — Value-derived table actions [Keep]

**Target and sequence:** Table cell. Right-click a value → copy or build a supported filter from that value; scope is named before application.

**Scope:** Cell-derived filter versus local table search. **Benefit:** Uses an exact value instead of asking the analyst to retype it.

**Cost/conflict:** Null is a real state, not a literal string or empty search. **Discoverable fallback:** Column filter editor.

**Decision:** DCI-12. **Repository:** [packages/explorEDA/src/components/charts/DataTable/DataTableContextMenu.tsx · DataTableContextMenu](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/DataTable/DataTableContextMenu.tsx#L72-L87). **Precedent:** Original interaction proposal or repository-derived reuse; no external usability claim.

### P35 — Pivot measure configuration at the measure header [Explore]

**Target and sequence:** Pivot measure header. Open measure menu → aggregation/label; reorder field groups using existing picker/order controls.

**Scope:** Pivot measure specification. **Benefit:** More natural than a universal scatter-style menu.

**Cost/conflict:** A cell aggregates rows and cannot be recolored as though it were one record. **Discoverable fallback:** Pivot Data settings.

**Decision:** DCI-12. **Repository:** [packages/explorEDA/src/components/charts/PivotTable/PivotTableSettingsPanel.tsx · PivotTableSettingsPanel](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/PivotTable/PivotTableSettingsPanel.tsx#L30-L45). **Precedent:** Original interaction proposal or repository-derived reuse; no external usability claim.

### P36 — Map content controls stay map-specific [Keep]

**Target and sequence:** Map layers control. Open existing Layers → points/labels/grouping/reference/basemap; keep pan/zoom and selection unchanged.

**Scope:** Map display; shared geometry remains separate. **Benefit:** Recognizes an existing local pattern instead of rebuilding it.

**Cost/conflict:** Geometry joins, labels and projected views have distinct scopes and eligibility. **Discoverable fallback:** Map Data/Region settings.

**Decision:** DCI-14. **Repository:** [packages/explorEDA/src/components/charts/Map/MapSettingsPanel.tsx · MapSettingsPanel](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/Map/MapSettingsPanel.tsx#L15-L30); [apps/demo/src/docs/pages/map.mdx · ## How it reads](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/apps/demo/src/docs/pages/map.mdx#L8-L23). **Precedent:** Original interaction proposal or repository-derived reuse; no external usability claim.

### P37 — Browse a calendar year locally [Explore]

**Target and sequence:** Calendar year heading/control. Change Year using a local selector; operation/measure uses the common metric route.

**Scope:** Calendar view year. **Benefit:** Repeated time navigation deserves shorter access than cosmetic styling.

**Cost/conflict:** Year is display, not a workspace date filter. **Discoverable fallback:** Calendar Data settings.

**Decision:** DCI-14. **Repository:** [packages/explorEDA/src/components/charts/Calendar/CalendarSettingsPanel.tsx · CalendarSettingsPanel](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/Calendar/CalendarSettingsPanel.tsx#L13-L28). **Precedent:** Original interaction proposal or repository-derived reuse; no external usability claim.

### P38 — Profile-axis order and direction [Explore]

**Target and sequence:** Parallel-coordinate axis header. Open axis menu → Reverse / Move left/right / Change field; a numeric range brush still filters.

**Scope:** One axis in the ordered chart axes array. **Benefit:** Matches the unusual chart’s actual controls.

**Cost/conflict:** Renderer line-click tracing is not proven to be ordinary row selection by the selected packet. **Discoverable fallback:** Existing ordered axes settings.

**Decision:** DCI-14. **Repository:** [packages/explorEDA/src/components/charts/ParallelCoordinates/ParallelCoordinatesSettingsPanel.tsx · ParallelCoordinatesSettingsPanel](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/ParallelCoordinates/ParallelCoordinatesSettingsPanel.tsx#L19-L34). **Precedent:** Original interaction proposal or repository-derived reuse; no external usability claim.

### P39 — Matrix-cell presentation targets a rule, not a record [Explore]

**Target and sequence:** Scatter-matrix cell header. Open cell menu → identify lower/upper/diagonal rule → choose a supported representation.

**Scope:** Cell-class rule in chart settings. **Benefit:** Exposes useful mixed-type matrix controls.

**Cost/conflict:** A correlation cell is not a record group; avoid inventing an arbitrary filter from it. **Discoverable fallback:** Matrix Data lower/upper/diagonal settings.

**Decision:** DCI-14. **Repository:** [packages/explorEDA/src/components/charts/ScatterMatrix/ScatterMatrixSettingsPanel.tsx · ScatterMatrixSettingsPanel](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/ScatterMatrix/ScatterMatrixSettingsPanel.tsx#L123-L138). **Precedent:** Original interaction proposal or repository-derived reuse; no external usability claim.

### P40 — Composition semantic hierarchy navigation [Keep]

**Target and sequence:** Composition drawn object. Right-click or Shift+F10 → mark / scale / unit / repeat → matching inspector section.

**Scope:** Explicit template, named scale or repeat override. **Benefit:** Reuse an already rich quick-menu route.

**Cost/conflict:** Repeat appearance overrides do not authorize independent data bindings. **Discoverable fallback:** Object selection in the existing Composition editor.

**Decision:** DCI-14. **Repository:** [packages/explorEDA/src/components/charts/Composition/CompositionQuickMenu.tsx · CompositionQuickMenu](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/Composition/CompositionQuickMenu.tsx#L16-L31); [packages/explorEDA/src/components/charts/Composition/compositionTypes.ts · CompositionDefinition](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/Composition/compositionTypes.ts). **Precedent:** Original interaction proposal or repository-derived reuse; no external usability claim.

### P41 — Keyboard completion without pointer coordinates [Explore]

**Target and sequence:** Visible Color button or focused semantic object. Tab → Enter/Space opens; type query → arrows → Enter accepts; Escape cancels the current layer. Shift+F10/menu key opens supported object menu.

**Scope:** Explicitly named current chart/object. **Benefit:** Makes the same task reachable without tiny target acquisition.

**Cost/conflict:** Do not pretend every Canvas point is already a focusable DOM button. **Discoverable fallback:** Header trace browser for record identity.

**Decision:** DCI-10. **Repository:** [packages/explorEDA/src/components/ComboBox.tsx · ComboBox](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/ComboBox.tsx); [packages/explorEDA/src/components/FieldSelector.tsx · FieldSelector](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/FieldSelector.tsx#L18-L33); [packages/explorEDA/src/components/PlotChartPanel.tsx · onPanelContextMenu](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/PlotChartPanel.tsx#L605-L620). **Precedent:** [W3C WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/); [W3C WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/)

### P42 — Touch completion without a long-press dependency [Explore]

**Target and sequence:** Visible chart action. Tap Color → searchable sheet/popover → choose field; provide a Close control; scrolling the options does not touch the plot.

**Scope:** Chart encoding. **Benefit:** Discoverable on devices without hover/right button.

**Cost/conflict:** Existing scatter touch-action policy is a separate collision; long press must not seize page scroll. **Discoverable fallback:** Full settings/details responsive layout; long press remains optional later.

**Decision:** DCI-11. **Repository:** [packages/explorEDA/src/components/PlotChartPanel.tsx · onPanelContextMenu](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/PlotChartPanel.tsx#L605-L620); [packages/explorEDA/src/components/ComboBox.tsx · ComboBox](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/ComboBox.tsx); [packages/explorEDA/src/components/ChartGridLayout.tsx · ChartGridLayout](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/ChartGridLayout.tsx#L44-L59). **Precedent:** [W3C Pointer Events](https://www.w3.org/TR/2026/REC-pointerevents3-20260630/)

### P43 — Export section and unhandled fallback [Keep]

**Target and sequence:** Any chart menu. After object commands, Copy image / Download image; an unhandled right-click shows just those actions.

**Scope:** One chart’s image. **Benefit:** Preserves an established useful fallback.

**Cost/conflict:** Editor-only controls need data-export="omit", not global hiding of button elements. **Discoverable fallback:** Header image menu and E/Shift+E.

**Decision:** DCI-02. **Repository:** [packages/explorEDA/src/components/charts/export/ChartImageMenu.tsx · ChartImageMenuSection](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/export/ChartImageMenu.tsx#L47-L62); [packages/explorEDA/src/components/PlotChartPanel.tsx · onPanelContextMenu](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/PlotChartPanel.tsx#L605-L620). **Precedent:** Original interaction proposal or repository-derived reuse; no external usability claim.
