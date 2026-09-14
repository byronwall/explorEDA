# Summary table improvements

Overall goal is to reduce the size of the table so it can appear in a left sidebar that is easily collapsed.

## Requirements

- Add a left sidebar that is displayed by default - collapse when icon is clicked
- Move the summary table into the sidebar
- Adorn the right side with the main charting interface
- Reduce the width of the table via
  - Show icon for data type instead of word
  - Show the unique count instead of the total count - show total in tooltip
  - If there are any nulls, show an icon, show null count in tooltip
  - Put the stats in badges with simple icons for min max and most common values

## Implementation Plan

### Phase 1: Sidebar Component

#### Components

- `components/layout/Sidebar.tsx`

  ```typescript
  interface SidebarProps {
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
  }
  ```

- `components/layout/MainLayout.tsx`

  ```typescript
  interface MainLayoutProps {
    children: React.ReactNode;
  }
  ```

#### Actions

1. Create responsive sidebar layout
2. Add collapse/expand functionality
3. Implement smooth transitions
4. Add resize handle for width adjustment

### Phase 2: Table Redesign

#### Components

- `components/SummaryTable/CompactSummaryTable.tsx`

  ```typescript
  interface CompactSummaryTableProps {
    data: ColumnSummary[];
    onSort: (column: string) => void;
    onChartCreate: (column: string) => void;
  }
  ```

#### Actions

1. Create data type icons for each type
2. Implement compact row design
3. Add tooltips for expanded information
4. Update sorting mechanism for new layout

### Phase 3: Stats Display

#### Components

- `components/SummaryTable/StatBadge.tsx`

  ```typescript
  interface StatBadgeProps {
    type: "min" | "max" | "common";
    value: string | number;
    icon: LucideIcon;
  }
  ```

#### Actions

1. Design compact stat badges
2. Add appropriate icons for each stat type
3. Implement tooltips for detailed stats
4. Create hover interactions

### Phase 4: Integration

#### Actions

1. Move existing table into sidebar
2. Update main content area layout
3. Implement responsive behavior
4. Add performance optimizations
5. Test and refine interactions

## Status

### Phase 1: Sidebar Component

- [x] Basic sidebar structure
  - [x] Component scaffolding
  - [x] Basic styling
  - [x] Responsive layout
- [x] Collapse functionality
  - [x] Toggle button
  - [x] Animation
  - [x] State management
- [x] Resize functionality
  - [x] Drag handle
  - [x] Width constraints
  - [x] Persistence

### Phase 2: Table Redesign

- [x] Data type display
  - [x] Icon selection
  - [x] Icon component
  - [x] Type mapping
- [x] Compact layout
  - [x] Row design
  - [x] Column layout
  - [x] Spacing optimization
- [x] Information display
  - [x] Tooltip components
  - [x] Hover states
  - [x] Interactive elements

### Phase 3: Stats Display

- [x] Badge components
  - [x] Base badge design
  - [x] Icon integration
  - [x] Variant styles
- [x] Stats formatting
  - [x] Number formatting
  - [x] Text truncation
  - [x] Tooltip content
- [x] Interactive features
  - [x] Hover states
  - [x] Click actions
  - [x] Keyboard navigation

### Phase 4: Integration

- [x] Layout integration
  - [x] Component composition
  - [x] State management
  - [x] Event handling

### Current Progress

Done.
