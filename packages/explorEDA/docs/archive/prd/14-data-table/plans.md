# Data Table Implementation Plan

## Component Structure

### Core Components

```
src/components/charts/DataTable/
├── DataTable.tsx           # Main component wrapper
├── DataTableHeader.tsx     # Header with column controls
├── DataTableBody.tsx       # Main table body
├── DataTablePagination.tsx # Pagination controls
├── DataTableToolbar.tsx    # Global controls (filter, export, etc)
├── DataTableGrouping.tsx   # Grouping controls and UI
└── components/
    ├── ColumnHeader.tsx    # Individual column header with controls
    ├── ColumnVisualization.tsx # Histogram/categorical visualization
    ├── RowSelection.tsx    # Row selection controls
    └── GroupRow.tsx        # Group row rendering
```

### Chart Type Integration

```typescript
// Add to ChartTypes.ts
export interface DataTableSettings extends BaseChartSettings {
  type: "data-table";

  // Column configuration
  columns: Column[];
  visibleColumns: string[];
  columnWidths: Record<string, number>;

  // Pagination
  pageSize: number;
  currentPage: number;

  // Sorting
  sortConfig: {
    key: string;
    direction: "asc" | "desc";
  }[];

  // Filtering
  filters: Record<string, FilterConfig>;

  // Grouping
  groupBy: string[];
  expandedGroups: Set<string>;

  // Selection
  selectedRows: Set<string>;
}

// Add to CHART_TYPES array
{ value: "data-table", label: "Data Table", icon: Table }

// Add to defaultSettings.ts
export const DEFAULT_DATA_TABLE_SETTINGS: Omit<DataTableSettings, "id"> = {
  ...DEFAULT_CHART_SETTINGS,
  type: "data-table",
  columns: [],
  visibleColumns: [],
  columnWidths: {},
  pageSize: 10,
  currentPage: 1,
  sortConfig: [],
  filters: {},
  groupBy: [],
  expandedGroups: new Set(),
  selectedRows: new Set(),
};

// Add to getDefaultSettingsForType function
case "data-table":
  return DEFAULT_DATA_TABLE_SETTINGS;

// Create new file: src/types/createDataTableSettings.ts
import { DEFAULT_DATA_TABLE_SETTINGS } from "@/utils/defaultSettings";
import { DataTableSettings, ChartLayout } from "./ChartTypes";

export function createDataTableSettings(
  layout: ChartLayout
): DataTableSettings {
  return {
    ...DEFAULT_DATA_TABLE_SETTINGS,
    id: crypto.randomUUID(),
    title: "Data Table",
    layout,
  };
}
```

### Data Layer Integration

```typescript
// Add to DataLayerProvider.tsx
interface DataTableState {
  // Column configuration
  columns: Column[];
  visibleColumns: string[];
  columnWidths: Record<string, number>;

  // Data and pagination
  data: any[];
  pageSize: number;
  currentPage: number;

  // Sorting
  sortConfig: {
    key: string;
    direction: "asc" | "desc";
  }[];

  // Filtering
  filters: Record<string, FilterConfig>;

  // Grouping
  groupBy: string[];
  expandedGroups: Set<string>;

  // Selection
  selectedRows: Set<string>;

  // Actions
  setColumns: (columns: Column[]) => void;
  toggleColumn: (columnId: string) => void;
  setColumnWidth: (columnId: string, width: number) => void;
  setPageSize: (size: number) => void;
  setCurrentPage: (page: number) => void;
  setSort: (key: string, direction: "asc" | "desc") => void;
  setFilter: (columnId: string, config: FilterConfig) => void;
  toggleGroup: (groupId: string) => void;
  setGroupBy: (fields: string[]) => void;
  toggleRowSelection: (rowId: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
}
```

### Crossfilter Integration

