# Pivot Table PRD

## Goals

### Core Functionality

- Multi-selector support for:
  - Row fields
  - Column fields
  - Cell values (pivot values)
- Automatic unique value selection for fields
- User-specified aggregation functions for values
- Visual consistency with Excel-style pivot tables

### Date Handling

- Automatic date field binning options:
  - Day
  - Month
  - Year
- Internal handling of date buckets
- Integration with calculation engine

### Totals and Subtotals

- Support for subtotals
- Support for grand totals
- Optional display of totals

### Drill-down Capabilities

- Cell click to view detailed data
- Modal/popover interface for detailed view
- Pagination support for detailed data

### Calculated Fields

- Support for calculated expressions
- Based on existing pivot table values
- Custom syntax for calculations

### Data Export

- Export to CSV functionality
- Integration with global view system for saving configurations

## Outstanding Questions

1. Should local saved views be supported in addition to global views?
2. How should conditional formatting be implemented?
3. What specific pagination controls should be implemented for drill-down views?
4. Should filters be integrated into the global filtering system?
