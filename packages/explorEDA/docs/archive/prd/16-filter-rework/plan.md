# Plan: Rework Chart Filters System

## Current Issues

1. Different chart types handle filters differently:
   - Row charts use `filterValues`
   - Bar charts use both `filterValues` and `filterRange`
   - Scatter charts use `xFilterRange` and `yFilterRange`
   - Data tables use a more sophisticated filter object
2. Filter logic is scattered across multiple files
3. Switch statements in `getFilterValues.ts` make the code hard to maintain

## Proposed Solution

### 1. Create Unified Filter Type System

```typescript
interface FilterBase {
  type: string;
  field: string;
}

interface ValueFilter extends FilterBase {
  type: "value";
  values: Array<string | number>;
}

interface RangeFilter extends FilterBase {
  type: "range";
  min?: number;
  max?: number;
}

interface TextFilter extends FilterBase {
  type: "text";
  operator: "contains" | "equals" | "startsWith" | "endsWith";
  value: string;
}

type Filter = ValueFilter | RangeFilter | TextFilter;

interface ChartFilters {
  filters: Filter[];
}

// Example: Scatter Chart Filter Configuration
interface ScatterChartSettings extends BaseChartSettings {
  type: "scatter";
  xField: string;
  yField: string;
  filters: Filter[]; // Will contain two RangeFilter objects, one for each axis
}

// Example scatter chart filter usage:
const scatterFilters = [
  {
    type: "range",
    field: "x_field_name",
    min: 0,
    max: 100,
  },
  {
    type: "range",
    field: "y_field_name",
    min: 20,
    max: 80,
  },
];
```

### 2. Migration Steps

1. Create new types in `src/types/ChartTypes.ts`
2. Update each chart's settings interface to use the new `ChartFilters` interface
3. Update filter-related hooks:
   - Replace `getFilterValues.ts` with new filter management system
   - Create new hooks for common filter operations

### 3. New Filter Management System

1. Create `src/hooks/useFilters.ts`:

   - Handle all filter operations
   - Provide consistent API for all chart types
   - Include type-safe filter manipulation functions

2. Create filter utility functions:
   - `createFilter(type, field, ...params)`
   - `applyFilter(data, filter)`
   - `combineFilters(filters[])`

### 3.1 Scatter Chart Filter Specifics

1. Scatter charts will store two `RangeFilter` objects in their `filters` array
2. The `field` property will match the chart's `xField` and `yField` settings
3. Helper functions for scatter charts:
   - `getXFilter(filters: Filter[]): RangeFilter`
   - `getYFilter(filters: Filter[]): RangeFilter`
   - `updateXFilter(filters: Filter[], min?: number, max?: number): Filter[]`
   - `updateYFilter(filters: Filter[], min?: number, max?: number): Filter[]`

### 4. Implementation Order

1. Create new type system
2. Implement core filter utilities
3. Update chart types one at a time:
   - Row Chart (simplest case)
   - Bar Chart
   - Scatter Chart
   - Data Table (most complex case)
4. Remove old filter code
5. Update documentation

## Detailed Execution Plan

### 1. Core Infrastructure (Week 1)

#### Update ChartTypes.ts

```typescript
// Add new filter types
interface FilterBase {
  type: string;
  field: string;
}

interface ValueFilter extends FilterBase {
  type: "value";
  values: Array<string | number>;
}

interface RangeFilter extends FilterBase {
  type: "range";
  min?: number;
  max?: number;
}

interface TextFilter extends FilterBase {
  type: "text";
  operator: "contains" | "equals" | "startsWith" | "endsWith";
  value: string;
}

type Filter = ValueFilter | RangeFilter | TextFilter;
```

#### Create useFilters.ts

```typescript
// Core filter utilities
export const createFilter = (
  type: string,
  field: string,
  params: any
): Filter => {
  // Implementation
};

export const applyFilter = (data: any[], filter: Filter): any[] => {
  // Implementation
};

export const combineFilters = (filters: Filter[]): Filter => {
  // Implementation
};

// Chart-specific helpers
export const getAxisFilter = (
  filters: Filter[],
  field: string
): RangeFilter | undefined => {
  // Implementation
};

export const updateAxisFilter = (
  filters: Filter[],
  field: string,
  min?: number,
  max?: number
): Filter[] => {
  // Implementation
};
```

### 2. Chart Migration (Week 2-4)

#### Update Chart Settings Interfaces

1. ScatterChartSettings:

```typescript
interface ScatterChartSettings extends BaseChartSettings {
  type: "scatter";
  xField: string;
  yField: string;
  filters: Filter[]; // Replace xFilterRange and yFilterRange
}
```

2. RowChartSettings:

```typescript
interface RowChartSettings extends BaseChartSettings {
  type: "row";
  minRowHeight: number;
  maxRowHeight: number;
  filters: Filter[]; // Replace filterValues
}
```

3. BarChartSettings:

```typescript
interface BarChartSettings extends BaseChartSettings {
  type: "bar";
  filters: Filter[]; // Replace filterValues and filterRange
}
```

