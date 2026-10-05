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

## Decisions and boundaries

**First proof:** A complete document renders distinct chart populations and explains a broken declaration.

**Try:** Apply two locally filtered charts, one calculated field, and one deliberately broken chart.

**Observe:** Usable charts render with correct populations. Every skipped effect has actionable feedback. The failed text remains repairable.

**Decide:** Continue when local filters stay local and partial output remains clear. Resolve silent constraint loss before expanding coverage.

Paste entry and file workflows remain provisional. Complex ordered records and empty values need non-JSON spellings. Global filters require separate main-app shaping.

[Likely DSL examples](detailed-shaping.md#likely-authoring) · [Implementation plan](implementation-plan.md)
