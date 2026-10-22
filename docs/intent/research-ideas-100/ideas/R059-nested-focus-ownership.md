# R059 — Keep focus and Escape predictable across nested editors

- ID: R059
- Category: Accessibility and interaction
- Priority: 12
- Kind: robustness
- Status: candidate
- Confidence: high
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

A chart can be expanded into a modal details view while also hosting a settings popover, field picker, inline axis editor, trace, or confirmation. The baseline already accounts for this: `PlotChartPanel.hasNestedLayer` yields Escape to nested layers, excludes tooltips, and restores focus when details closes. Tests cover cancellation and a second Escape while a confirmation exits. The remaining research question is whether this locally maintained ownership model remains understandable when actual pointer and keyboard sequences cross several editing surfaces.

Compare retaining the current DOM-based layer checks with a small shared overlay-ownership contract for the existing components. The current approach minimizes infrastructure and works with portaled components. A shared contract could make dismissal order explicit but risks becoming an unnecessary overlay framework. A third possibility is to remove a redundant nesting path so fewer layers can compete. The WAI-ARIA modal-dialog pattern provides a reference for containment and focus return; the proposed study should assess concrete user journeys rather than infer success from component library choices.

Use five scripts in a runnable follow-up: enter chart details, edit an axis, open a field picker, invoke a trace, and cancel deletion. Record focused elements and state after each Escape, including a tooltip visible at the time and an invoking control removed by the edit. Acceptance requires the innermost meaningful editor to close first, the draft to follow its documented commit or cancel rule, and focus to return to a sensible surviving control. Reject a shared contract if the current behavior passes and the proposed abstraction requires touching unrelated popovers.

This belongs to current-analysis-trust as bounded interaction evidence, not a claim that focus handling is absent. The packet contains useful tests but no executed browser result from this review; native focus, portals, and assistive technology remain material gaps. API impact should be internal, with no saved-state changes and no new dependency unless a reproducible issue demands one. Confidence is high that these flows are important and medium that refactoring is warranted. A successful investigation may preserve the existing code and document one small invariant that future editors must respect.

## References

- `packages/explorEDA/src/components/PlotChartPanel.tsx` — `hasNestedLayer`, `NESTED_LAYERS`, `PlotChartPanel`. Nested dismissal and focus return are explicitly implemented.
- `packages/explorEDA/src/components/__tests__/PlotChartPanel.test.tsx` — `closes details on a second Escape while the confirmation exits`, `keeps the chart when its delete confirmation is canceled`. Focused tests already protect cancellation paths.
- `packages/explorEDA/src/components/ActiveFilterStatus.tsx` — `ActiveFilterStatus`, `onCloseAutoFocus`. Filter editor focus has an explicit fallback anchor.
- `docs/intent/current-analysis-trust/intent-brief.md` — related intent; status and overlap are discussed above.
- [W3C WAI-ARIA APG: Dialog (Modal) Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) — primary source accessed 2026-10-20; used only for the comparison described above.
