# Summary table improvements

Overall goal is to add a "chart" comp type for calculating and viewing pivot tables.

## Requirements

- Add a new chart type for pivot tables
- Core settings + selectors
  - Row fields - multi select on the field names
  - Column fields - multi select on the field names
  - Value fields - define a list of field + agg functions to calculate
  - Agg functions - sum, count, avg, min, max, median, mode, stddev, variance, count unique, single value
  - Special agg function = derived value - allows the user to enter a formula that uses the already computed agg values as variables
- Add logic to gather the data and perform the calcs
- If choosing single value, throw an error if there is more than one unique value
- Add a new pivot table button to all categorical field types in the summary table
  - This will create a simple table that only has a single row field defined
- Build the visuals for the pivot table - they should basically match Excel
- Add logic to the row and column headers which allows the user to filter the data - click to filter on value
- UX considerations
  - Allow user to drag a field from the summary table to the pivot table to use as a row field or column field
  - Allow user to click on a pivot value and get a detailed listing of the rows that contributed to that value

### Date Field Handling

- Support automatic date field binning with options:
  - Day
  - Month
  - Year
- Implement internal handling of date buckets
- Integrate with the calculation engine

### Totals and Subtotals

- Support row and column subtotals
- Support grand totals
- Make totals display optional

### Drill-down Features

- Implement modal/popover interface for detailed data view
- Add pagination support for detailed data views

### Calculated Fields

- Support calculated expressions based on existing pivot table values
- Implement custom syntax for calculations

### Data Export

- Add export to CSV functionality
- Integrate with global view system for saving configurations

## Plan

## Implementation Plan

### Component Structure

```
src/
  components/
    pivot-table/
      PivotTable.tsx         # Main pivot table component
      PivotTableConfig.tsx   # Configuration panel
      PivotTableHeader.tsx   # Header with filtering
      PivotTableBody.tsx     # Table body with data
      PivotTableCell.tsx     # Individual cell component
      types.ts              # Type definitions
      utils/
        calculations.ts     # Aggregation functions
        dateHandling.ts    # Date binning logic
        filtering.ts       # Filter implementations
```

### Interface Details

#### `types.ts`

```typescript
export interface PivotTableConfig {
  rowFields: string[];
  columnFields: string[];
  valueFields: ValueFieldConfig[];
  showTotals: {
    row: boolean;
    column: boolean;
    grand: boolean;
  };
  dateBinning?: DateBinningConfig;
}

export interface ValueFieldConfig {
  field: string;
  aggregation: AggregationType;
  formula?: string; // For derived values
  label?: string; // Display label
}

export interface DateBinningConfig {
  field: string;
  type: "day" | "month" | "year";
}

export type AggregationType =
  | "sum"
  | "count"
  | "avg"
  | "min"
  | "max"
  | "median"
  | "mode"
  | "stddev"
  | "variance"
  | "countUnique"
  | "singleValue";

export interface PivotTableData {
  headers: PivotHeader[];
  rows: PivotRow[];
  totals?: PivotTotals;
}

export interface PivotHeader {
  label: string;
  field: string;
  value: string | number;
  children?: PivotHeader[];
  span: number;
  depth: number;
}

export interface PivotRow {
  key: string;
  headers: PivotHeader[];
  cells: PivotCell[];
  subtotal?: boolean;
}

export interface PivotCell {
  key: string;
  value: number | string | null;
  rawValue?: any;
  sourceRows?: any[]; // Original rows that contributed to this value
}

export interface PivotTotals {
  row: Record<string, number | string>;
  column: Record<string, number | string>;
  grand: Record<string, number | string>;
}

export interface FilterState {
  field: string;
  values: Set<string | number>;
}
```

#### `PivotTable.tsx`

```typescript
interface PivotTableProps {
  data: any[]; // Source data array
  config: PivotTableConfig;
  onConfigChange: (config: PivotTableConfig) => void;
  onFilterChange?: (filters: FilterState[]) => void;
}

// Internal state
interface PivotTableState {
  processedData: PivotTableData;
  activeFilters: FilterState[];
  selectedCell?: {
    rowKey: string;
    colKey: string;
    value: any;
  };
}
```

#### `PivotTableConfig.tsx`

```typescript
interface PivotTableConfigProps {
  config: PivotTableConfig;
  availableFields: Array<{
    name: string;
    type: "string" | "number" | "date" | "boolean";
  }>;
  onConfigChange: (config: PivotTableConfig) => void;
}

// Internal state
interface PivotTableConfigState {
  activeTab: "fields" | "options" | "calculations";
  draggedField?: string;
}
```

#### `PivotTableHeader.tsx`

```typescript
interface PivotTableHeaderProps {
  headers: PivotHeader[];
  onFilterClick: (field: string, value: string | number) => void;
  activeFilters: FilterState[];
}
```

#### `PivotTableBody.tsx`

```typescript
interface PivotTableBodyProps {
  rows: PivotRow[];
  onCellClick: (cell: PivotCell, rowKey: string, colKey: string) => void;
  showTotals: PivotTableConfig["showTotals"];
}
```

#### `PivotTableCell.tsx`

```typescript
interface PivotTableCellProps {
  cell: PivotCell;
  isHeader?: boolean;
  isTotal?: boolean;
  onClick?: (cell: PivotCell) => void;
}
```

