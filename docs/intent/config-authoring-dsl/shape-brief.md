# Compact config authoring — shape

## Recommendation

Build an agent-facing compiler for complete dashboard documents. Prove it through a small paste entry in the demo. Keep paste entry provisional; the compiler also supports future file input. Use native runtime state after application, with on-demand DSL export.

## Problem and appetite

Agents need to create dashboards quickly. People need readable results, useful warnings, and ordinary settings controls afterward. Start with one representative creation flow. No calendar budget was supplied. Editing commands and continuous text synchronization are secondary.

## Core shape

The host supplies rows and a source catalog. Parse flat chart declarations and detailed paths without required names or indentation. Omitted settings use app defaults. Applying a document replaces dashboard configuration, rather than retaining unspecified charts or values. Use a settings checkpoint for Undo.

Return diagnostics and usable configuration together. Recover at declaration boundaries. Render independent valid charts and identify unavailable declarations. A malformed optional setting may use its app default with an explicit warning. An invalid field, formula dependency, or filter cannot become a silent successful chart. Keep the failed source editable.

Use native formulas. Report row failures with counts, examples, locations, and corrective guidance. Preserve valid calculated values where native semantics permit. Do not invent values for failed rows.

Treat DSL chart filters as local population restrictions. Keep them separate from interactive linked selections. Shared workspace filters are a later main-app proposal. The native data path must support both meanings explicitly before claiming filter correctness.

Export current workspace settings on demand. Use verbose paths when shorthand is inadequate. Design flat object paths and ordered repeated records for complex values; confirm their syntax through representative examples. Never emit a JSON escape block.

## Current fit

Reuse `SavedDataStructure`, chart defaults, `saveDataUtils`, `CalculationState`, and the public `ExplorEda` component. `CrossfilterWrapper` applies chart dimensions to shared filtering; attaching local DSL restrictions there unchanged would violate intent.

Port useful parsing and source locations from the prototype. Replace its patch-centric output, JSON escapes, and all-or-nothing application boundary. Keep native validation on each emitted unit. Native JSON remains an internal storage format, not authored DSL.

## How to make this go better

- **Prove local filter isolation first.** Compare two chart populations before building broad grammar coverage.
- **Create from defaults.** A complete document must not accidentally inherit a previous workspace.
- **Recover visibly.** Pair every skipped declaration or substituted default with an actionable diagnostic.
- **Keep names optional.** Generate IDs for anonymous charts without requiring text maintenance after manual edits.
- **Export on demand.** Rebuild readable text from native state without a second runtime authority.
- **Prove complex values without JSON.** Test ordered arrays, literal keys, and empty values before promising full coverage.

## First proof

Paste a document with one calculated field, two charts with distinct local filters, and one broken declaration. Render the valid charts over real deterministic rows. Check each population independently. Show the broken declaration’s location and repair advice. Fix it and apply the complete document again.

Pass if all usable charts render, no local filter changes another chart’s population, and warnings expose every skipped effect. Fail if the renderer silently broadens a broken filter or claims complete success for a partial result.

## Rabbit holes and no-gos

Avoid a second formula engine, joins, hosted agent infrastructure, mandatory chart naming, live comment-preserving text synchronization, and JSON escape syntax. Global filters require main-app design before DSL exposure.

## Serious alternative

Start with the compiler and fixture tests alone. This reduces UI work, but cannot prove that warnings and local populations make sense to users. A minimal paste route gives that evidence without committing to a full editor.

## Plan handoff

Prove creation and chart-local filtering, then recovery and repair, then on-demand export and full-setting coverage. Keep the native app editable throughout. Global filters remain a proposed follow-up.
