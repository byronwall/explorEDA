---
title: "Compact DSL redesign — implementation plan"
slug: "compact-dsl-redesign"
phase: plan
status: draft
last_updated: "2026-10-11"
---

# Compact DSL redesign — implementation plan

## Plan at a glance

The first proof passed. A cold agent wrote clean brace syntax for 4 of 6 dashboards from a one-page reference, and both failures were gaps in the reference. No composition line needed `set`, and the layout matrix fit 83% of views. Details are in `raw/proof/results.md`.

The order builds the semantic layer before the syntax.

1. **M1** adds a schema registry and normalizes saved state before export, still in today's syntax. It ships on its own, removes 10–30% of exported text depending on decision D1, and gives every later milestone a shared source of keys, defaults, and docs.
2. **M2** replaces the parser with braces, `fmt`, and layout. Until M3, compositions are written through `set`, so every milestone leaves a complete, round-tripping language.
3. **M3** adds the composition grammar. Composition is where most of the pain is, so it comes next.
4. **M4** and **M5** add readable values, annotations, views, and the generated reference.

Pushback: the earlier "30% default noise" was mostly not an export bug. The demo builds charts from a house style that differs from the library defaults. Normalization alone recovers 9.5%. The other 21% needs a product decision (D1).

Each milestone is one stacked PR with a changeset. There are no external dependencies. The whole loop is local vitest over the 58 example views and the 7 authored analyses.

## Implementation strategy

- **First proof:** Done. See `raw/proof/`.
- **Primary seam:** The schema registry (`lib/dsl/schema/`). Each chart type and composition node has a typed table: key → text word, value type, default, allowed values, and description. Compile, export, check, highlighting, the generated reference, and the docs settings tables all read from it. It grows out of the exhaustive coverage tables in `settingKeys.ts` and replaces `CHART_SETTING_KEYS` and the docs `settingDescriptions`.
- **Second seam:** One AST (`lib/dsl/syntax/`) between text and settings. The parser produces nodes with spans, then lowering produces `SavedDataStructure`. Export lifts settings into nodes, and the printer writes text. `fmt` is parse followed by print.
- **Fast local loop:**
  - `pnpm --filter exploreda exec vitest run src/lib/dsl`
  - `pnpm --filter demo exec vitest run src/dashboardText.test.ts src/demos/analyses`
- **Size ratchet:** The measurement in `raw/proof/measure-corpus.test.ts.txt` becomes a committed demo test. It asserts that pair and line totals never grow and fails when they do.
- **Rollout and rollback:** There are no users, so the old syntax is replaced, not flagged. Each PR reverts cleanly. `set path=value` keeps every setting reachable while the grammar fills in.

## Milestone 1: Smaller exports from a schema registry

This proves that the registry can drive export and validation, without changing the syntax.

- **Change — Registry**
  - Build per-type tables from `settingKeys.ts`. Defaults come from `createDefaultSettings`, and descriptions move in from `docs/reference/settingDescriptions.ts`.
  - The exhaustiveness check keeps a compile error for any setting that isn't mapped.
- **Change — Normalized, single-vocabulary export**
  - Fill partial saved objects from type defaults before diffing. This is already proven: −9.5% with 58 of 58 views round-tripping.
  - Write registry words such as `x.title` and `bins`, never `xAxisLabel` or `binCount`.
  - Stop writing `unset` and `{}=`.
- **Change — Generated reference**
  - `DSL_REFERENCE`, the `exploreda-dsl reference` command, and the docs page render from the registry.
  - The docs gate keeps requiring a description for every setting.
- **Change — House style (D1)**
  - Apply the chosen option, then commit the size ratchet test.

### Desired end state

- All examples round-trip. Exported pairs are at or below 6,730, or at or below 5,200 if D1 adopts the house style.
- An unknown key gets a "did you mean" from the registry.

## Milestone 2: Brace syntax, `fmt`, and layout

This replaces the language in one step. Leaving `+` continuations and braces side by side would only add work.

- **Change — Parser and AST**
  - Head on one line, `{ }` bodies, `key=` lines inside a body, bare words for children, and `#` comments.
  - Recovery: a top-level keyword at column 0 closes any open block, and the error points to the likely spot of a missing `}`.
  - Flat nodes lower into today's compile path. compile.ts then moves onto the AST piece by piece.
