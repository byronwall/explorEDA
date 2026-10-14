# Dense chart configuration — proposed shape

## Outcome

Change frequently used chart encodings close to the data while ordinary mark clicks continue to filter immediately. Keep the analyst’s cohort, chart context and ability to trace a result intact. Use the smallest combination that proves useful, rather than treating a menu or modifier as the goal.

## Primary flow

Open Color from a visible chart control, or right-click a scatter point and choose **Color by… (all points)** → search the available fields → explicitly choose one → chart and inline legend update in one meaningful edit. The owner reads **This chart · all facets**. No selection changes while entering or completing this flow.

The same picker works with no current color field or legend. None removes the binding. A separate record-menu action opens a trace without filtering it. The existing full settings route remains available.

## Capabilities

```text
Dense chart configuration
├── PLANNED FOR THE FIRST LOCAL PROOF — not yet accepted implementation
│   ├── One scatter Color task
│   │   ├── Points and bubbles; categorical, numerical and existing computed fields
│   │   ├── Visible Color trigger, including Color: None
│   │   ├── Shallow object menu; separate chart and record sections
│   │   └── One searchable picker reused by every entry
│   ├── Safe state and input boundaries
│   │   ├── Open/search/highlight do not write; explicit acceptance commits
│   │   ├── Existing scale reuse or creation plus chart binding is one operation
│   │   ├── Ordinary clicks filter; ordinary drags keep brushing
│   │   └── Escape, focus return, native menu access and export remain correct
│   └── Same-slice explanation
│       ├── Scatter, Color, In-place editing and Chart settings docs
│       └── Focused dense-chart-controls demo plus filtering regressions
├── EVALUATE BEFORE ADOPTION
│   ├── Selector alone versus selector plus object menu
│   ├── Alt/Option-click configuration versus current tracing shortcut
│   │   └── Replacement trace menu/header access before any remap ships
│   └── Persistent Color visibility versus focus/hover reveal, visible on touch
└── LATER, ONLY AFTER THE FIRST TASK EARNS IT
    ├── Field roles, measures, bins, time grain, sort and Top N
    ├── Size/display/fit controls and explicitly shared palette editing
    ├── Chart-wide facet controls and annotation commands
    └── Specialty-specific entry points using their current editors
```

## Behavior examples

Right-clicking an overlapping point cloud still permits chart Color without choosing a record. Tracing asks for a logical record only when needed. A target that becomes stale after source replacement closes or revalidates rather than silently choosing another row.

Searching fields then pressing Escape leaves chart settings and shared scales unchanged. Choosing a new field may create a shared scale; hold host notifications before that creation, then write the binding and release once. Chart-only cancel does not provide shared-scale rollback. The first proof excludes palette preview and shared-color mutation.

At 1280 px, prefer an anchored popup beside the plot; at 783 px, use collision-aware placement without altering saved layout; at 390 px, use a compact lower editor with visible chart ownership and reachable dismissal. These are robustness checks, not a promise of complete mobile authoring. Keyboard and touch-visible actions do not depend on Alt or long press.

## Decisions and boundaries

Preserve [the chart write path](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/providers/DataLayerProvider.tsx) and reuse [field selection](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/FieldSelector.tsx), [color-scale resolution](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/hooks/useColorScales.ts) and [in-place transactions](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/InPlace/useChartEdit.ts). The current ComboBox needs a small presentation seam to open search directly and remain inside a details dialog. No new saved setting or dependency is required by this shape.

Establish the unsized scatter click discrepancy with real input before adoption. Do not solve it with a click delay or an edit-selection mode. Preserve specialized axis/title/table/Composition handlers and the chart image-menu footer. Defer general command infrastructure, chart conversion, X/Y swap, independent facet bindings and a renderer rewrite.

Two product judgments remain: whether Alt configuration earns the trace-convention change, and whether persistent Color visibility earns its space. A local experiment may isolate a remap; a release must not advertise conflicting Alt meanings on supported objects. The new route ships with its docs and demo, or does not ship.

## Try → Observe → Decide

**Try:** a visible Color selector and the scoped menu on one filtered scatter with a shared-scale peer; then the Alt variant with replacement trace access. **Observe:** unaided discovery, scope interpretation, input/correction counts, unchanged filters, one accepted checkpoint, keyboard/touch completion and retained context. **Decide:** keep the smallest route that succeeds; reject menu or modifier complexity that adds no meaningful benefit over the selector alone.
