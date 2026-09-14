# Line Chart Implementation Plan

## Overview

The line chart component will be implemented following the existing patterns from ScatterPlot and BoxPlot components. It will integrate with the chart registry system and support all core features outlined in the requirements.

## File Structure

```
src/
  components/
    charts/
      LineChart/
        LineChart.tsx         # Main chart component
        LineChartSettingsPanel.tsx  # Settings UI
        definition.ts         # Chart type definition and settings
```

## Interfaces and Types

### LineChartSettings (in definition.ts)

```typescript
export interface LineChartSettings extends BaseChartSettings {
  type: "line";

  // Data fields
  xField: string;
  yField: string;
  seriesField?: string;

  // Line styling
  styles: {
    lineWidth: number;
    lineOpacity: number;
    curveType: "linear" | "monotoneX" | "step";
    showPoints: boolean;
    pointSize: number;
    pointOpacity: number;
  };

  // Grid options
  showXGrid: boolean;
  showYGrid: boolean;

  // Legend options
  showLegend: boolean;
  legendPosition: "top" | "right" | "bottom" | "left";
}
```

## Core Components

### LineChart.tsx

Main features:

- SVG-based rendering using d3 scales ✅
- Support for multiple data series ✅
- Interactive tooltips using shadcn/ui Tooltip ✅
- Responsive design ✅
- Integration with faceting system ✅
- Brush selection for filtering ✅
- Legend support using existing patterns ✅
- Assign a unique color to each series from a palette ✅

### LineChartSettingsPanel.tsx

Settings UI for configuring:

- Data field mappings (x, series) via FieldSelector ✅
- Line styling options ✅
- Grid display ✅
- Legend position ✅

## Integration Points

1. Chart Registry

   - Add line chart definition to registry.ts ✅
   - Register in the initialization ✅

2. Data Layer Integration

   - Use useDataLayer for state management ✅
   - Implement filter functions ✅
   - Support live data updates ✅

3. Faceting Support
   - Register axis limits ✅
   - Support synchronized scales ✅
   - Handle facet-specific rendering ✅

## Implementation Phases

### Phase 1: Core Chart Component ✅

- [x] Basic component structure

  - [x] Component scaffolding
  - [x] Props and settings interfaces
  - [x] Basic SVG setup

- [x] Data handling

  - [x] Data processing utilities
  - [x] Scale creation
  - [x] Line generation

- [x] Basic rendering
  - [x] Single line plotting
  - [x] Axes integration
  - [x] Responsive container

### Phase 2: Multiple Series Support ✅

- [x] Series handling

  - [x] Data grouping by series
  - [x] Color assignment
  - [x] Legend integration

- [x] Enhanced rendering
  - [x] Multiple line paths
  - [x] Point markers
  - [x] Grid lines

### Phase 3: Interactivity ✅

- [x] Tooltip implementation

  - [x] Hover detection
  - [x] Data point highlighting
  - [x] Formatted display

- [x] Brush selection
  - [x] Area selection
  - [x] Filter integration
  - [x] Visual feedback

### Phase 4: Settings Panel ✅

- [x] Settings UI

  - [x] Field selectors
  - [x] Style controls
  - [x] Format options

- [x] Preview updates
  - [x] Live preview
  - [x] Validation

### Phase 5: Series Settings Enhancement

- [x] Create SeriesSettings interface

  - [x] showPoints: boolean
  - [x] pointSize: number
  - [x] pointOpacity: number
  - [x] lineWidth: number
  - [x] lineOpacity: number
  - [x] lineColor: string
  - [x] lineStyle: string

- [x] Create LineSeriesSettings component
  - [x] Grid/table layout for settings
  - [x] Individual series controls
  - [x] Preview updates
  - [x] New settings tab integration

### Phase 6: Component and UX Improvements

- [x] MultiSelect integration

  - [x] Replace current series selector with MultiSelect
  - [x] Update data handling for multiple selections

- [x] Axis Enhancements

  - [x] Support for right axis assignment
  - [ ] Move gridline settings to axis tab
  - [ ] Unified axis settings across chart types

- [ ] Legend Fixes
  - [ ] Fix legend rendering
  - [ ] Implement unique color assignment per series

## Current Progress

- Series settings have been expanded with full control over line and point appearance
- UI components have been standardized with MultiSelect for series selection
- Right axis support has been added for series
- Legend rendering has been improved with better styling and consistent colors
- Color assignment has been fixed with a memoized color map
- Series settings are organized in a grid layout

### Next Steps

1. ✅ Implement SeriesSettings interface and component
2. ✅ Update series selector to use MultiSelect
3. ✅ Add right axis support
4. ✅ Fix legend rendering and color assignment
5. [ ] Move gridline settings to axis tab
6. [ ] Create unified axis settings across chart types
7. [ ] Test all features with various data configurations
8. [ ] Add error handling for edge cases

### Phase 7: Axis Settings Reorganization

- [ ] Create new AxisSettings component

  - [ ] Support for left and right y-axis
  - [ ] Grid line controls
  - [ ] Scale type selection
  - [ ] Label customization
  - [ ] Tick formatting

- [ ] Update LineChartSettingsPanel
  - [ ] Move grid settings to axis tab
  - [ ] Integrate new AxisSettings component
  - [ ] Update UI layout for better organization

### Phase 8: Testing and Refinement

- [ ] Test with various data configurations

  - [ ] Multiple series
  - [ ] Different axis configurations
  - [ ] Different style settings
  - [ ] Edge cases (empty data, single point, etc.)

- [ ] Error handling
  - [ ] Invalid data formats
  - [ ] Missing required fields
  - [ ] Scale boundary cases