### 4. Key Files to Modify

1. `src/types/ChartTypes.ts`

   - Add new filter types
   - Update chart settings interfaces
   - Remove old filter types

2. `src/hooks/getFilterValues.ts`

   - Eventually remove this file
   - Migrate functionality to new filter system

3. Chart Definition Files:

   - Update each chart's `definition.ts`
   - Modify `getFilterFunction`
   - Update settings validation

4. Components:
   - Update filter UI components
   - Modify filter handling logic
   - Update prop types

### 5. Testing Plan

1. Unit Tests:

   - Filter creation utilities
   - Filter application functions
   - Migration functions

2. Integration Tests:

   - Chart-specific filter behavior
   - Filter UI interaction
   - Data flow through filters

### 6. Timeline

1. Week 1: Core Infrastructure

   - Set up new types
   - Create filter utilities
   - Initial testing framework

2. Week 2: Basic Charts

   - Migrate Row Chart
   - Migrate Bar Chart
   - Update basic components

3. Week 3: Complex Charts

   - Migrate Scatter Chart
   - Begin Data Table migration
   - Integration testing

4. Week 4: Cleanup and Polish
   - Complete Data Table migration
   - Remove old code
   - Documentation
   - Final testing

## Remaining Tasks

### 1. Chart Component Updates

1. Scatter Chart

   - [x] Move filter logic from component to `applyFilter` function
   - [ ] Update `isFiltered` logic to use `applyFilter` helper
   - [ ] Remove inline filter checks

2. Bar Chart

   - [ ] Update to use `applyFilter` function for both value and range filters
   - [ ] Consolidate filter logic in definition file
   - [ ] Remove inline filter checks

3. Row Chart

   - [ ] Update to use `applyFilter` function consistently
   - [ ] Remove any remaining inline filter logic

4. Data Layer Updates

   - [ ] Replace summary table chart settings creator in DataLayerProvider
   - [ ] Update DataLayerProvider to use new filter functions
   - [ ] Update useChartExtent to use new filter functions

5. Data Table Fixes
   - [ ] Review and fix data table filter implementation
   - [ ] Ensure compatibility with new filter system
   - [ ] Test all filter types (text, value, range)

### 2. Testing & Validation

1. Unit Tests

   - [ ] Test filter application across all chart types
   - [ ] Verify filter combinations work correctly
   - [ ] Test edge cases for each filter type

2. Integration Tests
   - [ ] Test filters across multiple charts
   - [ ] Verify data consistency
   - [ ] Test performance with large datasets

### 3. Cleanup

1. Code Cleanup

   - [ ] Remove old filter types and implementations
   - [ ] Clean up any remaining inline filter logic
   - [ ] Update type references

2. Documentation
   - [ ] Update API documentation
   - [ ] Add examples for each filter type
   - [ ] Document migration steps for custom implementations

### 4. Pivot Table Improvements

1. Filter UI Updates

   - [x] Change search icon to filter icon for better clarity
   - [x] Add row filter icon similar to column filter
   - [x] Remove toast notifications when filters are applied
   - [x] Add yellow background highlight for cells that meet filter conditions

2. Filter Functionality
   - [x] Update filter icon click handlers
   - [x] Implement row filtering mechanism
   - [x] Add visual feedback for active filters
   - [x] Ensure all live data is rendered in filtered state

## Status

### Phase 1: Core Infrastructure ✅

- [x] Create new filter type system

  - [x] Create FilterTypes.ts with base types
  - [x] Add type guards for filter types
  - [x] Add ChartFilters interface

- [x] Implement filter utilities
  - [x] Create useFilters.ts hook
  - [x] Implement createFilter function
  - [x] Implement applyFilter function
  - [x] Implement combineFilters function
  - [x] Add chart-specific helper functions

### Phase 2: Chart Migration 🔄

- [x] Update ScatterChartSettings

  - [x] Replace xFilterRange and yFilterRange with unified filters array
  - [ ] Update scatter chart component to use applyFilter
  - [x] Update scatter chart definition

- [x] Update RowChartSettings

  - [x] Replace filterValues with unified filters array
  - [ ] Update row chart component to use applyFilter consistently
  - [x] Update row chart definition

- [x] Update BarChartSettings

  - [x] Replace filterValues and filterRange with unified filters array
  - [x] Update bar chart component to use applyFilter
  - [x] Update bar chart definition

- [x] Update DataTableSettings
  - [x] Replace filters object with unified filters array
  - [ ] Fix filter implementation
  - [x] Update data table definition

### Phase 3: Cleanup & Documentation 📝

- [ ] Remove old filter code

  - [ ] Remove deprecated filter types
  - [ ] Clean up inline filter logic
  - [ ] Update type references

- [ ] Update documentation
  - [ ] API documentation
  - [ ] Migration guide
  - [ ] Examples

## Next Steps

1. Update scatter chart component to use applyFilter helper
2. Update bar chart and row chart components to use applyFilter consistently
3. Fix data table filter implementation
4. Complete DataLayerProvider updates
5. Remove old filter code and update documentation
