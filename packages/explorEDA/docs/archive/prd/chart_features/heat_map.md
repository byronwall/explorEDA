# Heat Map PRD

## Goals

### Core Functionality

- Row and column field selectors
- Count display at intersections
- Table-style rendering with borders/gridlines

### Color Features

- Customizable color scales
- Support for custom breakpoints
- User-defined thresholds
- Custom color scale with breakpoints

### Data Normalization

- Support for percentage displays:
  - Percent of row total
  - Percent of column total
  - Percent of grand total

### Filtering

- Click-to-filter support:
  - Row selection
  - Column selection
  - Cell selection
- AND/OR filter combinations
- Support for intersection or union of selections

### Drill-down

- Click to view detailed data
- Modal display of raw rows
- Integration with pivot table drill-down functionality

### Data Export

- Export as image
- Export to CSV
  - Include headers
  - Include counts

## Outstanding Questions

1. What should be the default color scale?
2. Should tooltips be implemented for quick value reference?
3. How should the UI indicate active filters?
4. Should there be a maximum size limit for the heat map dimensions?
