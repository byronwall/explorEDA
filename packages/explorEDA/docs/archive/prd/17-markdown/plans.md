# Markdown Editor Implementation Plan

## File Structure

```
src/
  components/
    charts/
      Markdown/
        Markdown.tsx         # Main component
        MarkdownSettings.tsx # Settings panel (minimal)
        definition.ts       # Chart definition
```

## Interfaces and Types

```typescript
// In ChartTypes.ts
export interface MarkdownSettings extends BaseChartSettings {
  type: "markdown";
  content: string;  // The markdown content
}

// Add to CHART_TYPES array
{ value: "markdown", label: "Markdown", icon: FileText }
```

## Component Details

### Markdown.tsx

- Props: `BaseChartProps<MarkdownSettings>`
- Uses MinimalTiptapEditor for editing
- Renders markdown content in view mode
- No filtering or data integration needed

### MarkdownSettings.tsx

- Props: `ChartSettingsPanelProps<MarkdownSettings>`
- Minimal settings panel - only title editing
- No additional configuration needed

### definition.ts

- Implements `ChartDefinition<MarkdownSettings>`
- Simple implementation since no data processing needed
- No filtering or faceting support

## Implementation Plan

### Phase 1: Core Setup

- [ ] Add markdown type to `ChartTypes.ts`
  - [ ] Add MarkdownSettings interface
  - [ ] Add to CHART_TYPES array
  - [ ] Update ChartSettings union type

### Phase 2: Component Implementation

- [ ] Create Markdown component

  - [ ] Implement MinimalTiptapEditor integration
  - [ ] Handle content updates
  - [ ] Style editor appropriately

- [ ] Create minimal settings panel
  - [ ] Title editing only
  - [ ] No additional settings needed

### Phase 3: Chart Definition

- [ ] Create markdown definition
  - [ ] Basic metadata (name, icon, etc.)
  - [ ] Simple settings creation
  - [ ] No filtering or data processing

## Status

### Phase 1: Core Setup

- [ ] Add markdown type to ChartTypes.ts
  - [ ] MarkdownSettings interface
  - [ ] CHART_TYPES array update
  - [ ] ChartSettings union type update

### Phase 2: Component Implementation

- [ ] Markdown component

  - [ ] Basic structure
  - [ ] TipTap integration
  - [ ] Styling

- [ ] Settings panel
  - [ ] Basic structure
  - [ ] Title editing

### Phase 3: Chart Definition

- [ ] Definition file
  - [ ] Basic metadata
  - [ ] Settings management
  - [ ] Component registration

## Current Progress

None - Planning phase

### Next steps

1. Begin with Phase 1 by updating ChartTypes.ts
2. Create basic component structure
3. Implement chart definition
4. Test integration with existing chart system