```typescript
// Update CrossfilterWrapper.ts
export class CrossfilterWrapper<T> {
  // ... existing code ...

  getFilterFunction(chart: ChartSettings): (d: IdType) => boolean {
    switch (chart.type) {
      // ... existing cases ...
      case "data-table": {
        const dataTableSettings = chart as DataTableSettings;
        const filters = dataTableSettings.filters;

        // If no filters are active, return true
        if (Object.keys(filters).length === 0) {
          return (d: IdType) => true;
        }

        // Create filter functions for each active filter
        const filterFunctions = Object.entries(filters).map(
          ([columnId, filter]) => {
            const column = dataTableSettings.columns.find(
              (col) => col.id === columnId
            );
            if (!column) return () => true;

            const dataHash = this.fieldGetter(column.field);

            return (d: IdType) => {
              const value = dataHash[d];

              switch (filter.type) {
                case "text":
                  return filter.operator === "contains"
                    ? String(value)
                        .toLowerCase()
                        .includes(String(filter.value).toLowerCase())
                    : String(value) === String(filter.value);

                case "number":
                  const numValue = Number(value);
                  switch (filter.operator) {
                    case "equals":
                      return numValue === filter.value;
                    case "greaterThan":
                      return numValue > filter.value;
                    case "lessThan":
                      return numValue < filter.value;
                    case "between":
                      return (
                        numValue >= filter.value[0] &&
                        numValue <= filter.value[1]
                      );
                    case "in":
                      return filter.value.includes(numValue);
                    default:
                      return true;
                  }

                case "date":
                  const dateValue = new Date(value);
                  const filterDate = new Date(filter.value);
                  switch (filter.operator) {
                    case "equals":
                      return dateValue.getTime() === filterDate.getTime();
                    case "greaterThan":
                      return dateValue > filterDate;
                    case "lessThan":
                      return dateValue < filterDate;
                    case "between":
                      return (
                        dateValue >= new Date(filter.value[0]) &&
                        dateValue <= new Date(filter.value[1])
                      );
                    case "in":
                      return filter.value.some(
                        (d) => new Date(d).getTime() === dateValue.getTime()
                      );
                    default:
                      return true;
                  }

                case "select":
                  return filter.value.includes(value);

                case "boolean":
                  return value === filter.value;

                default:
                  return true;
              }
            };
          }
        );

        // Combine all filter functions with AND logic
        return (d: IdType) => filterFunctions.every((fn) => fn(d));
      }
      // ... rest of the cases ...
    }
  }
}
```

## Implementation Phases

### Phase 1: Core Table Structure & Integration

- [x] Chart Type Integration

  - [x] Add DataTableSettings to ChartTypes.ts
  - [x] Add data-table to CHART_TYPES array
  - [x] Update ChartSettings type union
  - [x] Add DEFAULT_DATA_TABLE_SETTINGS to defaultSettings.ts
  - [x] Add data-table case to getDefaultSettingsForType
  - [x] Create createDataTableSettings.ts

- [ ] Settings Component Integration

  - [ ] Update MainSettingsTab.tsx
    - [ ] Add data-table case to handle settings
    - [ ] Add column management section
      - [ ] Column visibility toggles
      - [ ] Column type selection
      - [ ] Column width controls
    - [ ] Add pagination controls
      - [ ] Page size selector
      - [ ] Current page display
    - [ ] Add grouping controls
      - [ ] Group field selection
      - [ ] Group expansion controls
    - [ ] Add selection controls
      - [ ] Row selection toggle
      - [ ] Selection mode selector
    - [ ] Add filter controls
      - [ ] Global search
      - [ ] Column-specific filters
      - [ ] Filter type selection
  - [ ] Create DataTableSettingsTab.tsx
    - [ ] Move data table specific settings to dedicated tab
    - [ ] Add advanced settings section
      - [ ] Sort configuration
      - [ ] Filter configuration
      - [ ] Group configuration
    - [ ] Add export settings
      - [ ] Export format selection
      - [ ] Export field selection
  - [ ] Add settings validation
    - [ ] Column configuration validation
    - [ ] Filter configuration validation
    - [ ] Group configuration validation

- [ ] Data Layer Integration

  - [ ] Add DataTableState to DataLayerProvider
  - [ ] Implement state management functions
  - [ ] Add data access patterns similar to PivotTable
  - [ ] Integrate with existing filter/sort systems
  - [ ] Update CrossfilterWrapper with data-table filter function
  - [ ] Implement filter function for all data types (text, number, date, select, boolean)

