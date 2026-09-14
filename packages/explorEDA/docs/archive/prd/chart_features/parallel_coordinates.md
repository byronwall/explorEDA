# Parallel Coordinates Chart PRD

## Goals

### Core Functionality

- Field selection for axes
- Support for both horizontal and vertical layouts
- Lines drawn through corresponding intersection points

### Data Handling

- Numerical data: Continuous scale
- Categorical data: Band file scale
- Global system for categorical ordering

### Visualization

- Canvas rendering for performance
- Support for tens of thousands of lines
- Line opacity settings for visibility
- Custom axis limits for each axis

### Coloring

- Optional color variable selection
- Color by additional data field
- Support for row-level metadata coloring
- Uses global color system

### Filtering

- Numerical data: Min-max filtering
- Categorical data: Click-to-include filtering
- Filter support on any field

### Axis Management

- Field reordering through field collector
- Respect user-defined field order
- Custom axis limits

### Performance

- Canvas rendering optimization
- Support for large datasets

## Outstanding Questions

1. What should be the default opacity for lines?
2. Should there be a maximum limit on the number of axes?
3. How should axis limit controls be implemented for better usability?
4. Should there be visual indicators for active filters?
