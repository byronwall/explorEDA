---
id: page-named-segments-and-more-ways-to-add-workspace-filters
label: Named segments and more ways to add workspace filters
type: page
status: planned
parent: page-retired-initiative-follow-ups
metadata:
  purpose: Below-the-cut filter work left after the workspace filter initiative retired on 2026-10-10.
---
Workspace filters shipped (#221, #223, #224): one linked filter per field that no chart owns, added from the active filter bar, saved with the view, and written as `filter` lines in dashboard text. See the feature inventory's [filter representations](docs/application-feature-inventory.md#filter-representations).

These were left below that initiative's cut line and are not built:

- **Named segments across saved views.** Save a set of workspace filters under a name and apply it in another tab. This also covers the "reusable filter collections" follow-up from the project and task views retirement.
- **Promote a chart filter or Rows search** to a workspace filter.
- **Field list and column header entry points** for adding a workspace filter.
- **Disable without removing** a workspace filter.
- **Several filters on one field, or OR combinations.** Today it is at most one workspace filter per field, combined with AND.

Each needs a concrete task before it is built. Keep the three kinds of filtering distinct: Rows-only filters and searches, a chart's own `where.` restriction, and linked filters.

