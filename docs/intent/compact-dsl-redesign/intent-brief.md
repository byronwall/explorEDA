---
title: "Compact DSL redesign"
slug: "compact-dsl-redesign"
phase: shape
status: draft
last_updated: "2026-10-11"
---

# Compact DSL redesign

## My read

Dashboard text, the "compact" DSL, should be the best way to write down an explorEDA dashboard. Today it isn't. It round-trips exactly, but what it exports reads like serialized settings, not like an author's description. Composed graphics are the worst case: `chart composition` has no text form of its own, so it falls back to flat JSON paths such as `composition.elements.3.marks.0.xScaleId=n-1`.

The goal is a new language that agents write and people review and edit. A reviewer should be able to read a dashboard and see what it shows. An editor should be able to change one thing by changing one line. An agent should be able to write it from a short reference and get exact, actionable feedback when something is wrong. Nobody uses the current syntax yet, so we can break it.

## What matters most

- **Readable when reviewed.** Every line carries meaning. Defaults, generated IDs, and storage encodings stay out.
- **Composition is first-class.** Units, marks, repeats, insets, scales, legends, and notes nest and refer to each other by name.
- **Checkable.** Each key is validated against a schema, problems point to a line and column and suggest a fix, and round trips stay exact.
- **Terse without being cryptic.** Common things are short, and rare things are still possible.
- **One canonical form.** Agents and humans settle on the same spelling, and a formatter enforces it.

## The experience you appear to want

An agent drafts a dashboard, or edits one, as text. `exploreda-dsl check` reports what will be built and what is wrong. A person reads the diff in review and understands every change without opening the app. They tweak a title, move a chart, or add a mark by hand, and the next export gives back their text, formatted the same way.

## Boundaries

### Must be true

- Text describes the whole saved state, and the round trip is exact for every demo example, including all 29 compositions.
- One schema drives compile, export, validation, and the reference, so the documentation can't drift.
- Every saved setting has a home, even if that home is an explicit escape hatch.
- Partial builds still work: a bad line is skipped with a diagnostic and the rest builds.

### Must be avoided

- Numeric list indexes, synthetic cross-reference IDs, and `[]=` or `{}=` markers in authored text.
- Exporting values the app would supply anyway.
- Two vocabularies for one setting, such as `x.title` and `xAxisLabel`.
- Running code to describe a dashboard.

## What seems settled

- Backward compatibility isn't required. The current syntax, examples, and docs can all change.
- The DSL stays text-first and line-oriented, so diffs stay reviewable.
- Calculation formulas keep their existing expression syntax.

## Possibilities, not decisions

- Nesting uses braces; whitespace carries no meaning (decided).
- Placement by `at=` or an even-split layout matrix (decided).
- Defining a chart once and placing it in several views.
- Aggregate call syntax such as `sum(Revenue)` in chart heads.
- Inferring composition scales from mark fields.

## Current reality that matters

I exported all 57 demo examples (`raw/current-exports/` has six of them), giving 5,031 lines and 7,474 `key=value` pairs:

- **About 30% is default noise.** `xAxis{}=`, `xAxis.grid`, `yGridLines=4`, and four `margin.*` keys appear on about 215 charts each. Export diffs each chart against what its short head line builds, not against the app's creation defaults (`lib/dsl/export.ts`).
- **About 44% is flat composition paths.** In `middle-class-jobs`, one composition takes 180 continuation lines. Text styles that are really theme defaults repeat on every element.
- **The vocabulary is split.** The reference teaches `x.title`, `x.min`, and `bins=`, but export writes `xAxisLabel`, `xAxis.min=unset`, and `binCount`.
- **There is repetition across views.** The penguin example restates the same scale and the same four charts in full in each of its four views.
- **Storage encodings leak.** Dates appear as epoch milliseconds (`from=1717200000000`), color scales use `mapping.0[]=Adelie,"#3479a8"`, and records use `attach.keyFields[]=Day`.
- **Wrapping is arbitrary.** Pairs are packed into 64 columns, so unrelated keys share a line, as in `...color="#5f6368" composition.scales[]=`.
- Compile, diagnostics, the `exploreda-dsl` CLI, and the demo's Dashboard text panel all exist and are reusable. Only the language and the export strategy need to change.

## Next step after confirmation

I've already compared the options ([brainstorm](brainstorm.md)) and recommended a shape ([shape brief](shape-brief.md)). Next is an implementation plan whose first milestone is the schema registry and a defaults-aware export.
