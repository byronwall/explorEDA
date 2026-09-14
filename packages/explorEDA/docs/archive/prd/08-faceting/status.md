## Implementation Plan

### Phase 1: Data Model Updates

1. Update `ChartTypes.ts` to include faceting settings

   - Add facet configuration to `BaseChartSettings` using discriminated union
   - Define facet types (grid/wrap)
   - Add facet-specific properties

2. Create a facet context provider
   - Implement a hook with context for sharing axis limits between faceted charts
   - Track extreme axis limits across all facets (both numerical and categorical)
   - Provide methods for charts to broadcast and consume axis limits

### Phase 2: Facet Layout Components

1. Create a `FacetGridLayout` component

   - Use a table layout for grid faceting
   - Support row and column headers for facet values
   - Handle proper sizing of child charts

2. Create a `FacetWrapLayout` component

   - Use flexbox/grid for wrapped layout
   - Support configurable number of columns
   - Handle proper sizing of child charts

3. Create a `FacetContainer` component
   - Determine which layout to use based on settings
   - Handle data splitting for facets
   - Pass appropriate data subsets to child charts

### Phase 3: Chart Component Updates

1. Update `PlotChartPanel.tsx`

   - Add support for rendering in facet mode
   - Handle size constraints when in a facet

2. Update each chart component to support faceting:

   - `BarChart.tsx`
   - `RowChart.tsx`
   - `ScatterPlot.tsx`
   - `PivotTable.tsx`
   - Ensure charts can render with facet-specific data
   - Implement axis synchronization

3. Update `useGetLiveData.tsx`
   - Add support for facet-specific data filtering

### Phase 4: UI Controls for Faceting

1. Update `ChartSettingsContent.tsx`

   - Add facet configuration options
   - Support selection of facet variables
   - Toggle between grid and wrap modes

2. Update `PlotManager.tsx`
   - Handle faceted chart layouts in the grid
   - Adjust sizing logic for faceted charts

## Status

### Phase 1: Data Model Updates

- [x] Update ChartTypes.ts
  - [x] Add FacetSettings discriminated union
  - [x] Update BaseChartSettings
- [x] Create FacetAxisProvider
  - [x] Implement context for axis synchronization (numerical and categorical)
  - [x] Add hooks for registering and retrieving axis limits

### Phase 2: Facet Layout Components

- [x] Create FacetContainer component
  - [x] Implement data splitting logic
  - [x] Add conditional rendering for grid vs wrap
- [x] Create FacetGridLayout component
  - [x] Implement table-based layout
  - [x] Support row and column headers
- [x] Create FacetWrapLayout component
  - [x] Implement grid-based layout
  - [x] Support configurable columns

### Phase 3: Chart Component Updates

- [x] Update PlotChartPanel.tsx
  - [x] Add facet container integration
  - [x] Handle facet-specific rendering
- [x] Update chart components
  - [x] Update useGetLiveData.tsx to support facet-specific data filtering
  - [x] Update individual chart components to support facet axis synchronization
    - [x] BarChart.tsx
    - [x] RowChart.tsx
    - [x] ScatterPlot.tsx
    - [x] PivotTable.tsx

### Phase 4: UI Controls for Faceting

- [x] Update ChartSettingsContent.tsx
  - [x] Add facet configuration UI
  - [x] Support variable selection for faceting
- [x] Update PlotManager.tsx
  - [x] Handle faceted chart layouts
  - [x] Adjust sizing logic for faceted charts

## Current Progress

- Basic faceting infrastructure implemented
- Facet layout components created
- Data filtering for facets implemented
- UI controls for faceting added
- Chart rendering in facets implemented
- Axis synchronization across facets implemented
- Layout adjustments for faceted charts implemented

### Next steps

- Test the implementation with various chart types and data
- Gather user feedback
- Consider additional enhancements like facet-specific titles or legends
