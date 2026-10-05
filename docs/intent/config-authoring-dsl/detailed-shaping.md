# Config DSL — detailed shaping

The goal is quick dashboard creation from readable text, usually written by an agent. People then use the normal settings UI.

**Add** means required product scope. **Proposed** means an interface or spelling to try. **Later** means a possible extension. The examples show likely authoring, not a released grammar.

## Feature tree

```text
Compact dashboard DSL
├── ADD: Create a complete dashboard
│   ├── The document describes the final dashboard configuration
│   ├── Apply all usable declarations as that configuration
│   ├── Omitted charts do not remain from a previous dashboard
│   ├── Omitted settings use app defaults
│   ├── Keep host-supplied source data
│   ├── Continue editing through ordinary settings controls
│   └── Undo an applied configuration
├── ADD: Readable, compact text
│   ├── One chart declaration per line for ordinary cases
│   ├── Named field roles, such as X, Y, and color
│   ├── Inline key=value settings
│   ├── Optional wrapping for long declarations
│   ├── No mandatory nested indentation
│   ├── Quoted names and labels when needed
│   ├── Optional chart names; anonymous charts work
│   └── Verbose setting paths accepted; no JSON escape blocks
├── ADD: Source and field contracts
│   ├── Optional source declaration
│   ├── Bind short aliases to exact source field names
│   ├── Optional display labels
│   ├── Inline expected types
│   │   ├── Number
│   │   ├── Category
│   │   ├── Date
│   │   └── Boolean
│   ├── Type checking distinct from explicit conversion
│   └── Direct field use when mapping is unnecessary
├── ADD: Chart definitions
│   ├── Common compact declarations
│   │   ├── Scatter
│   │   ├── Histogram
│   │   ├── Category/row chart
│   │   ├── Metric
│   │   └── Table
│   ├── Eventual coverage of all native chart families
│   ├── Titles and field choices
│   ├── Axes, scales, grids, and appearance
│   ├── Color and size mappings
│   ├── Facets and aggregation settings
│   ├── Layout position and size
│   └── New native settings, including regression when available
├── ADD: Calculations
│   ├── Define a named result from an expression
│   ├── Reuse results in charts, metrics, and filters
│   ├── Display labels, number formats, and precision
│   ├── Explain unknown fields and circular dependencies
│   └── Report row-level failures without stopping unrelated results
├── ADD: Chart-local filters
│   ├── Restrict only the owning chart's data population
│   ├── Numeric and date bounds
│   ├── Category/value selections
│   ├── Text conditions and supported missing-value selections
│   ├── Use calculated fields as filter inputs
│   ├── Make different chart populations readable
│   └── Keep configured restrictions distinct from linked brushing
├── ADD: Agent-facing feedback and repair
│   ├── Discover available fields, settings, and supported features
│   ├── Locate the broken declaration or setting
│   ├── Explain the cause and suggest a correction
│   ├── Render independent usable charts despite errors
│   ├── Warn about every skipped effect or default substitution
│   ├── Report affected rows and examples for calculation failures
│   ├── Never silently remove a broken population restriction
│   └── Keep an all-broken document available for repair
├── ADD: On-demand export
│   ├── Export the current dashboard after normal UI edits
│   ├── Recreate meaningful charts, calculations, filters, and layout
│   ├── Preserve ordered and empty values
│   ├── Emit readable detailed settings when shorthand is insufficient
│   └── No continuous text synchronization requirement
├── ADD: Detailed setting coverage
│   ├── Every native setting has a text authoring route
│   ├── Workspace layout and display settings
│   ├── Field metadata and formats
│   ├── Colors, aggregates, and geometry references
│   ├── Nested objects through explicit paths
│   └── Ordered complex values through non-JSON records
├── PROPOSED: Bring text into the site
│   ├── Start with paste
│   ├── Compact editor for checking and correcting pasted text
│   └── Possible file input/output using the same document
└── LATER: Follow-up possibilities
    ├── Global filters with matching main-app controls
    ├── Commands for targeted edits to an existing dashboard
    └── Integrated agent entry using the same authoring language
```

## Likely examples

All snippets use the flat direction from the research. Exact shorthand remains provisional. The archived checker does not establish the new chart-local filter behavior or complete-dashboard application.

### 1. A small dashboard without mappings or names

The supplied data has fields named `Revenue`, `Margin`, and `Category`.

```text
scatter x=Revenue y=Margin color=Category
hist Revenue bins=24
row Category
table Revenue,Margin,Category
```

This creates four charts with app defaults. No chart names or source scaffolding are needed. Applying it replaces the dashboard configuration.

### 2. Aliases, type expectations, and display labels

```text
source orders=salesRows
revenue:num=Revenue label="Revenue ($)"
cost:num=Cost
channel:cat=Channel

scatter x=revenue y=cost color=channel
hist revenue bins=24
```

`revenue` binds to `Revenue`. Its label affects display. `:num` checks the expected type; it does not silently convert values.

### 3. Calculations shared by charts

```text
source orders=salesRows
revenue:num=Revenue
cost:num=Cost
channel:cat=Channel

calc profit=revenue-cost
calc rate=revenue==0 ? null : profit/revenue
+ label="Margin" format=percent precision=1

scatter x=revenue y=profit color=channel
metric sum=profit
table revenue,cost,profit,rate
```

The calculations provide fields for several charts. The continuation line holds display settings for `rate`. Its fraction remains a fraction when displayed as a percentage.

### 4. Different populations in different charts

```text
scatter x=Revenue y=Profit where.Channel=Web
scatter x=Revenue y=Profit where.Channel=Store
metric sum=Profit where.Profit=0..
```

The first scatter uses Web rows. The second uses Store rows. The metric uses nonnegative profit rows. These restrictions do not intersect into one shared workspace population.

The range spelling `0..` comes from the prototype. Its intended chart-local effect is a new requirement. Interactive brushing remains separate.

### 5. Optional names and readable detailed settings

```text
scatter @margin x=Revenue y=Margin color=Category
+ title="Revenue and margin" size=3 opacity=.55
+ x.scale=symlog margin.left=64 xGridLines=6
+ at=0,0,6,5

hist Revenue bins=24 at=6,0,6,5
```

`@margin` gives the scatter an optional identity. `at` shows the proposed position and size shorthand. Detailed paths keep less common settings readable without JSON. The second chart remains unnamed.

### 6. A likely regression declaration

These setting names are a new proposal. They depend on native regression becoming available.

```text
scatter x=Revenue y=Margin color=Category
+ regression=polynomial regression.degree=2
+ regression.overall=false
```

The intended result is a second-degree fit per color group. If the chart is faceted, the same degree applies across its facets. An overall fit remains off. This illustrates the desired compactness without settling the final setting names.

### 7. A document with one broken chart

```text
hist Revenue bins=24
scatter x=Revenue y=MissingMargin
metric sum=Revenue
```

The histogram and metric should render. The scatter needs an explicit unavailable state. Feedback should identify `MissingMargin`, point to the declaration, and suggest a valid field when possible.

Fix the field and apply the complete document again. A partial result must not be presented as complete success.

## What still needs a concrete language example

Simple pairs and paths are the clearest part of the proposal. Ordered nested records, literal keys containing punctuation, empty collections, date bounds, and missing-value filters still need settled spellings. They must remain readable without JSON.

Paste entry and files remain provisional. Global filters need product support in the main app before the DSL can describe them. Source joins and a separate formula language are outside this scope.

Related documents: [intent](intent-brief.md), [shape](shape-brief.md), and [implementation plan](implementation-plan.md).
