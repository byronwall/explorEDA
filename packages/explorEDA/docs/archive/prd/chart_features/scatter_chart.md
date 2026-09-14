# Scatter Chart PRD

## Goals

### Core Visualization

- Points rendered directly on Canvas
- Support for overlapping points
- User-configurable point opacity (0 to 1)
- Support for data-dependent point sizing
  - User control over size scale
- Support for data-dependent symbols
  - User control over symbol scale

### Dual Y-Axis Support

- Optional second Y variable plotting
- Second Y-axis can be:
  - Synchronized to main Y-axis
  - Independent from main Y-axis
- Visual scheme needed to differentiate axes

### Trend Lines and Regression

- Support for multiple regression types:
  - Linear regression
  - Polynomial regression
  - LOESS (locally smooth) regression
  - Exponentially weighted moving average (EWMA)

### Performance

- Canvas rendering for efficiency
- Target support for ~1 million points
- Progressive rendering implementation
- Off-screen culling optimization
- Efficient rendering strategies

### Grid and Axes

- Support for customizable grid lines and axis labels
- Enhanced usability for axis limit modifications
  - Keyboard controls
  - Mouse controls
  - Alternative to manual limit typing

### Data Export

- Support for image export
- Support for data export
  - Possible chart-specific export button
  - Scope export to fields in current chart

## Outstanding Questions

1. What visual scheme should be used to differentiate dual Y-axes?
2. Should tooltips be implemented despite Canvas rendering complexity?
3. Should a mini-map feature be added for navigation?
4. What specific keyboard/mouse controls should be implemented for axis limit modifications?
