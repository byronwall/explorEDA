# R057 — Choose a keyboard model for dense scatter exploration

- ID: R057
- Category: Accessibility and interaction
- Priority: 23
- Kind: follow-up
- Status: candidate
- Confidence: high
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

Keyboard support already exists in explorEDA: heatmap cells use a moving tab stop, and bubble scatter plots expose arrow-key traversal, Enter selection, and Alt-Enter tracing. In `ScatterSvg`, the keyboard point list is currently built for sized points and sorted by source ID. This is a concrete foundation, not an accessibility blank slate. The research question is whether that ordering remains useful for dense scatter exploration, and what equivalent model should guide a user through ordinary canvas points without thousands of tab stops.

Compare source-order traversal with spatial navigation that chooses the next point in the pressed direction. A third candidate is a small searchable list of plotted records synchronized with one visible focus marker. Source order is deterministic and easy to explain, but may jump across the plot. Spatial movement follows the picture but needs predictable tie-breaking for coincident points. The list helps a user seek an ID or value yet may separate navigation from visual relationships. All options must preserve current selection and tracing semantics.

Build a paper or isolated interaction prototype around sixty points containing two clusters, coincident records, and a sparse outlier. Ask keyboard users to find the outlier, compare nearby values, trace one coincident record, and return to the prior point after filtering. Acceptance requires complete reachability, stable focus after a plot resize, and no unbounded tab sequence. Reject spatial navigation if its ties or sudden jumps defeat a clear explanation; reject the list if it merely recreates the existing table without making the chart's relationships easier to inspect.

This is a focused extension of the existing interaction model and current-analysis-trust's keyboard evidence gap. No new chart type or framework is required. A later implementation should share a small navigation plan between SVG and canvas consumers rather than create DOM elements for every point. Confidence is high in the source boundary and medium in which alternative users will prefer. The study should report assistive-technology and dataset limits explicitly; inspecting keyboard handlers cannot establish accessibility success. Its value is a reusable, understandable navigation rule before dense modes accumulate inconsistent shortcuts.

## References

- `packages/explorEDA/src/components/charts/ScatterPlot/ScatterSvg.tsx` — `ScatterSvg`, `keyboardPoints`. Bubble navigation uses source-ID order and one SVG focus target.
- `packages/explorEDA/src/components/charts/Heatmap/Heatmap.tsx` — `Heatmap`, `moveFocus`. Heatmap implements roving cell focus.
- `packages/explorEDA/src/components/KeyboardShortcutsDialog.tsx` — `shortcutGroups`. Chart activation and tracing shortcuts are documented in the UI.
- `docs/intent/current-analysis-trust/intent-brief.md` — related intent; status and overlap are discussed above.
