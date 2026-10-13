# Change chart settings where the question arises

## My read

Make explorEDA faster to explore by putting frequent chart changes near the data or object that gives them meaning. An analyst should change a field, encoding, or analytic setting, then continue with the same selected records and chart context.

“Dense” means more useful work within reach. It does not require smaller targets or a menu with every setting. The aim is to reduce travel, searching, and interruptions during repeated analysis. A compact control should reveal both its current value and the scope of its effect.

The motivating example is right-clicking a scatter point, choosing **Color by…**, and selecting a field. That is one candidate. A visible Color selector might reach the same result faster. The proposal must compare these routes and preserve useful alternatives.

This initiative covers interaction design and its proof. The current research delivery includes [seven approaches](brainstorm.md), a [proposed shape](shape-brief.md), and [detailed research review](references/research-review.md). Application implementation needs a later request.

## What matters most

Ordinary click-to-filter has priority. A mark click should select immediately. Empty plot clicks should clear that chart’s filters. Configuration must not change the selected records on entry, dismissal, or acceptance. Do not delay clicks while waiting for a possible double-click.

Alt-click and tracing access can change. The user values filtering more than the present trace shortcut. Preserve access to explanations and source records, but test whether configuration deserves Alt/Option-click. A shortcut must have a visible alternative and a clear meaning on supported objects.

Prioritize settings changed during analysis. Fields, color, measures, aggregation, bins, time grain, ordering, and facets are strong candidates. Point size, opacity, display mode, and fits can matter during specific tasks. Formatting for publication has a different rhythm. Changing a palette or font often deserves a local route, but does not automatically deserve permanent space.

These frequency estimates are hypotheses. There is no supplied telemetry or user study. Rank a setting within its task and chart family. Frequent viewing does not prove frequent editing. A short session with actual analysis should change the ranking when the evidence disagrees.

Keep ownership visible. **Color by** on a point changes the chart encoding, not that record. Facet controls must say when all panels change. A shared palette editor must identify the shared scale and affected charts. Category legend clicks must retain their filtering role.

Provide the same useful task through pointer, keyboard, and visible touch controls. Search should help with many fields and long names. Menus should name actions; the focused editor should hold the choices. Keep the chart visible where practical, including when the editor opens inside chart details.

## Boundaries

Ground the design in documented mechanics from other tools. The research compares Tableau, Power BI, Qlik Sense, JMP, Origin, Excel, Grafana, and Datawrapper. These are examples across analysis and authoring workflows, not a measured ranking of product quality. Their mode, platform, persistence, and selection rules affect which ideas transfer.

Respect chart differences. Table sorting and header menus already use local interaction. Maps need navigation and layer controls. Composition has its own objects and scopes. A scatter menu must not replace those models. Keep useful title and axis editing, and use the full settings editor for complex or infrequent work.

Keep the first proof small. Reuse the existing chart write path, field metadata, and color-scale resolution. Avoid a universal command system or a broad renderer rewrite. Generic chart conversion, arbitrary point painting, and independent facet encodings stay outside the first proof.

Treat each proposed feature as incomplete without its docs and demo example. If Alt changes, update the full supported gesture convention in the same feature slice. Do not ship conflicting help for marks, axes, titles, and legends.

## What seems settled

The outcome and filtering priority are clear enough to shape without more questions. Local configuration should preserve filters, expose scope, and commit only accepted changes. Search and keyboard highlighting should not change chart state.

The current recommendation combines a visible encoding control with a shallow object menu. Both open the same small editor. Existing direct manipulation remains useful for titles and numeric axes. A focused full editor remains the fallback for the long tail.

This is a proposed direction, not approval to implement it. Alt remapping and permanent Color visibility remain experiments. The research supports trying them; it does not prove their value.

## Next step after confirmation

Build one local comparison for scatter Color, including points, bubbles, no current legend, and a shared-scale peer. Compare the existing settings route, visible selector, object menu, and optional Alt shortcut. Keep the smallest useful combination.

Observe discovery, action count, scope understanding, unchanged filters, and keyboard completion. Verify ordinary point selection first because static source inspection found a possible gap. The [shape](shape-brief.md) defines the decision rule and the work below the cut line.
