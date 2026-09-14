# Data Table PRD

## Goals

### Core Functionality

- Field selection for display columns
- Pagination support for large datasets
- Local sorting and filtering capabilities
- Support for hierarchical grouping
  - Multi-select grouping fields
  - Collapsible groups

### Column Features

- Column header distribution visualizations
  - Histograms for numerical data
  - TBD visualization for categorical data
- Column resizing
  - Manual resize
  - Double-click auto-size
- Color scale support from global system

### Row Selection

- Checkbox column for row selection
- Select All button at top
- Support for bulk selection

### Data Export

- Export filtered/selected data
- Export as subset of global data

### Performance

- Efficient handling of large datasets
- Optimized pagination

## Outstanding Questions

1. Should local filters integrate with the global filtering system?
2. What visualization should be used for categorical data in column headers?
3. What bulk actions should be available for selected rows?
4. Should grouping functionality mirror pivot table features?
