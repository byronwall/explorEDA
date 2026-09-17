# Data table

The table provides sorting, search, column filters, column resizing, and CSV export.
All matching records remain available through one scroll area. The header and first column stay visible.
Search and export sit in the chart header. In Rows, they sit beside the view tabs.
Open the search icon to search or clear the table.
Rows have a fixed height of 30 pixels. The table renders the viewport plus twelve extra rows.

The dashboard table applies column filters to linked charts. Search applies only to the table.
The Rows tab shows all fields in one viewport. Its search, sort, and column filters apply to that view.
Switching tabs preserves its controls and does not change the dashboard layout.

Create settings with `dataTableDefinition.createDefaultSettings(layout)`, then set `columns`.
Each column needs an `id` and a `field`. Set `width` to choose its initial pixel width.
Pass `width` and `height` to `DataTable`. Use `onSettingsChange` and `rows` for a local data view.
Pass a header element as `toolbarTarget` to place compact tools there. Without it, tools render above the table.

Use Tab to reach column controls. Enter sorts a column or opens its filter.
Focus the scroll area to use the browser's arrow, Page Up, Page Down, Home, and End keys.
CSV export includes every matching row, including rows outside the viewport.
