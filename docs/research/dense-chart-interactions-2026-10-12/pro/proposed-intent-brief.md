# Change the chart where the question arises

## Outcome

Analysts should be able to change a chart’s meaning close to the data, then continue exploring the same records without losing their place. Frequently changed fields, measures and analytical controls deserve short, understandable routes. Density means spending space on data while keeping useful actions within reach; it does not mean smaller targets, an invisible interface or a context menu containing every setting.

Ordinary click-to-filter is the priority. A point, bar or category that selects records should continue to do so immediately. Opening configuration must not first select a chart, filter a record, clear a cohort or wait to discover whether another click follows. The existing linked workspace remains the experience around which configuration is designed.

Alt-click and tracing access are open to change. The valuable part of tracing is the ability to explain a mark and reach its source records, not the current modifier convention. A different route should be adopted only when it improves repeated analysis and leaves inspection reachable without changing the selected population.

## What should become easier

The next exploratory question often changes a field or measure: compare another pair, separate groups by color, size observations by a quantity, switch count to a meaningful measure, adjust bins or time grain, or compare groups through facets. These actions should not require repeatedly navigating unrelated settings. Their controls should say what changes and which chart, series or shared definition owns that change.

Cosmetic changes have a different rhythm. Choosing a palette, adjusting typography or constructing a detailed annotation may matter greatly while preparing an analysis, but need not occupy the shortest path throughout exploration. The full settings editor remains appropriate for complex and infrequent work. The goal is not to replace it with many smaller copies.

The chart families should retain their differences. A table header already has useful local actions. A map has layers and a geographic view. A pivot has measures and grouping fields. Composition has templates, named scales and repeat overrides. Configuration should follow those objects rather than impose a scatter menu everywhere. Existing [title and axis editing](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/InPlace/useAxisEditing.tsx) and [Composition object navigation](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/Composition/CompositionQuickMenu.tsx) provide foundations to keep.

## Proposed direction

Combine a few visible encoding controls with shallow, scoped object menus. Both open the same focused editor. A visible control supplies discovery and a reliable keyboard/touch route; a menu supplies contextual vocabulary without permanent clutter. Existing direct manipulation remains where its meaning is unambiguous, such as a numeric axis ruler or a chart title.

For example, right-clicking a scatter point could offer “Color by… (all points)”. Choosing it opens field search directly, with the chart and all-facets scope named. It changes the chart’s color encoding, not the clicked record. A separate record section offers tracing. A Color control reaches the same picker even before a legend exists. This example is a first proof of the approach, not a specification that every setting belongs on a point.

The preferred modifier experiment gives Alt/Option-click to configuration. On the first scatter proof it opens Color directly; supported objects can later lead to their own compact controls. Traces move to explicit object-menu actions and the existing header browser. Keeping Alt for trace remains an alternative if the new route provides little benefit or makes inspection hard to find. A production change must update the whole supported convention rather than leave contradictory instructions across titles, legends and marks.

## Behavior that makes the direction trustworthy

Search and keyboard highlighting do not change settings. Explicitly choosing a field commits one meaningful edit. Continuous controls can preview valid values, with a clear commit boundary and Escape restoring the starting values. Cancelling a local editor must not revert unrelated filters or changes made elsewhere. The existing [chart edit transaction](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/InPlace/useChartEdit.ts) is a foundation, not permission to roll back the entire workspace.

Color needs especially clear ownership. Assigning a field changes this chart, but editing a shared palette can change several charts. A shared color editor should name the scale and affected charts before an edit. Category legend clicks continue filtering. Missing values, calculated fields and long field names remain understandable; hundreds of fields call for search, not a large nested menu.

Compact editors should stay near the chart when space allows, and keep their owner, search and dismissal reachable when space is tight. Keyboard users must complete the same task without pointer coordinates. Touch users need a visible action without hover or long press. Local configuration must coexist with brushing, chart dragging, image export and nested editors in chart details.

## Boundaries and first decision

Keep React, the saved-data model and the shared settings write path. Do not introduce a universal command framework, global formatting mode or broad renderer rewrite to prove one useful route. Generic chart conversion, arbitrary per-record paint and independent facet bindings do not become requirements simply because a menu could name them.

First compare a visible Color selector alone against that selector plus the object menu. Then test the Alt experiment with replacement trace access. Preserve the active filters, shared-scale peers and chart context throughout. A simpler route that is equally discoverable and successful should win. Documentation and a focused demo accompany the first user-visible addition, including the gesture convention if it changes.
