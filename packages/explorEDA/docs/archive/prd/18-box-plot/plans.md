# Box Plot Implementation Plan

## Component Structure

### Core Components

1. `BoxPlot.tsx` - Main component for rendering box plots and variants
2. `BoxPlotSettingsPanel.tsx` - Settings panel component
3. `definition.ts` - Type definitions and chart registration
4. `boxPlotCalculations.ts` - Statistical calculations for quartiles, outliers, etc.

### Utilities

1. `boxPlotCalculations.ts` - Statistical calculations for quartiles, outliers, etc.

## Type Definitions

```typescript
// definition.ts
import { BaseChartSettings, ChartDefinition } from "@/types/ChartTypes";
import { Filter } from "@/types/FilterTypes";
import { BoxSquare } from "lucide-react";

export interface BoxPlotStyleSettings {
  boxFill: string;
  boxStroke: string;
  boxStrokeWidth: number;
  medianStroke: string;
  medianStrokeWidth: number;
  whiskerStroke: string;
  whiskerStrokeWidth: number;
  outlierSize: number;
  outlierStroke: string;
  outlierFill: string;
}

export interface BoxPlotSettings extends BaseChartSettings {
  type: "boxplot";
  whiskerType: "tukey" | "minmax" | "stdDev";
  showOutliers: boolean;
  violinOverlay: boolean;
  beeSwarmOverlay: boolean;
  styles: BoxPlotStyleSettings;
  filters: Filter[];
}

export const boxPlotDefinition: ChartDefinition<BoxPlotSettings> = {
  type: "boxplot",
  name: "Box Plot",
  description: "Display distribution of values with quartiles and outliers",
  icon: BoxSquare,

  component: BoxPlot,
  settingsPanel: BoxPlotSettingsPanel,

  createDefaultSettings: (layout, field) => ({
    ...DEFAULT_CHART_SETTINGS,
    id: crypto.randomUUID(),
    field: field ?? "",
    type: "boxplot",
    title: "Box Plot",
    layout,
    whiskerType: "tukey",
    showOutliers: true,
    violinOverlay: false,
    beeSwarmOverlay: false,
    styles: {
      boxFill: "hsl(217.2 91.2% 59.8%)",
      boxStroke: "black",
      boxStrokeWidth: 1,
      medianStroke: "white",
      medianStrokeWidth: 2,
      whiskerStroke: "black",
      whiskerStrokeWidth: 1,
      outlierSize: 3,
      outlierStroke: "black",
      outlierFill: "none",
    },
    filters: [],
  }),

  validateSettings: (settings) => {
    return !!settings.field;
  },

  getFilterFunction: (settings, fieldGetter) => {
    // Similar to bar chart implementation
  },
};
```

## Implementation Details

### BoxPlot.tsx

```typescript
interface BoxPlotProps extends BaseChartProps<BoxPlotSettings> {}

export function BoxPlot({ settings, width, height, facetIds }: BoxPlotProps) {
  // Core rendering logic
  // Will handle all three variants (basic, violin, bee swarm)
}
```

### boxPlotCalculations.ts

```typescript
interface BoxPlotStats {
  q1: number;
  median: number;
  q3: number;
  iqr: number;
  whiskerLow: number;
  whiskerHigh: number;
  outliers: number[];
}

export function calculateBoxPlotStats(
  data: number[],
  whiskerType: BoxPlotSettings["whiskerType"]
): BoxPlotStats {
  // Statistical calculations
}

export function calculateKernelDensity(
  data: number[],
  bandwidth: number
): [number, number][] {
  // KDE calculation for violin plots
}

export function calculateBeeSwarmPositions(
  data: number[],
  width: number
): [number, number][] {
  // Point positioning for bee swarm overlay
}
```

## Implementation Phases

### Phase 1: Core Type Definitions and Chart Registry

- [x] Create interfaces in definition.ts
  - [x] Define style settings
  - [x] Set up chart registration
- [x] Create chart definition
- [x] Register with chart system
- [x] Add to chart creation UI
- [x] Add to chart registry in `src/charts/registry.ts`
- [x] Ensure proper type integration with existing chart system

### Phase 2: Statistical Functions

- [x] Implement core statistical functions
  - [x] Quartile calculations
  - [x] Whisker calculations
  - [x] Outlier detection
- [ ] Add group-by functionality
  - [ ] Modify `calculateBoxPlotStats` to handle grouped data
  - [ ] Calculate statistics per group
  - [ ] Test with sample data
- [ ] Implement advanced statistical features
  - [ ] KDE calculations for violin plots
  - [ ] Point positioning algorithm for bee swarm

### Phase 3: Base Box Plot Implementation

- [x] BoxPlot Component
  - [x] Data processing
  - [x] Scale generation
  - [x] Box rendering
  - [x] Whisker rendering
  - [x] Outlier rendering
  - [x] Axis integration
  - [x] Tooltip support
- [x] Add color field support
  - [x] Group data by color field
  - [x] Position multiple boxes
  - [ ] Apply color scale
  - [x] Handle axis scaling for multiple groups

### Phase 4: Plot Variants

- [x] Violin Plot Overlay
  - [x] KDE calculations
  - [x] Violin shape rendering
  - [x] Integration with base plot
- [x] Bee Swarm Overlay
  - [x] Point positioning algorithm
  - [x] Point rendering
  - [x] Integration with base plot

### Phase 5: Settings Panel and UI

- [x] Basic Settings Panel
  - [x] Basic field selection
  - [x] Whisker type selection
  - [x] Style controls
  - [x] Overlay toggles
- [ ] Advanced Settings
  - [x] Add color field selection
  - [x] Add color scale controls
  - [x] Update existing controls for group support
  - [x] Add advanced styling controls
  - [x] Add tooltips with detailed statistics

## Current Progress

- [x] Core box plot functionality
  - [x] Basic box plot rendering
  - [x] Statistical calculations
  - [x] Basic settings panel
  - [x] Integration with faceting system
  - [x] Filtering support
  - [x] Group-by functionality
  - [x] Tooltips with detailed statistics

## Next Steps

1. Add animations for transitions between different states
2. Implement responsive design for different screen sizes
3. Add export functionality for statistical data
4. Add documentation and examples

## Completed Features

### Core Box Plot

- [x] Basic box plot rendering with boxes, whiskers, and outliers
- [x] Statistical calculations (quartiles, IQR, outliers)
- [x] Customizable styles and colors
- [x] Support for both single and grouped data

### Settings Panel

- [x] Basic settings panel with essential controls
- [x] Color scheme selection
- [x] Outlier visibility toggle
- [x] Group-by field selection
- [x] Overlay toggles (violin, bee swarm)

### Faceting System Integration

- [x] Integration with existing faceting system
- [x] Support for faceted views
- [x] Proper scaling and positioning in faceted layouts

### Filtering Support

- [x] Integration with existing filtering system
- [x] Visual feedback for filtered data
- [x] Proper handling of filtered groups

### Group-by Functionality

- [x] Support for grouping data by categorical fields
- [x] Proper spacing and layout for grouped boxes
- [x] Color coding for different groups

### Overlays

- [x] Violin Plot Overlay
  - [x] KDE calculations
  - [x] Violin shape rendering
  - [x] Integration with base plot
- [x] Bee Swarm Overlay
  - [x] Point positioning algorithm
  - [x] Point rendering
  - [x] Integration with base plot

### Tooltips

- [x] Detailed statistical information
- [x] Interactive hover states
- [x] Support for all plot elements (box, whiskers, outliers, points)
