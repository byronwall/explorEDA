# R058 — Make tracing practical on touch and pen input

- ID: R058
- Category: Accessibility and interaction
- Priority: 85
- Kind: robustness
- Status: candidate
- Confidence: high
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

Alt-click and Alt-Enter provide a consistent tracing convention, and `ChartTraceControl` already supplies an ordinary header button with a browsable object list and source-row finder. Touch users therefore have an existing access route, but direct inspection of a particular mark may require several steps. `BaseChart` and `ScatterSvg` also distinguish brushing from clicking and use pointer capture. The research problem is whether the delivered trace controls adequately serve touch and pen workflows, especially when a dense mark cannot be selected precisely or a hardware modifier is unavailable.

Compare improving the existing header trace browser with an explicit temporary trace-picking mode that turns the next tap into inspection. A contextual long press is a third alternative, but it may compete with scrolling, browser menus, and chart gestures. Preserve the product rule that ordinary mark activation selects, and avoid adding permanent Inspect buttons to marks. W3C's dragging guidance distinguishes a simple pointer alternative from keyboard access; use it as an evaluation reference, not as an untested compliance verdict about the current interface.

The first experiment is a touch walkthrough on a bar, a dense scatterplot, and a map at tablet width. Starting from a named mark, compare the steps and accidental filter changes needed to open its trace, inspect source rows, and return to exploration. Acceptance requires repeatable access without a modifier, no accidental brush or pan, and a clear exit from any temporary mode. Reject long press if it conflicts with ordinary platform behavior. Reject a new mode if the existing header browser, with better object search or focus, achieves comparable accuracy with less state.

This is a robustness investigation under current-analysis-trust and the repository's shared interaction rules. It does not expand the supported workspace into a phone-first editor. The lowest-cost result may be a trace-browser improvement or clearer touch guidance; a new mode would add pointer-state complexity and must be justified across chart families. Confidence is high that an input mismatch deserves direct observation, while no touch failure has been reproduced in this packet-only review. The evidence should establish one reliable route before adding specialized gestures that a single maintainer must support indefinitely.

## References

- `packages/explorEDA/src/components/charts/ChartTraceControl.tsx` — `ChartTraceControl`. Tracing already has an ordinary header trigger.
- `packages/explorEDA/src/components/charts/trace/ChartTracePanel.tsx` — `ChartTracePanel`. The inspector already offers object browsing and row lookup.
- `packages/explorEDA/src/components/charts/BaseChart.tsx` — `BaseChart`, `onPointerDownCapture`. Pointer gestures distinguish tracing and brushing.
- `packages/explorEDA/src/components/charts/ScatterPlot/ScatterSvg.tsx` — `ScatterSvg`, `onPointerCancel`. Scatter manages captured-pointer cancellation.
- `docs/intent/current-analysis-trust/intent-brief.md` — related intent; status and overlap are discussed above.
- [W3C WAI: Understanding SC 2.5.7 Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html) — primary source accessed 2026-10-20; used only for the comparison described above.