- [x] Basic table component setup

  - [x] Create component files and structure
  - [x] Implement basic table rendering
  - [x] Add basic styling with Tailwind
  - [x] Set up shadcn/ui table components

- [x] Column management
  - [x] Column configuration interface
  - [x] Column visibility toggle
  - [x] Column resizing
  - [x] Column sorting

### Phase 2: Data Management

- [ ] Pagination implementation

  - [ ] Page size controls
  - [ ] Page navigation
  - [ ] Page info display

- [ ] Sorting functionality

  - [ ] Single column sorting
  - [ ] Multi-column sorting
  - [ ] Sort indicators

- [ ] Filtering system
  - [ ] Column-specific filters
  - [ ] Filter UI components
  - [ ] Filter state management

### Phase 3: Advanced Features

- [ ] Row selection

  - [ ] Checkbox column
  - [ ] Select all functionality
  - [ ] Bulk selection handling

- [ ] Grouping system

  - [ ] Group field selection
  - [ ] Group row rendering
  - [ ] Group expansion/collapse
  - [ ] Group-level operations

- [ ] Column visualizations
  - [ ] Histogram implementation
  - [ ] Categorical data visualization
  - [ ] Visualization controls

### Phase 4: Data Export & Performance

- [ ] Export functionality

  - [ ] Export selected rows
  - [ ] Export filtered data
  - [ ] Export format options

- [ ] Performance optimizations
  - [ ] Memoization
  - [ ] Debounced operations

## Status

### Current Progress

- [x] Chart Type Integration

  - [x] Add DataTableSettings to ChartTypes.ts
  - [x] Add data-table to CHART_TYPES array
  - [x] Update ChartSettings type union
  - [x] Add DEFAULT_DATA_TABLE_SETTINGS to defaultSettings.ts
  - [x] Add data-table case to getDefaultSettingsForType
  - [x] Create createDataTableSettings.ts

- [x] Settings Component Integration

  - [x] Update MainSettingsTab.tsx with data table support
  - [x] Create DataTableSettingsTab.tsx for advanced settings
  - [x] Add settings validation
  - [x] Add settings persistence

- [x] Basic table component setup

  - [x] Create component files and structure
  - [x] Implement basic table rendering
  - [x] Add basic styling with Tailwind
  - [x] Set up shadcn/ui table components

- [x] Column management

  - [x] Column configuration interface
  - [x] Column visibility toggle
  - [x] Column resizing
  - [x] Column sorting

- [x] Data Layer Integration

  - [x] Add DataTableState to DataLayerProvider
  - [x] Implement state management functions
  - [x] Add data access patterns similar to PivotTable
  - [x] Integrate with existing filter/sort systems
  - [x] Update CrossfilterWrapper with data-table filter function
  - [x] Implement filter function for all data types (text, number, date, select, boolean)

- [x] Data Management

  - [x] Implement data fetching and filtering logic
  - [x] Add row selection functionality
  - [x] Implement group expansion/collapse
  - [x] Add pagination support
  - [x] Implement sorting system
    - [x] Add sort indicators to column headers
    - [x] Support single-column sorting
    - [x] Handle different data types
  - [x] Add filtering system
    - [x] Implement column-specific filters
    - [x] Add search functionality
    - [x] Support custom filter operators
  - [x] Optimize performance for large datasets
    - [x] Implement virtual scrolling
    - [x] Add data caching
    - [x] Optimize re-renders

### Testing

- [x] Unit tests
  - [x] Test data filtering and sorting
  - [x] Test pagination logic
  - [x] Test row selection
  - [x] Test group expansion
  - [x] Test virtual scrolling
  - [x] Test column filters
- [x] Integration tests
  - [x] Test data layer integration
  - [x] Test settings integration
  - [x] Test performance with large datasets

### Documentation

- [x] Component documentation
  - [x] Add usage examples
  - [x] Document props and types
  - [x] Add performance considerations
- [x] User documentation
  - [x] Add data table specific features
  - [x] Document keyboard shortcuts
  - [x] Add troubleshooting guide

## Next Steps

1. Add filter function for all data types in the data layer
2. Monitor performance in production
3. Gather user feedback and make improvements
4. Consider adding more features based on user needs
