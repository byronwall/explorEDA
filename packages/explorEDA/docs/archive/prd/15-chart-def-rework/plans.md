# Chart Definition Rework Implementation Plan

## Core Types

```typescript
interface ChartDefinition<TSettings extends BaseChartSettings = ChartSettings> {
  // Metadata
  type: ChartType;
  name: string;
  description: string;
  icon: LucideIcon;

  // Component References
  component: React.ComponentType<BaseChartProps>;
  settingsPanel: React.ComponentType<ChartSettingsPanelProps>;

  // Settings Management
  createDefaultSettings: () => TSettings;
  validateSettings: (settings: TSettings) => boolean;

  // Filtering
  filterData: (data: any[], filters: Filter) => any[];
  createFilterFromSelection: (selection: any, settings: TSettings) => Filter;
}
```

## Implementation Plan

### Phase 1: Core Infrastructure

- [x ] Create base chart registry system

  - [x] Implement `ChartDefinition` interface
  - [x] Create registry class with `Map<ChartType, ChartDefinition>`
  - [x] Add registration and lookup methods
  - [x] Add type safety and validation

- [x] Set up file structure
  - [x] Create `/src/charts` directory
  - [x] Add `/src/charts/registry.ts`
  - [x] Add `/src/charts/types.ts`
  - [x] Create `/src/charts/utils` for shared utilities
  - [x] Create template structure for individual chart folders

### Phase 2: Core Components Update

- [ x] Update `ChartRenderer` to use registry

  - [x] Remove switch statements
  - [x] Add error boundaries
  - [x] Handle async transformations

- [ ] Update `MainSettingsTab` to use registry

  - [ ] Remove switch statements
  - [ ] Add validation handling
  - [ ] Support dynamic features

- [ ] Update `DataLayerProvider` integration
  - [ ] Modify chart operations to use registry
  - [ ] Add support for async transformations
  - [ ] Handle progressive loading

### Phase 3: Utilities and Shared Functions

- [ ] Create transform pipeline utilities

  - [ ] Implement `composeTransforms` helper
  - [ ] Add common transform functions
  - [ ] Support async transforms

- [ ] Create filter utilities

  - [ ] Implement filter composition
  - [ ] Add common filter predicates
  - [ ] Support complex filter types

- [ ] Add shared chart utilities
  - [ ] Color scale helpers
  - [ ] Axis configuration helpers
  - [ ] Data binning utilities
  - [ ] Faceting helpers

### Phase 4: Chart Implementation Framework

- [ ] Create base chart implementation template

  - [ ] Define folder structure
  - [ ] Create type templates
  - [ ] Add documentation

- [ ] Implement chart migration process
  - [ ] Document migration steps
  - [ ] Create migration utilities
  - [ ] Add validation helpers

### Phase 5: Chart Implementations

- [x ] Bar Chart Implementation
- [x ] Row Chart Implementation
- [x ] Scatter Plot Implementation
- [x ] 3D Scatter Plot Implementation
- [ ] Pivot Table Implementation
- [ ] Summary Table Implementation
- [ ] Data Table Implementation

## Status

### Phase 1: Core Infrastructure

- [x] Create base chart registry system
  - [x] Implement `ChartDefinition` interface
  - [x] Create registry class
  - [x] Add registration methods
  - [x] Add type safety

### Phase 2: Core Components Update

- [x] Create BarChart implementation
  - [x] Create chart definition
  - [x] Create settings panel
  - [x] Move component to new location
  - [ ] Fix type errors in component
    - [x] Fix Filter type usage
    - [x] Fix ChartSettings type compatibility
    - [x] Fix facetIds type compatibility
    - [ ] Fix remaining type errors
      - [ ] Fix filterValues type compatibility
      - [ ] Fix implicit any type in filter function

### Current Progress

- Core types defined in `src/types/ChartTypes.ts`
- Registry implementation created in `src/charts/registry.ts`
- Created BarChart definition with new system
- Created BarChartSettingsPanel component
- Moved BarChart component to new location
- Updated imports and file structure
- Fixed most type errors in BarChart component
- Fixed facetIds type compatibility
- Identified remaining type issues:
  - filterValues property missing from ChartSettings type
  - Implicit any type in filter function

### Next Steps

- Fix remaining type errors in BarChart component
  - Add filterValues property to ChartSettings type
  - Add type annotation for filter function parameter
- Continue with other chart implementations
- Add providers and context setup
- Update chart renderer to use registry
