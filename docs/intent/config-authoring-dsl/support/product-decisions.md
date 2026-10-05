# DSL product decisions

Captured from Byron’s ten response annotations on 2026-10-03.

1. **Creation:** Prioritize quick dashboard creation by agents or humans over editing existing dashboards.

2. **Entry:** Prioritize agent-facing checking. Files are possible. A built-in editor starting from pasted text is a tentative entry option.

3. **Document meaning:** The document describes the final dashboard. Applying it replaces configuration rather than applying a diff.

4. **Identity:** Charts work without explicit names. Optional names can make authoring and references easier.

5. **Filters:** Chart filters restrict that chart for now. Consider adding global filters to the main app and DSL later.

6. **Defaults:** Use app defaults for omitted settings.

7. **Export:** Export DSL on demand after normal UI edits. Continuous text synchronization is unnecessary.

8. **Partial rendering:** Render as much as possible. Warn clearly about every broken part.

9. **Calculation failures:** Keep usable results visible. Explain failures with actionable warnings rather than failing the whole workflow.

10. **No JSON authoring:** Avoid JSON in DSL input and output. Verbose identity paths and setting names are acceptable.

Paste entry and files remain tentative. Global filters are a proposed follow-up, not a first-slice requirement. Native saved settings may still use JSON internally; the authored DSL must not require JSON.
