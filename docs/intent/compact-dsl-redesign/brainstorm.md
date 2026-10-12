---
title: "Compact DSL redesign — contrasting approaches"
slug: "compact-dsl-redesign"
phase: brainstorm
status: current
last_updated: "2026-10-11"
---

# Compact DSL redesign — contrasting approaches

Every option aims at the same thing: dashboard text that agents write and people review. It has to be readable, checkable, terse, and able to express composed graphics without index paths. Backward compatibility is off the table.

## Option 1 — Fix the export, keep the syntax

**Core move:** Diff each chart against the app's creation defaults instead of its bare head line, and drop `unset` and empty markers.

- **Makes easier:** Removes about 30% of exported pairs with almost no language change.
- **Main catch:** Composition stays a flat path dump, and the vocabulary split remains.
- **Best fit:** A first milestone, not an end state.

## Option 2 — One vocabulary from a schema registry

**Core move:** One table per chart type lists each key's short word, type, default, allowed values, and documentation. Compile, export, validation, and the reference all read from it. Export writes `x.title=`, never `xAxisLabel=`.

- **Makes easier:** Exact per-key diagnostics, and a reference that can't drift.
- **Main catch:** It doesn't fix nesting or composition on its own.
- **Best fit:** The foundation under any other option.

## Option 3 — Indented outline syntax

**Core move:** Keep `head key=value` lines, but children are indented lines instead of `+` continuations. A list is a set of repeated child nodes, never indexes. A token with `=` is a property; a bare first word starts a child node.

- **Makes easier:** Composition, annotations, and per-view overrides nest naturally. Adding a mark is a one-line diff.
- **Main catch:** Indentation errors, and the ambiguity between a continuation and a child.
- **Best fit:** Agent-written text with human edits.

## Option 4 — KDL document

**Core move:** Adopt KDL 2.0, a standard node language with arguments, properties, and `{}` children, and use an off-the-shelf parser.

- **Makes easier:** An external spec, exact grammar, and braces that make nesting unambiguous.
- **Main catch:** Agents know it less well, its quoting rules are strict, and it adds a dependency. Its tooling doesn't match ours.
- **Best fit:** If indentation proves unreliable for agents.

## Option 5 — YAML plus JSON Schema

**Core move:** Write the saved structure as YAML and validate it with a generated JSON Schema.

- **Makes easier:** Familiar syntax and editor completion for free.
- **Main catch:** About three times the lines, IDs and indexes come back, and YAML has implicit-typing traps.
- **Best fit:** Machine interchange, not review.

## Option 6 — TypeScript builder

**Core move:** `scatter("flipper", "mass").color("species")`, checked by `tsc`.

- **Makes easier:** The type checker supplies completion and validation.
- **Main catch:** It's code, not data. Running it in the browser is unsafe, export becomes code generation, and reviewers read program logic.
- **Best fit:** Library tests, not dashboard text.

## Option 7 — Grammar-of-graphics heads

**Core move:** Each chart is a one-liner encoding sentence, such as `scatter flipper_length_mm × body_mass_g by species` or `metric sum(Revenue)`.

- **Makes easier:** The densest possible text for simple charts.
- **Main catch:** A bespoke grammar for every chart type, two ways to say things, and no help for composition.
- **Best fit:** Borrow the aggregate calls (`sum(x)`), not the whole grammar.

## Option 8 — ASCII layout block

**Core move:** Place charts by name in rows: `5  size:6 species:3 island:3`. Remove `at=` from charts.

- **Makes easier:** Reading and changing the arrangement at a glance. Moving a chart doesn't touch the chart itself.
- **Main catch:** Charts that span rows, and irregular layouts, need an escape hatch.
- **Best fit:** Multi-chart dashboards and views.

## Option 9 — Composition sublanguage

**Core move:** `unit`, mark (`path`, `band`, `point`, and so on), `legend`, and `note` become child nodes, referred to by name. Scales are inferred from mark fields and declared only to override them. Text styles come from roles and the theme.

- **Makes easier:** Shrinks the 29 compositions dramatically and makes them reviewable.
- **Main catch:** It's the largest new grammar surface, and inference rules have to export back exactly.
- **Best fit:** Required. This is where most of the pain is.

## Option 10 — Define once, place in views

**Core move:** Charts and scales are declared once at the top level. A view lists a layout and per-chart overrides such as `species select=Gentoo` or `size title="..."`.

- **Makes easier:** The penguin example drops from four full copies to one plus deltas.
- **Main catch:** Readers must look up a chart's base definition, and export has to separate shared from per-view state.
- **Best fit:** Multi-view text.

## Contrast

Scores run from 0 to 10, where 10 is best.

- **Review legibility:** the share of lines a reviewer must read to know what is shown.
- **Composition reach:** whether units, marks, repeats, and insets can be written without indexes or IDs.
- **Diagnostic precision:** per-key schema checks, line and column, suggested fixes, and exact round trips.
- **Agent first-pass success:** one canonical spelling, a short reference, and few syntax traps.
- **Edit locality:** one change touches one line and renumbers nothing.
- **Terseness:** size of the 57-example corpus.

| #   | Approach                | Legibility | Composition | Diagnostics | Agent pass | Locality | Terse | Note                                         |
| --- | ----------------------- | ---------: | ----------: | ----------: | ---------: | -------: | ----: | -------------------------------------------- |
| 1   | Export fix              |          5 |           1 |           6 |          5 |        3 |     5 | Cheap win; composition untouched             |
| 2   | Schema registry         |          6 |           1 |           9 |          7 |        3 |     6 | Foundation; no nesting                       |
| 3   | Indented outline        |          8 |           7 |           7 |          7 |        8 |     7 | Nesting fixes indexes                        |
| 4   | KDL                     |          7 |           7 |           8 |          5 |        8 |     6 | Strict; less familiar to agents              |
| 5   | YAML + schema           |          5 |           5 |           9 |          6 |        6 |     2 | Verbose; IDs return                          |
| 6   | TS builder              |          5 |           8 |           9 |          6 |        6 |     6 | Code, not data; disqualified for in-app text |
| 7   | Encoding heads          |          8 |           2 |           5 |          5 |        5 |     9 | Too many grammars                            |
| 8   | ASCII layout            |          7 |           1 |           7 |          7 |        7 |     6 | Layout only                                  |
| 9   | Composition sublanguage |          6 |           9 |           7 |          7 |        8 |     8 | Biggest single payoff                        |
| 10  | Define once             |          6 |           2 |           6 |          6 |        7 |     8 | Multi-view only                              |

## Choice

**Choice:** A hybrid: 2 + 3 + 9 + 10 + 8, with 1 shipped first and the aggregate calls from 7. Update: Byron chose braces over indentation, taking the structure of option 3 with the braces of option 4 but not strict KDL quoting. Placement uses `at=` or a layout matrix.

**Why:** No single option scores well on both legibility and composition reach. The registry (2) gives diagnostic precision and one vocabulary. The outline (3) and composition sublanguage (9) give reach and edit locality. Define once (10) and the layout block (8) remove the remaining repetition.

**Watch:** Inference must export back exactly. This covers implicit scales, theme text styles, and axis titles that default to field labels. Each inferred value needs a single rule, and the 57-example round trip enforces it.
