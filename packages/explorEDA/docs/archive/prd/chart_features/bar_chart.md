# Bar Chart PRD

## Goals

- Support both numerical and categorical data
  - For numerical data: Present as histogram-like distribution
  - For categorical data: Present as band-style axis with counts

### Data Visualization

- Vertical bar orientation
- Support for custom bin definitions
  - Custom bin count
  - Custom bin interval
  - Possible support for custom bin ranges/breakpoints

### Filtering

- Click-to-drag range selection
- Single bar selection
- Multiple selections combine with OR logic

### Coloring

- Color by original variable using numerical scale
- Color by different variable
  - Implements stacked bar style
  - Original bar replaced with stack of colors
  - Stacks correspond to count of coloring variable
- Uses global color palette system
- Stacking always on top (no side-by-side) to prevent layout shifts

### Performance

- Render to Canvas
- Support for off-screen rendering
- Progressive rendering for data loading

### Grid and Axes

- Support for customizable grid lines and axis labels

## Outstanding Questions

1. Should tooltips be implemented despite Canvas rendering complexity?
2. Should animations be added for transitions and updates?
3. Should highlighting on hover be implemented?
4. What specific keyboard/mouse controls should be implemented for axis limit modifications?
