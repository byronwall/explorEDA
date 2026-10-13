# Product answers — October 12, 2026

Byron answered ten product questions from a review of the first shape. These answers supersede earlier text where they conflict. Answers are quoted as given.

1. **Color, or a pattern?** "I hinted at color, but I am interested in all properties."
2. **Recolor one chart repeatedly, or set color once per chart?** "I'd expect to color a chart 1-many times when it is first creatd. After that, I am less likely to change it."
3. **How often is Alt-click trace used?** "It's rare mainly because I am not using the tool for "real" projects. My main goal on teh tracing was to force a split between rendering and planning. Tracing was the mechanism to force the split."
4. **Live preview while browsing fields?** "That would be nice. Should probably consider it."
5. **What counts as accept?** "I prefer settings which does an instant accept with an easy undo."
6. **Which settings change most?** "idk yet, I am not using the tool for real. Typically the most common stuff is color, x, y and then the various fields being plotted."
7. **Join a shared color scale or get a new one?** "We should always default to the same color scale per varible. Eventually the user should be able to dupe and tweak separartely, but for now it should be a common color scale."
8. **How is a bad choice undone?** "Ideally you just do CTRL Z or CMD Z and it "just works" to undo the bad thing."
9. **Who is the first proof for?** "Me in the demo."
10. **What is done: switchable variants or one shipped design?** "idk, I don't understand the four variants framing."

## Consequences

- Scope covers editable roles — Color, X, Y, and the plotted fields — not Color alone. Scatter Color stays the first case, built as a role pattern the others reuse.
- The main moment is right after creation, when a chart is shaped through several quick changes. Later edits are rarer.
- Trace matters as an architectural boundary between planning and rendering. Its gesture is free to move. Alt-click no longer protects a frequent workflow.
- Choosing a field applies at once. Cmd/Ctrl-Z undoes it as one step. No Apply button. Live preview while browsing is worth trying.
- A field keeps one shared color scale everywhere. Duplicating a scale to tweak it separately comes later.
- The audience is Byron in the demo. No host opt-in design is needed yet.
- The switchable four-route comparison is dropped. Build one design, use it, and adjust.
