---
title: "Schema diagram that shows what the analyses use — shape brief"
slug: "schema-diagram-focus"
phase: shape
status: draft
last_updated: "2026-11-27"
---

# Schema diagram — what we are adding

**Outcome:** You open the Schema diagram and read one screen at normal zoom. It shows how the sources relate and what each analysis reads, and the rest of the project fits in a compact list.

**Primary flow:** Click **Tables and links** or the Schema button → the whole project at 100%: used tables, the views that read them, and an "Not used by any analysis" list → choose an analysis to light up its path → open an unused table if you want it.

## Feature scope

```text
Schema diagram
├── PLANNED ADDITIONS
│   ├── Condensed first screen
│   │   ├── A query that only reads one table draws no card; its glyph sits on the table header
│   │   ├── Tables no analysis reads collapse into one "Not used by any analysis" list of one-line rows
│   │   ├── Click an unused row to open it as a full card; click again to close it
│   │   ├── Used tables keep every field; fields an analysis reads are marked
│   │   └── Every view card starts folded to one row per chart
│   ├── Readable fit
│   │   ├── Opens at 100% on the whole project, not at 60% focused on one source
│   │   ├── Columns are chosen to fit the drawer width; overflow scrolls down only
│   │   └── The details panel opens on a click, not when the diagram opens
│   ├── Coverage in the diagram
│   │   ├── Each used table header names how many analyses read it, with the names on hover
│   │   ├── Choose an analysis (from its view card, or a list in the diagram header) to light up its tables, fields, and lines and dim the rest
│   │   └── A schema icon on each analysis and notebook row in the rail opens the diagram with that analysis lit
│   └── Coverage grid
│       ├── A "Coverage" tab in the drawer: sources down, analyses across, a dot where one reads the other
│       └── Click a dot or an analysis column to go back to the diagram with that analysis lit
└── LATER POSSIBILITIES
    ├── Provenance beyond the file path in the hover card (for example, "made by placement-model.py")
    ├── "Derived from" lines between sources
    └── A separate, smaller drawing for one analysis
```

## Behavior

| Situation                                                  | Expected result                                                                                         |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| CI project (15 tables, 7 views) opens in a 1,500 px drawer | Everything at 100%, no horizontal scroll: 5 used tables, 7 folded views, and a list of 10 unused tables |
| Used content is taller than the drawer                     | The diagram scrolls down; columns never run off to the right                                            |
| A query has real steps (filter, lookup, group)             | It keeps its card, as today                                                                             |
| An analysis is lit, and you select a field                 | The field trace replaces the light-up; Escape clears both                                               |
| A project has no views                                     | No table counts as unused; all tables draw as today, in the new fit                                     |
| A single-table `ExplorEda`                                 | Unchanged except for the 100% fit                                                                       |

## Decisions and boundaries

**Appetite:** One focused stack of three or four PRs, mostly in `lib/schema` and `SchemaDiagram.tsx`. There is no new data model and no change to project text.

**Key decision:** Condensing is a drawing step, like the existing `compactViews`, not a change to `projectSchemaGraph`. The hover card's "used by" (`sourceUsage`) reads the full graph, so it does not change. Lines from views already start at table fields, not at the one-step query card, so removing that card keeps every usage line.

**Boundary:** Relationships for file sources are a separate initiative. That work covers agents declaring them, which Byron rates as more useful, and suggestions from matching keys for CSV files. This diagram already draws accepted and suggested links. Provenance stays in the hover card. Editing works as today, but full-model editing gets no new work.

**First proof:** **Try:** the condensed graph plus the 100% fit, on the CI project. **Observe:** a screenshot at 1,512 px and at 1,280 px, and a check that every visible label is drawn at scale 1 with no horizontal overflow. **Decide:** if it fits at 1,280 px, go on to coverage. If not, shrink the column gap and set the unused list as a strip under the columns before adding anything else.

**Open choices:** None blocking. The analysis picker (view card click or header list) is a default to try, and Byron will judge by feel.

See [intent-brief.md](intent-brief.md) and [implementation-plan.md](implementation-plan.md).
