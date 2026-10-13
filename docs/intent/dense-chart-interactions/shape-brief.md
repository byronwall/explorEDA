# Change the chart near the data

**Outcome:** Change frequent chart settings locally while ordinary clicks filter immediately and the selected records remain intact.

**Primary flow:** Open Color from a visible control, or right-click a scatter point → Color by… → search → accept a field.

The picker names its owner: **This chart · all points · all facets**. It changes the encoding. A separate **This record** action opens a trace. **None** removes the color binding. The visible route works before a color legend exists.

## Feature scope

```text
Local chart configuration
├── Planned first proof: scatter Color
│   ├── Points and bubbles; categorical, numeric, and existing computed fields
│   ├── Visible Color control and shallow object menu
│   │   └── One searchable field editor, opened directly
│   ├── Explicit acceptance; search and navigation do not write
│   │   └── Scale reuse/creation and binding produce one accepted change
│   ├── Immediate filtering, ordinary brushing, and trace access
│   └── Docs: Scatter, Color, In-place editing, Chart settings
│       └── Demo: dense-chart-controls with a filtered chart and shared-scale peer
├── Evaluate before adoption
│   ├── Visible selector alone versus selector plus object menu
│   ├── Persistent Color label versus focus/hover reveal with a touch-visible route
│   └── Alt/Option-click opens configuration versus current tracing access
│       └── Replacement trace path and complete gesture docs in the same slice
└── Later candidates, with their docs and examples
    ├── X/Y/category/measure fields, aggregation, bins, time grain, sort, Top N
    │   └── Owning chart docs; distribution and time-comparison examples
    ├── Point size, opacity, display modes, and fits
    │   └── Scatter docs; point-density and fit examples
    ├── Shared palette controls and chart-wide facets
    │   └── Color legend/Facets docs; shared-color and faceted examples
    └── Annotation, table, map, and Composition actions
        └── Owning docs and examples; retain each chart’s existing object model
```

## Behavior

| Situation | Expected result |
| --- | --- |
| Open, search, dismiss, or accept Color | Preserve the chart’s filters and linked selection. |
| Right-click overlapping points | Offer chart Color without requiring an exact record hit. Resolve a record only for tracing. |
| Click a category legend chip or swatch | Filter that category. Use a separate encoding action for configuration. |
| Escape or outside dismissal | Close the inner editor and return focus. The dismissal must not also filter the chart. |
| Keyboard or touch | Reach the same task through a visible control. Do not require Alt or long press. |
| Object disappears during editing | Close or revalidate the target. Do not silently edit a different record. |

## Decisions and boundaries

**Appetite:** One local Color comparison before broader controls. This research PR contains no application implementation or implementation plan.

Reuse the chart write path, field metadata, and color-scale resolution. Open field search directly; a closed selector inside a new popover adds an unnecessary step. Group scale creation and binding before notifying the host. Chart-only cancellation cannot restore shared scales, so exclude palette previews from this proof.

Keep title editing, numeric axis editing, specialized menus, and the image-export footer. Reserve unmodified mark clicks for filtering. Add no double-click delay. If Alt changes, update supported marks, axes, titles, legends, help, and trace alternatives together. Keep the current convention if the experiment fails.

Keep native context-menu access and keyboard menu access distinct. Check focus, Escape, and popup placement inside chart details. Test at 1280, 783, and 390 pixels. The narrow check proves reachable controls and stable saved layout; it does not promise full mobile authoring.

**First proof:** A local scatter task with active filters and a second chart sharing its original color scale.

**Try:** Compare existing settings, a visible Color selector, selector plus menu, and an Alt variant. Include no legend, long field names, cancellation, keyboard use, and replacement trace access. First verify the static source concern about ordinary unsized-point selection.

**Observe:** Record discovery, accepted field, understood scope, activations, corrections, filter state, peer state, focus return, and host update count. Start with Byron’s real analysis; a larger user study is optional.

**Decide:** Reject any route that changes filters or misstates scope. Keep the menu only if locality or discovery improves over the selector. Keep Alt only if repeated changes improve and tracing remains findable. Action count alone cannot decide: both the menu and current settings can take three activations.

Below the cut line: universal edit mode, command infrastructure, generic chart conversion, X/Y swaps, per-record paint, independent facet bindings, and a renderer rewrite. The [review](references/research-review.md) retains the wider options and source limits.
