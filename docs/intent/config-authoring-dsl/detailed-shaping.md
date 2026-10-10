# DSL — what we are adding

**Outcome:** An agent creates a dashboard from readable text. A person continues with normal settings controls.

**Primary flow:** Generate text → check → bring into site → render usable parts → repair warnings → export when needed.

## Feature scope

```text
Dashboard DSL
├── REQUIRED CAPABILITIES
│   ├── Complete-document creation
│   │   ├── Dashboard matches the document; not a diff
│   │   ├── Omitted charts disappear; omitted settings use app defaults
│   │   └── Keep supplied data; normal UI editing and Undo afterward
│   ├── Compact authoring
│   │   ├── Chart per line, explicit field roles, inline key=value
│   │   ├── Optional wrapping; no mandatory nested indentation
│   │   ├── Optional chart names; quotes for unusual names and labels
│   │   └── Verbose paths for detail; no JSON escape syntax
│   ├── Optional source contracts
│   │   ├── Alias → exact field; separate display label
│   │   ├── Expected number/category/date/boolean types
│   │   └── Direct names without mapping; explicit conversion distinct
│   ├── Chart coverage
│   │   ├── Common scatter, histogram, row, metric, and table declarations
│   │   ├── Eventual access to every native chart family and setting
│   │   ├── Titles, fields, axes, grids, scales, colors, sizes
│   │   └── Facets, aggregates, layout; new native regression when available
│   ├── Calculations
│   │   ├── Named expressions reused by charts, metrics, and filters
│   │   └── Labels, formats, precision; dependency and row-failure feedback
│   ├── Chart-local filters
│   │   ├── Numeric/date bounds, value selections, text conditions
│   │   ├── Supported missing-value selections and calculated-field inputs
│   │   └── Independent chart populations; distinct from linked brushing
│   ├── Checking and repair
│   │   ├── Discover fields, settings, and supported features
│   │   ├── Locations, causes, corrective suggestions
│   │   ├── Render usable parts; report every skipped or changed effect
│   │   └── Row counts/examples for formula failures; all-broken repair state
│   ├── On-demand export
│   │   ├── Current UI settings → readable document → recreated dashboard
│   │   └── Preserve formulas, filters, layout, order, and empty values
│   └── Detailed structures without JSON
│       ├── Workspace settings, field metadata, colors, geometry references
│       └── Explicit object paths and ordered complex records
├── PROPOSED ENTRY — INTERFACE NOT SETTLED
│   ├── Paste-started text editor for checking and repair
│   └── Possible file input/output
└── LATER POSSIBILITIES
    ├── Global filters with matching main-app controls
    ├── Targeted edit commands
    └── Integrated agent entry using the same language
```

## Behavior that defines the feature

| Situation | Expected result |
| --- | --- |
| Apply a document | Replace dashboard configuration; do not inherit omitted values from the old dashboard. |
| One chart is broken | Render independent usable charts and explain the unavailable chart. |
| Formula fails on rows | Report affected rows and examples; preserve valid results where possible. |
| A filter is broken | Do not silently drop it and show a broader population as correct. |
| Edit through normal controls | Export current settings when requested; no continuous text synchronization. |
| Need uncommon settings | Use readable paths and records; never require authored JSON. |

## Likely authoring

These examples use the implemented flat language. `exploreda-dsl reference` prints the full grammar.

### Start small: no names or mappings

```text
scatter x=Revenue y=Margin color=Category
hist Revenue bins=24
row Category
table Revenue,Margin,Category
```

Four charts, with app defaults. Applying this document removes other charts from the dashboard configuration.

### A fuller dashboard: mapping, calculations, filters, layout

```text
source orders=salesRows
revenue:num=Revenue label="Revenue ($)"
cost:num=Cost
channel:cat=Channel

calc profit=revenue-cost
calc rate=revenue==0 ? null : profit/revenue
+ label="Margin" format=percent precision=1

scatter @web x=revenue y=profit color=channel
+ where.channel=Web title="Web orders" at=0,0,6,5
+ x.scale=symlog margin.left=64 xGridLines=6
scatter x=revenue y=profit where.channel=Store
+ at=6,0,6,5
metric sum=profit where.profit=0..
table revenue,cost,profit,rate
```

The scatters use separate Web and Store populations. The metric uses nonnegative profit. `@web` is optional. `:num` checks type; percent formatting changes display. Exact wrapping and layout shorthand remain provisional.

### Regression: likely wording for future native options

```text
scatter x=Revenue y=Margin color=Category
+ regression=polynomial regression.degree=2
+ regression.overall=false
```

These settings use native regression: a degree-two fit per group, with shared parameters across facets.

### Broken input: keep usable charts

```text
hist Revenue bins=24
scatter x=Revenue y=MissingMargin
metric sum=Revenue
```

Render the histogram and metric. Identify `MissingMargin`, locate the declaration, and suggest a valid field. Keep the failed text repairable. Report partial output clearly.

## Boundaries and open choices

**Settled syntax:** Every saved setting is a flat path: `xAxis.scaleType=symlog`, `columns.0.width=140`, `fields[]=Region,Channel`. `key[]=` is an empty list and `key{}=` an empty object. `key=unset` restores the default, `key=null` is missing, quoted text is always text, and quoted segments hold dots and spaces. Dates bound filters as `where."Order Date"=2024-01-01..`; missing values filter as `where.field=null`. Color scales, grouped summaries, and the Rows view use `scale`, `group`, and `rows` lines. Exports of every demo example rebuild exactly. One text holds every saved view: shared definitions come first, and each `view "Name"` line starts a section with its own grid, Rows view, and charts.

**Entry:** The demo hosts a paste-started Dashboard text panel, and `exploreda-dsl check` reads files. The package exports the compiler, not the panel. Global filters require main-app support and separate shaping.

**Outside this scope:** Source joins, a new formula language, and mandatory live text synchronization. Native JSON can remain an internal saved format.

[Intent](intent-brief.md) · [Shape rationale](shape-brief.md) · [Implementation plan](implementation-plan.md)

[Supporting references](support/references.md)
