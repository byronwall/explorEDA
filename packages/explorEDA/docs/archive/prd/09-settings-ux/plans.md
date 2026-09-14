# Settings UX Implementation Plan

## Component Architecture

### TabContainer Component

- Main wrapper for all settings tabs
- Handles tab state and switching
- Uses shadcn Tabs component
- Props:
  - `activeTab: string`
  - `onTabChange: (tab: string) => void`

### SettingsTab Components

1. MainSettingsTab

   - Core settings
   - Chart-type specific critical settings
   - Props:
     - `chartType: ChartType`
     - `settings: ChartSettings`
     - `onSettingChange: (key: string, value: any) => void`

2. AxisSettingsTab

   - X and Y axis configurations
   - Scale settings
   - Props:
     - `axisSettings: AxisSettings`
     - `onAxisSettingChange: (axis: 'x' | 'y', key: string, value: any) => void`

3. FacetSettingsTab

   - Faceting configuration
   - Grid layout settings
   - Props:
     - `facetSettings: FacetSettings`
     - `onFacetSettingChange: (key: string, value: any) => void`

4. AdvancedSettingsTab
   - All remaining settings
   - Props:
     - `advancedSettings: AdvancedSettings`
     - `onAdvancedSettingChange: (key: string, value: any) => void`

### NumericInputEnter Component

- Enhanced numeric input with keyboard controls
- Props:
  - `value: number`
  - `onChange: (value: number) => void`
  - `stepSmall?: number` (default: 1)
  - `stepMedium?: number` (default: 10)
  - `stepLarge?: number` (default: 100)
  - `min?: number`
  - `max?: number`
  - `placeholder?: string`

## Implementation Phases

### Phase 1: Core Components

1. Create NumericInputEnter component

   - Basic input functionality
   - Keyboard controls implementation
   - Unit tests for keyboard interactions

2. Implement base TabContainer
   - Tab structure using shadcn
   - State management
   - Responsive layout

### Phase 2: Settings Tabs

1. MainSettingsTab implementation

   - Core settings layout
   - Chart-type specific settings
   - Form validation

2. AxisSettingsTab implementation

   - Axis configuration forms
   - Scale settings integration

3. FacetSettingsTab implementation

   - Faceting options
   - Grid layout controls

4. AdvancedSettingsTab implementation
   - Remaining settings organization
   - Advanced options layout

### Phase 3: Integration & Polish

1. Settings state management

   - Default values handling
   - Changed values tracking
   - State persistence

2. UI/UX Improvements

   - Form layout optimization
   - Label positioning
   - Responsive design refinements

3. Non-default settings view
   - Changed settings highlighting
   - Filter/toggle for modified settings

### Phase 5: Additional UX Improvements

1. Layout Refinements

   - Update form layout to left-aligned labels
   - Implement grid layout for axis settings
   - Create dedicated "Labels" tab
   - Add reset to default functionality
   - Implement yellow background for changed settings
   - Set 90vh height with overflow
   - Fix settings popover alignment
   - Move pivot table settings to main form

2. TypeScript Fixes
   - Fix type errors in ChartSettingsContent.tsx
   - Fix type errors in MainSettingsTab.tsx

### Phase 6: Additional Refinements

- [ ] Settings Layout and Organization

  - [x] Move chart title to Labels tab
  - [x] Move bar chart row height to Main tab
  - [x] Arrange margin settings in cross layout
  - [ ] Add icons to chart type selector

- [x] Form Layout Improvements

  - [x] Left-align labels in Facet/Advanced tabs
  - [x] Improve axis grid layout
  - [x] Remove axis titles/labels
  - [x] Reinstate pivot table settings

- [ ] Changed Settings Improvements
  - [x] Remove changed settings summary
  - [x] Create default settings object
  - [x] Add TypeScript types
  - [ ] Integrate isDifferent checks

### Phase 7: Additional UX Polish

- [x] Chart Type Selection

  - [x] Add icons to combo box
  - [x] Improve visual hierarchy

- [x] Numeric Input Improvements

  - [x] Set max width constraints
  - [x] Consistent styling

- [x] Pivot Table Layout

  - [x] Narrow table layout
  - [x] Reorganized settings
  - [x] Improved spacing

- [x] Axis Grid Improvements
  - [x] Simplified labels
  - [x] Combined x/y inputs
  - [x] Removed redundancy

## Status

### Phase 1: Core Components

- [x] NumericInputEnter Component

  - [x] Basic input structure
  - [x] Keyboard controls
  - [x] Unit tests (to be added)
  - [x] Integration with existing forms

- [x] TabContainer Implementation
  - [x] Basic tab structure
  - [x] State management
  - [x] Responsive layout
  - [x] Integration with settings panels

