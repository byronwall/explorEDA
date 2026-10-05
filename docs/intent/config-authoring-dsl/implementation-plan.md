# Compact config authoring — implementation plan

## Plan at a glance

Prioritize complete-document creation. First prove that local chart filters produce independent populations in the real app. Then add recoverable checking and actionable warnings. Add on-demand export and expand detailed setting coverage without JSON syntax. A minimal paste route is the provisional UI proof; file entry can reuse the compiler later.

This update prepares planning only. It does not change compiler or app behavior.

## Implementation strategy

Maintain TypeScript authoring code behind `compileDocument`. Accept text, host rows, catalog, and current app defaults. Return usable saved configuration, source diagnostics, and a clear completeness result. Native settings remain runtime authority after application.

Apply the document as the final configuration with one Undo checkpoint. Do not merge omitted values with existing settings. Generate IDs for unnamed declarations; named declarations are optional. Native validation protects emitted values without making every diagnostic stop the entire document.

Reuse native formula evaluation and chart rendering with real local rows. Prove chart-local restrictions through chart data preparation, separately from `CrossfilterWrapper` interactive linked dimensions. Do not create separate workspaces or duplicate the whole dataset just to simulate local filters.

Run `pnpm --filter exploreda build`, then `pnpm --filter demo dev --host 127.0.0.1 --port 5184`. Use invalid fixture documents for deliberate failure injection. No hosted model, credentials, or deployment is needed. Use focused tests, `pnpm check`, and frozen browser checks at 1280, 783, and 390 pixels. Add a minor changeset when package features are implemented.

## Milestone 1: A creation document renders independent chart populations

Implement flat parsing from the retained language notes. Bind sources, calculations, and anonymous charts. Build representative scatter, histogram, metric, and table settings from app defaults. Use verbose paths for detail. Add a minimal paste entry and Apply action.

Prove two chart-local filters against hand-counted rows. Introduce local population support at the native preparation boundary if missing. Keep normal interactive linked selection behavior intact. Compare output with equivalent native settings. Applying a second document must remove omitted charts and reset omitted settings to app defaults. Undo restores the prior configuration.

### Desired end state

- A complete creation document produces ordinary editable charts.
- Local configured filters restrict only their owning chart.
- Applying documents does not accidentally behave like a diff.

## Milestone 2: Broken parts remain visible and repairable

Recover at declaration boundaries and continue compiling independent parts. Attach locations, affected chart/field, cause, and repair suggestions to diagnostics. Preserve failed text in the entry surface. Render as much as possible and state whether output is complete.

Use native formula results to report row failure counts and examples. Skip dependent chart outputs when their required values cannot be evaluated. If an invalid optional setting falls back to its app default, report that substitution. Never ignore a broken filter and present a broader chart as correct.

Test one bad chart among valid charts, malformed declarations, cycles, unknown fields, division by zero, and empty results. An all-broken document shows an explicit repair state instead of crashing or claiming success. Verify warnings remain findable after application, and the agent-facing result contains the same information.

### Desired end state

- Usable charts render despite unrelated errors.
- Every omitted or changed effect has actionable feedback.
- Users can repair the source and recreate the intended dashboard.

## Milestone 3: Export reflects current UI edits

Export DSL on request from the current native workspace. Do not continuously synchronize an editor or preserve historical source formatting. Preserve chart settings, formulas, order, local filters, and meaningful empty values. Names remain optional. Use exact readable paths for uncommon settings.

Verify UI edit → export → compile → render with representative settings. Compare semantic values rather than generated anonymous IDs. Prove that exports contain no JSON blocks. File import/export may reuse this boundary once its UI is selected. Normal settings controls remain available.

### Desired end state

- Users export the dashboard they currently see.
- Recreated dashboards retain meaningful settings and populations.
- Export requires no continuously maintained text view.

## Milestone 4: Detailed paths cover the native settings surface

Build coverage from current chart definitions, root settings, fields, colors, aggregates, arrays, and geometry references. Include native regression settings when that initiative delivers them. Use flat paths and ordered records for complex structures. Do not add JSON escapes.

Run a bounded syntax spike with nested arrays, literal map keys, empty lists, empty strings, and missing values. Select one readable representation that round-trips those cases. Use verbose repeated records if a compact shorthand becomes ambiguous.

Verify current settings are effective through native fixtures and representative browser flows. Report unsupported fields without crashing unrelated outputs. Keep a coverage inventory so partial rendering cannot hide missing support.

### Desired end state

- Every supported setting has a readable route without JSON authoring.
- Full native coverage grows without false success for skipped effects.
- Saved results remain editable through normal controls.

## Open decisions and spikes

Paste entry and file workflows remain provisional. The complex-value syntax spike must establish ordered structures and empty-value semantics without JSON. Consider global filters as a main-app follow-up, with visible scope and clear operations, before adding DSL syntax for them.

## Below the cut line

Defer patch commands, mandatory stable names, continuous text synchronization, source joins, arbitrary code, a second formula engine, and hosted agents. Global filters remain a proposed follow-up, rather than part of the first local-filter proof. JSON authoring is rejected, not deferred.
