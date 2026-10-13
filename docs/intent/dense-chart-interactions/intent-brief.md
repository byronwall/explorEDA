# Change chart settings where the question arises

## My read

Make explorEDA faster to explore by putting frequent chart changes near the data or object that gives them meaning. An analyst should change a field, encoding, or analytic setting, then continue with the same selected records and chart context.

“Dense” means more useful work within reach. It does not require smaller targets or a menu with every setting. The aim is to reduce travel, searching, and interruptions during repeated analysis. A compact control should reveal both its current value and the scope of its effect.

The scope is every chart property an analyst changes often, not Color alone. Color, X, Y, and the other plotted fields come first. The motivating example — right-click a scatter point, choose **Color by…**, pick a field — is one route into that pattern. Scatter Color is the first case because it is small, but it is built as an editable role that X, Y, and the other field roles reuse.

The busiest moment is right after a chart is created. An analyst shapes it through one or several quick changes, then edits it less often. Local routes should make that first shaping pass fast, and stay available for later changes.

This initiative covers interaction design and its proof. The research delivery includes [seven approaches](brainstorm.md), a [proposed shape](shape-brief.md), and [detailed research review](references/research-review.md). [Product answers](raw/product-answers-2026-10-12.md) from October 12 settle several questions the first shape left open. Application implementation needs a later request.

## What matters most

Ordinary click-to-filter has priority. A mark click should select immediately. Empty plot clicks should clear that chart’s filters. Configuration must not change the selected records when it opens, closes, or applies. Do not delay clicks while waiting for a possible double-click.

Changes apply at once and undo as one step. Choosing a field is the commit; there is no Apply button. Cmd/Ctrl-Z in the demo restores the previous chart, including any color scale the change created. Previewing a field while browsing the list is worth trying, as long as the preview leaves no undo step and Escape restores the chart.

Tracing matters as a boundary between planning and rendering, not as a frequent gesture. Its Alt-click entry may move. Keep trace reachable from the header trace control and from a record action. Alt-click is then free for a better use, or none.

Prioritize settings changed during analysis. Fields, color, measures, aggregation, bins, time grain, ordering, and facets are strong candidates. Point size, opacity, display mode, and fits can matter during specific tasks. Formatting for publication has a different rhythm. Changing a palette or font often deserves a local route, but does not automatically deserve permanent space.

These frequency estimates are hypotheses. There is no telemetry or user study, and the tool is not yet in daily use for real projects. Rank a setting within its task and chart family. Real analysis should change the ranking when the evidence disagrees.

Keep ownership visible. **Color by** on a point changes the chart encoding, not that record. A field has one shared color scale; choosing it joins that scale, and the editor names it. Duplicating a scale to tune it separately comes later. Facet controls must say when all panels change. Category legend clicks keep their filtering role.

Provide the same useful task through pointer, keyboard, and visible touch controls. Search should help with many fields and long names. Menus should name actions; the focused editor should hold the choices. Keep the chart visible where practical, including when the editor opens inside chart details.

## Boundaries

Ground the design in documented mechanics from other tools. The research compares Tableau, Power BI, Qlik Sense, JMP, Origin, Excel, Grafana, and Datawrapper. These are examples across analysis and authoring workflows, not a measured ranking of product quality.

Respect chart differences. Table sorting and header menus already use local interaction. Maps need navigation and layer controls. Composition has its own objects and scopes. A scatter menu must not replace those models. Keep useful title and axis editing, and use the full settings editor for complex or infrequent work.

The first audience is Byron in the demo. Host opt-in, embedding conflicts, and per-host gesture settings wait until the design proves itself. Package changes still carry a changeset.

Keep the first proof small. Reuse the existing chart write path, host undo, field metadata, and color-scale resolution. Avoid a universal command system or a broad renderer rewrite. Generic chart conversion, arbitrary point painting, and independent facet encodings stay outside the first proof.

Treat each proposed feature as incomplete without its docs and demo example. If Alt changes, update the full supported gesture convention in the same slice. Do not ship conflicting help for marks, axes, titles, and legends.

## What seems settled

Local configuration preserves filters, shows scope, applies on choice, and undoes as one step. Visible role labels are the main route; a shallow object menu opens the same editor. Existing direct title and numeric-axis editing stays. The full editor remains the fallback for the long tail.

Build one design and adjust it through use. Do not build switchable variants to compare against each other.

## Next step after confirmation

Verify ordinary point selection first; static source inspection found a possible gap in unsized scatter selection. Then build scatter Color as an editable role, reached from a visible label and from the plot’s context menu, with a shared-scale peer chart and active filters. Extend the same role control to X and Y once Color works. The [shape](shape-brief.md) holds the details and the cut line.