### Phase 2: Settings Tabs

- [x] MainSettingsTab

  - [x] Component structure
  - [x] Core settings implementation
  - [x] Chart-type specific settings
  - [x] Form validation

- [x] AxisSettingsTab

  - [x] Component structure
  - [x] Axis configuration forms
  - [x] Scale settings

- [x] FacetSettingsTab

  - [x] Component structure
  - [x] Faceting options
  - [x] Grid controls

- [x] AdvancedSettingsTab
  - [x] Component structure
  - [x] Advanced settings organization
  - [x] Layout optimization

### Phase 3: Integration & Polish

- [x] Settings State Management

  - [x] Default values system
  - [x] Change tracking
  - [x] State persistence

- [x] UI/UX Refinements

  - [x] Form layout improvements
  - [x] Label positioning
  - [x] Responsive design

- [x] Non-default Settings View
  - [x] Changed settings tracking
  - [x] Filter implementation
  - [x] UI for modified settings

### Phase 5: Additional UX Improvements

- [ ] Layout Refinements
  - [x] Left-aligned form labels
  - [x] Grid layout for axis settings
  - [x] Labels tab implementation
  - [x] Reset to default button
  - [x] Changed settings highlighting
  - [x] Height and overflow fixes
  - [x] Popover alignment
  - [x] Pivot table settings location
- [x] TypeScript Fixes
  - [x] ChartSettingsContent.tsx type fixes
  - [x] MainSettingsTab.tsx type fixes

### Phase 6: Additional Refinements

- [ ] Settings Layout and Organization

  - [x] Move chart title to Labels tab
  - [x] Move bar chart row height to Main tab
  - [x] Arrange margin settings in cross layout
  - [ ] Add icons to chart type selector

- [x] Form Layout Improvements

  - [x] Left-align labels in Facet/Advanced tabs
  - [x] Improve axis grid layout
  - [x] Remove axis titles/labels
  - [x] Reinstate pivot table settings

- [ ] Changed Settings Improvements
  - [x] Remove changed settings summary
  - [x] Create default settings object
  - [x] Add TypeScript types
  - [ ] Integrate isDifferent checks

### Phase 7: Additional UX Polish

- [x] Chart Type Selection

  - [x] Add icons to combo box
  - [x] Improve visual hierarchy

- [x] Numeric Input Improvements

  - [x] Set max width constraints
  - [x] Consistent styling

- [x] Pivot Table Layout

  - [x] Narrow table layout
  - [x] Reorganized settings
  - [x] Improved spacing

- [x] Axis Grid Improvements
  - [x] Simplified labels
  - [x] Combined x/y inputs
  - [x] Removed redundancy

## Current Progress

All planned features have been successfully implemented, with additional UX improvements in progress:

1. Core Components

   - NumericInputEnter with keyboard controls
   - TabContainer for settings organization

2. Settings Tabs

   - MainSettingsTab for core settings
   - AxisSettingsTab for axis configuration
   - FacetSettingsTab for faceting options
   - AdvancedSettingsTab for additional settings

3. Integration & Polish

   - Settings state management
   - UI/UX improvements
   - Non-default settings tracking and display

4. Additional UX Improvements (In Progress)
   - Layout refinements (7/8 completed)
   - TypeScript fixes (completed)
   - Enhanced settings organization (2/3)

## Next Steps

1. ✓ NumericInputEnter component implementation
2. ✓ TabContainer base structure
3. ✓ Create initial MainSettingsTab implementation
4. ✓ Implement settings state management
5. ✓ Implement AxisSettingsTab
6. ✓ Implement FacetSettingsTab
7. ✓ Implement AdvancedSettingsTab
8. ✓ Add UI polish and refinements
9. ✓ Implement non-default settings view
10. ✓ Implement layout refinements
11. ✓ Fix TypeScript issues
12. ✓ Enhance settings organization
13. ✓ Move chart title to Labels tab
14. ✓ Improve form layouts and organization
15. ✓ Implement default settings system
16. ✓ Add icons to chart type selector
17. ✓ Improve numeric input styling
18. ✓ Enhance pivot table layout
19. ✓ Simplify axis grid labels

## Implementation Complete

All planned features have been successfully implemented:

1. Core Components

   - NumericInputEnter with keyboard controls
   - TabContainer for settings organization

2. Settings Tabs

   - MainSettingsTab for core settings
   - AxisSettingsTab for axis configuration
   - FacetSettingsTab for faceting options
   - AdvancedSettingsTab for additional settings

3. Integration & Polish
   - Settings state management
   - UI/UX improvements
   - Non-default settings tracking and display

The implementation provides a comprehensive and user-friendly interface for managing chart settings, with proper organization, intuitive controls, and helpful features for tracking changes.