#### `utils/calculations.ts`

```typescript
interface AggregationResult {
  value: number | string;
  rawValue?: any;
  sourceRows: any[];
}

interface CalculationContext {
  field: string;
  rows: any[];
  aggregationType: AggregationType;
  formula?: string;
}

// Core functions to implement
const calculations = {
  calculateAggregation: (context: CalculationContext) => AggregationResult;
  evaluateFormula: (formula: string, variables: Record<string, number>) => number;
  validateSingleValue: (rows: any[], field: string) => AggregationResult;
};
```

#### `utils/dateHandling.ts`

```typescript
interface DateBucket {
  key: string;
  start: Date;
  end: Date;
  display: string;
}

interface DateBinningOptions {
  field: string;
  type: DateBinningConfig["type"];
  timezone?: string;
}

// Core functions to implement
const dateBinning = {
  createBuckets: (options: DateBinningOptions, data: any[]) => DateBucket[];
  assignToBucket: (date: Date, bucket: DateBucket) => boolean;
  formatBucketLabel: (bucket: DateBucket, type: DateBinningConfig["type"]) => string;
};
```

#### `utils/filtering.ts`

```typescript
interface FilterOptions {
  field: string;
  values: Set<string | number>;
  data: any[];
}

// Core functions to implement
const filtering = {
  applyFilters: (filters: FilterState[], data: any[]) => any[];
  getUniqueValues: (field: string, data: any[]) => Set<string | number>;
  createFilterState: (field: string, values: Array<string | number>) => FilterState;
};
```

### Integration Points

1. The `PivotTable` component will be the main entry point, managing state and coordinating between subcomponents.
2. Data flow will be top-down with configuration changes bubbling up through callbacks.
3. The calculation engine will be memoized to prevent unnecessary recalculations.
4. All components will use Tailwind CSS for styling and shadcn/ui components where appropriate.
5. The drill-down functionality will use a modal from shadcn/ui to display detailed data.
6. Filtering will be implemented using shadcn/ui's popover and checkbox components.
7. Icons from lucide-react will be used for various UI elements (sorting, filtering, etc.).
8. Toast notifications using sonner will be used for error states (e.g., single value validation failures).

### Implementation Phases

1. Core Components and Data Structure

   - Set up basic component structure
   - Implement data transformation logic
   - Create configuration panel with field selectors

2. Calculation Engine

   - Implement core aggregation functions
   - Add date binning support
   - Build formula parser for derived values

3. UI and Interactions

   - Build table layout with headers and cells
   - Add filtering interactions
   - Implement drag-and-drop field assignment

4. Advanced Features

   - Add totals and subtotals
   - Implement drill-down modal
   - Add export functionality

5. Polish and Optimization
   - Performance optimizations
   - UI refinements
   - Testing and bug fixes

## Status

### Phase 1: Core Components ✅

- [x] Basic component structure

  - [x] Create component files
  - [x] Set up types and interfaces
  - [x] Add basic styling with Tailwind

- [x] Configuration Panel

  - [x] Field selector components
  - [x] Aggregation type selector
  - [x] Date binning options

- [x] Data Transformation
  - [x] Core data processing logic
  - [x] Basic aggregation implementation
  - [x] Data structure optimization

### Phase 2: Calculation Engine ✅

- [x] Aggregation Functions

  - [x] Basic calculations (sum, count, avg)
  - [x] Statistical functions
  - [x] Single value validation

- [x] Date Handling

  - [x] Date binning implementation
  - [x] Date format utilities
  - [x] Bucket calculations

- [x] Formula System
  - [x] Formula parser
  - [x] Variable resolution
  - [x] Error handling

### Phase 3: UI Implementation ✅

- [x] Table Layout

  - [x] Header components
  - [x] Cell components
  - [x] Responsive design

- [x] Interactions

  - [x] Click-to-filter
  - [x] Drag-and-drop
  - [x] Column/row resizing

- [x] Drill-down Features
  - [x] Detail view modal
  - [x] Data pagination
  - [x] Filtering options

### Phase 4: Advanced Features ✅

- [x] Totals System

  - [x] Row subtotals
  - [x] Column subtotals
  - [x] Grand totals

- [x] Export Features
  - [x] CSV export
  - [x] Configuration saving
  - [x] Data formatting

### Phase 5: Integrate with Crossfilter ✅

- [x] Update crossfilter wrapper to handle possible filters
- [x] Ensure implementation mirrors existing chart types

### Phase 5: Polish ✅

- [x] Performance
  - [x] Memoization
  - [x] Lazy loading
  - [x] Virtual scrolling

## Current Progress

✅ Implementation complete with:

- Core pivot table component structure
- Configuration panel with field selectors
- Data transformation and aggregation engine
- Table layout with headers and cells
- Totals system
- Basic interactions (filtering, drill-down)
- Crossfilter integration
- Performance optimizations
  - Memoized calculations
  - Virtual scrolling for large datasets
  - Optimized header rendering
  - Efficient filtering

### Next Steps

1. Add documentation
2. Add tests
3. Consider additional features:
   - Export to Excel
   - Conditional formatting
   - Custom calculations UI
   - Advanced filtering options
