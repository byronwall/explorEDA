---
title: "Compact DSL redesign — shape brief"
slug: "compact-dsl-redesign"
phase: shape
status: draft
last_updated: "2026-10-11"
---

# Compact DSL redesign — what we are adding

**Outcome:** Dashboard text reads like a description of what the dashboard shows. It is short enough to review and exact enough to check. Composed graphics are written as nested, named parts.

**Primary flow:** An agent writes or exports text → `exploreda-dsl check` validates every key against the schema → a person reviews the diff, edits by hand, and runs `fmt` → the next export gives back the same text.

## Feature scope

```text
Dashboard text v2
├── PLANNED ADDITIONS
│   ├── Schema registry: one entry per chart type and composition node
│   │   ├── per key: word, type, default, allowed values, docs
│   │   └── drives compile, export, check, reference, and highlighting
│   ├── Defaults-aware export: writes only values that differ from
│   │   creation defaults, the theme, or an inference rule
│   ├── Brace syntax (whitespace never carries meaning)
│   │   ├── head on one line: kind [@name] [subject] key=value… [{]
│   │   ├── in a body: a key= line sets a parent property; a bare word starts a child
│   │   ├── leaf nodes need no braces; lists are repeated children
│   │   └── no indexes, `[]=`, `{}=`, `unset`, or `+` continuations
│   ├── Readable values: ISO dates, a..b ranges, #hex, Gentoo=#4b9688,
│   │   sum(field) aggregates, y=P10..P90 bands
│   ├── Composition nodes: title, subtitle, footnote, scale, unit
│   │   (repeat, label, inset, window), the marks, legend, note
│   │   ├── referenced by name: groups.occupations, groups[Professionals]
│   │   └── scales inferred from fields; text styles from role and theme
│   ├── Annotations as chart children: callout, rule, band, region
│   ├── Define once, place in views: a view is a layout, overrides, theme, and filters
│   ├── Placement: each chart by exactly one of
│   │   ├── layout matrix: `height: cells…`; cells split 12 columns evenly unless a cell
│   │   │   says `name:w` (D2);
│   │   │   repeat a name to widen it, repeat it on the next line to make it taller
│   │   └── at=x,y,w,h: always exact, for splits the matrix can't express
│   ├── `set path=value` escape hatch, which check reports as a registry gap
│   └── CLI: fmt (re-indent, canonical order, alignment, `--layout` converts at=
│       to the matrix where exact), check --json, reference <type>
└── LATER POSSIBILITIES
    ├── Editor completion from a registry-generated JSON Schema
    └── Notebook-block sync (notebook-analysis)
```

## Behavior

| Situation                                                                     | Expected result                                                                                                         |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| A setting equals its default or inferred value                                | Export omits it                                                                                                         |
| Unknown key or bad value                                                      | A diagnostic at the line and column with the nearest valid key; that key is skipped and the chart still builds          |
| Missing `}`                                                                   | A top-level keyword at column 0 closes the open block. The error points to where indentation suggests the brace belongs |
| A saved value with no registry word                                           | Export writes `set path=value`, and check warns about the gap                                                           |
| A chart is placed twice or not at all, or its matrix cells aren't a rectangle | An error naming the chart                                                                                               |
| Export of a layout                                                            | The matrix where it reproduces the grid exactly; `at=` only for the charts it can't                                     |
| `fmt` runs twice, or export runs on compiled canonical text                   | No change                                                                                                               |

## Examples

Not final syntax. There are six full conversions in `raw/proposed-examples/`. For scale, `middle-class-jobs` goes from 205 lines to 38, `forecast-fan` from 184 to 44, and `palmer-penguins` (four views) from 182 to 67.

```text
composition @jobs height=704 {
  title "The Changing Nature of Middle-Class Jobs" size=26
  scale @gap diverging=#1a8fd0,#e3173b center=#b9b9b9 max=100 {
    label="Share of women minus share of men, points"
  }
  unit @groups at=56,176 size=120x180 axis {
    repeat Group grid columns=5 gap=46 limit=10 order=max("Group order")
    label value=max("Group change") positive="+{} jobs" negative="−{} jobs"
    path  @occupations x=Year y="Jobs per 1000" series=Occupation color=gap("Women minus men")
    point @ends        x=Year y="Jobs per 1000" color=gap("Women minus men") radius=2.5
  }
  note "Registered\nnurses" on=groups[Professionals] at=.5,.656 offset=-62,-46 leader
}

view "Penguin field notes" {
  layout {
    5: size size species island      # 6 / 3 / 3
    4: bill mass flipper             # 4 / 4 / 4
    5: records
  }
}

view "Field report" theme=newsprint {   # 7/5 splits: the matrix can't, at= can
  size    at=0,0,7,6 title="Gentoo penguins are the heavyweights"
  species at=7,0,5,6 title="Adelie make up almost half the sample"
  bill    at=0,6,7,6
  mass    at=7,6,5,6
}
```

## Decisions and boundaries

**Appetite:** A complete language replacement covering every chart type and composition node, with all 57 examples round-tripping. The parser, compile, export, CLI, demo text panel, and docs page are rewritten in place. Old syntax isn't supported.

**Key decision:** Braces only, so pasted text always parses and `fmt` tidies it. There is no second, indentation-based syntax. The schema registry is the core move: one source for every key, diagnostic, and reference entry.

**Boundary:** Calculation formulas keep their current syntax. Every inferred value, including scales, theme text styles, implicit names, and label-derived titles, needs one rule that export can reverse exactly. Otherwise the value is written out. `set` keeps every setting reachable while the registry fills in.

**First proof:** Passed on 2026-10-11; see `raw/proof/results.md`. **Try:** Build the registry for scatter, row, and hist with a defaults-aware export, and run it across the corpus. In parallel, give a cold agent only a one-page brace-syntax reference and ask it to write the six example dashboards, including two compositions. **Observe:** How many pairs drop with every round trip still passing. How many agent drafts pass a hand check on the first try. Which composition settings needed `set`. What share of example layouts the matrix expresses exactly. **Decide:** Proceed if at least four of the six drafts are clean and `set` covers under 5% of composition lines. Otherwise widen the composition grammar before building the parser. If the matrix covers under about 80% of layouts, use `at=` as the export default instead.

See the [intent brief](intent-brief.md) and the [approach comparison](brainstorm.md).
