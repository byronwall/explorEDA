# Color Legend Implementation Plan

## Type Definitions

Location: `src/components/charts/ColorLegend/types.ts`

```typescript
import { BaseChartSettings } from "@/types/ChartTypes";

export interface ColorLegendSettings extends BaseChartSettings {
  type: "color-legend";
  showTitle: boolean;
  showSearch: boolean;
  compact: boolean;
}
```

## Component Structure

### ColorLegendChart Component

Location: `src/components/charts/ColorLegend/ColorLegendChart.tsx`

Main chart component that renders the list of color scales:

```typescript
import { BaseChartProps } from "@/types/ChartTypes";

export function ColorLegendChart({
  settings,
  width,
  height,
}: BaseChartProps<ColorLegendSettings>) {
  // Implementation here
}
```

### ColorLegendSettingsPanel Component

Location: `src/components/charts/ColorLegend/ColorLegendSettingsPanel.tsx`

Settings panel for configuring the color legend display:

```typescript
import { ChartSettingsPanelProps } from "@/types/ChartTypes";

export function ColorLegendSettingsPanel({
  settings,
  onSettingsChange,
}: ChartSettingsPanelProps<ColorLegendSettings>) {
  // Implementation here
}
```

### Chart Definition

Location: `src/components/charts/ColorLegend/definition.ts`

```typescript
import { ChartDefinition } from "@/types/ChartTypes";
import { List } from "lucide-react";

export const colorLegendDefinition: ChartDefinition<ColorLegendSettings> = {
  type: "color-legend",
  name: "Color Legend",
  description: "Display and manage color scales used in visualizations",
  icon: List,
  component: ColorLegendChart,
  settingsPanel: ColorLegendSettingsPanel,

  createDefaultSettings: (layout) => ({
    id: crypto.randomUUID(),
    type: "color-legend",
    title: "Color Legend",
    field: "",
    layout,
    colorScaleId: undefined,
    colorField: undefined,
    facet: {
      enabled: false,
      type: "grid",
      rowVariable: "",
      columnVariable: "",
    },
    xAxis: {},
    yAxis: {},
    margin: {},
    filters: [],
    xAxisLabel: "",
    yAxisLabel: "",
    xGridLines: 0,
    yGridLines: 0,
    showTitle: true,
    showSearch: true,
    compact: false,
  }),

  validateSettings: () => true,
  getFilterFunction: () => () => true,
};
```

## Implementation Phases

### Phase 1: Core Setup

- [x] Type definitions and chart registration
  - [x] Create ColorLegendSettings interface
  - [x] Create chart definition file
  - [x] Create basic component files
  - [x] Create color scale types

### Phase 2: Basic Component Implementation

- [x] ColorLegendChart implementation
  - [x] Basic layout structure
  - [x] Integration with useColorScales hook
  - [x] List view of color scales
  - [x] Responsive container handling

### Phase 3: Color Scale Display

- [x] Numerical color scale display
  - [x] Gradient visualization
  - [x] Scale name display
- [x] Categorical color scale display
  - [x] Color blocks grid
  - [x] Category labels
  - [x] Overflow handling

### Phase 4: Settings Panel

- [x] Settings panel implementation
  - [x] Show/hide title toggle
  - [x] Show/hide search toggle
  - [x] Compact mode toggle
  - [x] Basic layout options

## Status

### Phase 1: Core Setup

- [x] Type definitions and chart registration
  - [x] Create ColorLegendSettings interface
  - [x] Create chart definition file
  - [x] Create basic component files
  - [x] Create color scale types

### Phase 2: Basic Component Implementation

- [x] ColorLegendChart implementation
  - [x] Basic layout structure
  - [x] Integration with useColorScales hook
  - [x] List view of color scales
  - [x] Responsive container handling

### Phase 3: Color Scale Display

- [x] Numerical color scale display
  - [x] Gradient visualization
  - [x] Scale name display
- [x] Categorical color scale display
  - [x] Color blocks grid
  - [x] Category labels
  - [x] Overflow handling

### Phase 4: Settings Panel

- [x] Settings panel implementation
  - [x] Show/hide title toggle
  - [x] Show/hide search toggle
  - [x] Compact mode toggle
  - [x] Basic layout options

## Current Progress

- Created all necessary type definitions
- Implemented ColorLegendChart component with search and display functionality
- Implemented ColorLegendSettingsPanel with all required controls
- Created chart definition with proper configuration
- Added color scale type definitions
- Implemented responsive grid layout with compact mode
- Added search functionality for color scales
- Implemented proper display for both numerical and categorical color scales

### Next Steps

- Test the implementation with actual color scales
- Integrate with the chart registry
- Add the component to the chart picker

## Integration Notes

1. The color legend will be registered as a chart type similar to SummaryTable
2. It will not use filtering or complex chart settings
3. It will focus on displaying and managing color scales
4. The component will be self-contained and reusable
5. It will maintain consistency with existing chart patterns
