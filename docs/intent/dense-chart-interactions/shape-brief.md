# Change the chart near the data

**Outcome:** Change frequent chart properties where they appear, while ordinary clicks filter immediately and the selected records remain intact.

**Primary flow:** Activate the chart’s **Color** label, or right-click the plot → **Color by…** → search → choose a field. The chart recolors at once. Cmd/Ctrl-Z undoes it.

The editor names its owner: **This chart · all points · all facets**, plus the shared scale the field uses, such as **Shared scale: Region (also used by 2 charts)**. **None** removes the color binding. The visible label works before a color legend exists.

## Feature scope

```text
Editable chart roles
├── Planned first proof: scatter Color as an editable role
│   ├── Points and bubbles; categorical, numeric, and existing computed fields
│   ├── Visible Color label and plot context menu
│   │   └── One searchable field editor, opened directly
│   ├── Choosing applies at once; one Cmd/Ctrl-Z step restores the chart
│   │   └── Scale reuse or creation and the binding are one host change
│   ├── Try live preview while browsing; Escape restores, no undo step
│   ├── One shared color scale per field, named in the editor
│   ├── Immediate filtering, ordinary brushing, and trace access
│   └── Docs: Scatter, Color, In-place editing, Chart settings
│       └── Demo: dense-chart-controls with a filtered chart and shared-scale peer
├── Planned second slice: X and Y fields through the same role control
│   ├── Reuse axis titles as the visible label where they exist
│   └── Owning chart docs and an example
├── Decide during use
│   ├── Whether role labels stay visible or reveal on focus, with a touch-visible route
│   └── What Alt/Option-click does once trace moves to the header and a record action
└── Later candidates, with their docs and examples
    ├── Other plotted fields, measures, aggregation, bins, time grain, sort, Top N
    ├── Point size, opacity, display modes, and fits
    ├── Duplicate a shared scale to tune it separately; chart-wide facets
    └── Annotation, table, map, and Composition actions
        └── Each retains its chart’s existing object model
```

## Behavior

| Situation | Expected result |
| --- | --- |
| Open, search, dismiss, or choose a field | Preserve the chart’s filters and linked selection. |
| Choose a field | Apply at once as one host change and one undo step. |
| Cmd/Ctrl-Z after a choice | Restore the previous binding and remove any scale the choice created. |
| Browse fields with preview on | Show the preview without an undo step. Escape restores the chart. |
| Choose a field that already has a color scale | Join that scale and say which charts share it. |
| Right-click overlapping points | Offer chart Color without an exact record hit. Resolve a record only for trace. |
| Click a category legend chip or swatch | Filter that category. Use a separate encoding action for configuration. |
| Escape or outside dismissal | Close the editor and return focus. The dismissal must not also filter the chart. |
| Keyboard or touch | Reach the same task through a visible control. Do not require Alt or long press. |
| Object disappears during editing | Close or revalidate the target. Do not silently edit a different record. |

## Decisions and boundaries

**Appetite:** Scatter Color as a reusable role, then X and Y. No implementation in this PR. The audience is Byron in the demo; no host opt-in yet.

Reuse the chart write path, host undo, field metadata, and color-scale resolution. Open field search directly. Group scale creation and binding into one host change, so one undo restores both. Chart-only cancellation cannot roll back shared-scale state, so a preview may change only this chart’s binding, never a shared palette.

Trace stays reachable from the header trace control and a **This record** action. Its role as the planning/rendering boundary does not depend on Alt-click. If Alt gets a new meaning, update supported marks, axes, titles, legends, help, and trace alternatives together.

Keep title and numeric axis editing and specialized menus. Reserve unmodified mark clicks for filtering, with no double-click delay.

Keep native context-menu access and keyboard menu access distinct. Check focus, Escape, and popup placement inside chart details. Test at 1280, 783, and 390 pixels. The narrow check proves reachable controls and stable saved layout; it does not promise full mobile authoring.

**First proof:** A scatter with active filters and a second chart sharing its original color scale.

**Try:** First reproduce the static concern about ordinary unsized-point selection, and fix it separately if real. Then build one design: visible Color label plus context menu into the same editor, instant apply, one-step undo, and preview while browsing. Include no legend, long names, Escape, keyboard, and trace through its new routes.

**Observe:** Through real use in the demo — filters unchanged, peer chart correct, one undo step per choice, focus return, and whether the label or the menu gets used.

**Decide:** Reject anything that changes filters, misstates scope, or needs more than one undo. Drop the menu if the label covers real use. Keep preview only if it stays fast and leaves no history.

Below the cut line: switchable route comparisons, Apply buttons, universal edit mode, command infrastructure, generic chart conversion, X/Y swap commands, per-record paint, independent facet bindings, and a renderer rewrite. The [review](references/research-review.md) retains the wider options and source limits.