- **Change — Placement**
  - A `layout { h: cells }` matrix with even splits plus optional `name:w` widths, and `at=`.
  - An override line `name key=…` works the same at top level and in a view.
  - It's an error when a chart is placed twice, not placed at all, or its cells don't form a rectangle.
  - Export writes the matrix where it's exact and `at=` otherwise.
- **Change — Printer and tooling**
  - `exploreda-dsl fmt` and `check --json`.
  - The demo panel's highlighter and Apply.
  - Settings with no grammar yet, including all of composition, export as `set` lines in a body.
- **Change — Migrate authored text**
  - Convert the 7 `demos/analyses/*.ts` texts and every DSL test fixture.

### Desired end state

- All 58 example views and 7 analyses round-trip in brace syntax.
- `fmt` is idempotent.
- Pasting a fragment with broken indentation parses identically.

## Milestone 3: Composition grammar

- **Change — Nodes**
  - `title`, `subtitle`, `footnote`, `scale`, and `unit` with `repeat`, `label`, `window`, and `inset`.
  - The marks: `path`, `point`, `band`, `span`, `strip`, `stack`, `summary`, and `rule`.
  - `legend` covering one or more marks, and `note`.
- **Change — Names, not IDs**
  - Nodes refer to each other by `@name` and paths such as `groups.occupations` or `groups[Professionals]`.
  - IDs are derived from names on compile, and existing IDs are kept as names on export.
- **Change — Inference, each with an exact inverse**
  - Scales come from mark fields.
  - Text styles come from role defaults (title 24/700, subtitle 13, note 10), and width from the artboard minus margins.
  - `orderField` defaults to the x field.
  - Calculations are written inline, as in `order=max("Group order")`.

### Desired end state

- All 29 compositions round-trip with no `set` lines.
- `composition.*` pairs drop by at least 40%. The proof found 26% structural and 14% style.
- `middle-class-jobs` is under 45 lines.

## Milestone 4: Readable values and annotations

- **Change — Values:** ISO dates instead of epoch milliseconds, `a..b` ranges, `Gentoo=#4b9688` color maps, and `#hex` colors.
- **Change — Aggregates:** `metric sum(F)`, `pivot values=…`, `group sum(F) by=G`, and `value=AGG` on row and bar charts, which lowers to a grouped summary.
- **Change — Annotations:** `callout`, `rule`, `band`, and `region` become chart children. The persistence round-trip test (`lib/annotations/persistence.test.ts`) moves to them.

### Desired end state

- No epoch values, indexes, or `[]=` appear anywhere in the exported corpus.
- The annotation round-trip test passes.

## Milestone 5: Define once, and the generated reference

- **Change — Views:** Charts are defined at the top level, and a view holds layout, overrides, theme, and filters. Export factors out state shared across views.
- **Change — Reference:** One generated page covers syntax, per-type keys, the formula grammar, and composition. The formula grammar was the cold agent's biggest failure.
- **Change — Re-run the proof:** A cold agent works from the generated reference on the same 6 briefs. The target is 6 of 6 clean, checked by `exploreda-dsl check`, not by hand.

### Desired end state

- The docs page, the CLI reference, and the demo panel all show the generated reference.
- 6 of 6 cold drafts pass `check`.

## Open decisions and spikes

1. **D1 — house style.**
   - **Option A:** adopt the demo's style as the library defaults (margin 16/24/44/62, 4 y gridlines, y grid on, rows 22/36, 20 bins). New charts would match the examples, and 21% of exported pairs disappear.
   - **Option B:** remove the house style from `dashboardSettings.ts`, so the examples render with library defaults.
   - I recommend A, because the examples are the designed look. Fallback: B.
   - **Decision needed before M1 merges.**
2. **D2 — `name:w` widths in the matrix.** They take coverage from 48 of 58 views to 58 of 58 at readable widths, and the cold agent reached for them. I recommend yes. Fallback: `at=` for uneven splits.

## Below the cut line

- Editor completion and a language server built from the registry.
- Notebook-block sync.
- Moving examples' axis titles into field labels. This is a data cleanup: renderers already fall back to the field label.
