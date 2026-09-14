# Data Table Implementation Plan

## Phase 0: Remove Grouping

- [x] Remove grouping from the data table
- [x] Update the data table to not expect grouping
- [x] Update settings related to grouping
- [x] Remove any comps that are related to grouping

## Phase 1: Pagination and Basic Functionality

### Fix Pagination

- [x] Update pagination logic to handle data correctly
  - [x] Modify data processing to count all items
  - [x] Update pagination calculations
  - [x] Add tests for pagination

## Phase 2: Row Selection and Multi-select

### Row Selection Implementation

- [x] Remove row selection from the data table

## Phase 3: Data Processing and Search

### Sorting Improvements

- [x] Implement numeric sorting
  - [x] Add natural sort for numeric columns
  - [x] Update column sorting logic
  - [x] Add tests for numeric sorting

### Search Functionality

- [x] Fix global search
  - [x] Review and fix search implementation
  - [x] Add global search to settings
  - [x] Implement search in toolbar
  - [x] Add search filtering to table body

## Phase 4: UI and Layout

### Layout Improvements

- [x] Implement proper height and overflow handling
  - [x] Add fixed height container
  - [x] Implement proper scrolling behavior
- [x] Allow column resizing with a simple handler - store column widths in settings
- [x] Add a proper column header to the table - or use the existing column header

### Settings Integration

- [x] Move settings into main tab
  - [x] Integrate settings UI into main view
  - [x] Remove settings related to specific columns: `type`, `label`, `width`, `sortable`, `filterable`
  - [x] Do not expose an input for column width - controlled by the UI

## Phase 5: Code Organization and Testing

### Testing Infrastructure

- [x] Update test configuration
  - [x] Update cursor rules for Vitest
  - [x] Add missing Vitest imports
  - [x] Review and update existing tests

## Status

### Current Progress

- Initial implementation complete
- Issues identified during testing
- Plan created to address all identified issues
- Numeric sorting implementation completed
- Global search implementation completed
- Layout improvements completed
- Testing infrastructure completed
- All planned work completed

### Next Steps

1. Review and validate all implemented features
2. Document any remaining issues or improvements
3. Plan for future enhancements

### Outstanding Questions

- Should data access be standardized through props instead of hooks?
- How should selected rows state be managed?
- What is the best approach for settings integration?
