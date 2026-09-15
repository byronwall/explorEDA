# Data Table Component

The Data Table component is a powerful and flexible table implementation that supports sorting, filtering, grouping, and pagination. It's designed to handle large datasets efficiently through virtual scrolling.

## Features

- **Sorting**: Click on column headers to sort data
- **Filtering**: Use column-specific filters with multiple operators
- **Grouping**: Group data by any column
- **Pagination**: Navigate through large datasets
- **Row Selection**: Select individual or all rows
- **Virtual Scrolling**: Efficient rendering of large datasets
- **Flexible sizing**: Adapts within the supported desktop workspace

## Usage

```tsx
import { DataTable } from "@/components/charts/DataTable";

const settings = {
  id: "my-table",
  type: "data-table",
  columns: [
    { id: "name", label: "Name", field: "name" },
    { id: "age", label: "Age", field: "age" },
  ],
  visibleColumns: ["name", "age"],
  pageSize: 10,
  currentPage: 1,
  sortDirection: "asc",
  selectedRows: new Set(),
  filters: {},
};

function MyComponent() {
  return <DataTable settings={settings} width={800} height={600} />;
}
```

## Props

### DataTable

| Prop     | Type              | Description                   |
| -------- | ----------------- | ----------------------------- |
| settings | DataTableSettings | Table configuration and state |
| width    | number            | Width of the table in pixels  |
| height   | number            | Height of the table in pixels |

### DataTableSettings

| Property       | Type                   | Description                     |
| -------------- | ---------------------- | ------------------------------- |
| id             | string                 | Unique identifier for the table |
| type           | "data-table"           | Component type identifier       |
| columns        | Column[]               | Array of column definitions     |
| visibleColumns | string[]               | Array of visible column IDs     |
| pageSize       | number                 | Number of rows per page         |
| currentPage    | number                 | Current page number             |
| sortBy         | string?                | Column ID to sort by            |
| sortDirection  | "asc" \| "desc"        | Sort direction                  |
| selectedRows   | Set<string>            | Set of selected row IDs         |
| filters        | Record<string, Filter> | Column-specific filters         |
| groupBy        | string?                | Column ID to group by           |

### Column

| Property | Type   | Description                      |
| -------- | ------ | -------------------------------- |
| id       | string | Unique identifier for the column |
| label    | string | Display label for the column     |
| field    | string | Data field name                  |

### Filter

| Property | Type                                                 | Description     |
| -------- | ---------------------------------------------------- | --------------- |
| value    | string                                               | Filter value    |
| operator | "contains" \| "equals" \| "startsWith" \| "endsWith" | Filter operator |

## Performance Considerations

1. **Virtual Scrolling**: The table uses virtual scrolling to render only visible rows, making it efficient for large datasets.
2. **Data Caching**: Filtered and sorted data is cached to prevent unnecessary recalculations.
3. **Optimized Re-renders**: Components are memoized to prevent unnecessary re-renders.

## Keyboard Shortcuts

- **Space**: Select/deselect row
- **Ctrl/Cmd + A**: Select all rows
- **Ctrl/Cmd + Shift + A**: Deselect all rows
- **Arrow Up/Down**: Navigate rows
- **Page Up/Down**: Navigate pages
- **Home/End**: Go to first/last page

## Troubleshooting

1. **Slow Performance**

   - Check if virtual scrolling is enabled
   - Reduce the number of visible columns
   - Consider increasing page size

2. **Filter Not Working**

   - Verify column ID matches filter key
   - Check filter operator is supported
   - Ensure data type matches filter value

3. **Sort Not Working**
   - Verify column is sortable
   - Check data type compatibility
   - Ensure sort direction is valid

## Examples

### Basic Table

```tsx
<DataTable
  settings={{
    id: "basic-table",
    type: "data-table",
    columns: [
      { id: "name", label: "Name", field: "name" },
      { id: "age", label: "Age", field: "age" },
    ],
    visibleColumns: ["name", "age"],
    pageSize: 10,
    currentPage: 1,
    sortDirection: "asc",
    selectedRows: new Set(),
    filters: {},
  }}
  width={800}
  height={600}
/>
```

### Table with Filters

```tsx
<DataTable
  settings={{
    id: "filtered-table",
    type: "data-table",
    columns: [
      { id: "name", label: "Name", field: "name" },
      { id: "age", label: "Age", field: "age" },
    ],
    visibleColumns: ["name", "age"],
    pageSize: 10,
    currentPage: 1,
    sortDirection: "asc",
    selectedRows: new Set(),
    filters: {
      name: {
        value: "John",
        operator: "contains",
      },
    },
  }}
  width={800}
  height={600}
/>
```

### Grouped Table

```tsx
<DataTable
  settings={{
    id: "grouped-table",
    type: "data-table",
    columns: [
      { id: "name", label: "Name", field: "name" },
      { id: "age", label: "Age", field: "age" },
    ],
    visibleColumns: ["name", "age"],
    pageSize: 10,
    currentPage: 1,
    sortDirection: "asc",
    selectedRows: new Set(),
    filters: {},
    groupBy: "age",
  }}
  width={800}
  height={600}
/>
```
