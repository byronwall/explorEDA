# Detailed Plan

## 1. Core Data Layer State

### Color Scale Types

```typescript
interface ColorScale {
  id: string;
  name: string;
  type: "numerical" | "categorical";
}

interface NumericalColorScale extends ColorScale {
  type: "numerical";
  palette: string; // d3 color scale name
  min: number;
  max: number;
}

interface CategoricalColorScale extends ColorScale {
  type: "categorical";
  palette: string[]; // array of colors
  mapping: Map<string, string>; // value -> color mapping
}
```

### Minimal State Updates

- Add `colorScales: (NumericalColorScale | CategoricalColorScale)[]` to DataLayerState
- Add `activeColorScale?: string` to ChartSettings

## 2. Custom Hook Implementation

### 2.1 useColorScales Hook

```typescript
interface UseColorScalesReturn {
  // Scale Management
  addColorScale: (scale: Omit<ColorScale, "id">) => void;
  removeColorScale: (id: string) => void;
  updateColorScale: (id: string, updates: Partial<ColorScale>) => void;

  // Color Getters
  getColorForValue: (scaleId: string, value: datum) => string;
  getScaleById: (id: string) => ColorScale | undefined;
  getAvailableScales: () => ColorScale[];

  // Utilities
  createDefaultNumericalScale: (name: string, min: number, max: number) => void;
  createDefaultCategoricalScale: (name: string, values: string[]) => void;

  // D3 Integration
  getD3Scale: (scaleId: string) => d3.ScaleSequential | d3.ScaleOrdinal;
}

function useColorScales(): UseColorScalesReturn {
  const colorScales = useDataLayer((state) => state.colorScales);
  const updateDataLayer = useDataLayer((state) => state.updateColorScales);

  // Implementation details here...
}
```

### 2.2 Hook Features

1. Scale Management:

   - Create/update/delete color scales
   - Handle scale validation
   - Manage default scales

2. Color Calculations:

   - Cache color mappings
   - Handle missing values
   - Provide d3 scale objects

3. Performance Optimizations:
   - Memoize color calculations
   - Batch updates to DataLayer
   - Cache d3 scale objects

## 3. Component Integration

### 3.1 Chart Components

```typescript
function BarChart({ settings }: BarChartProps) {
  const { getColorForValue } = useColorScales();

  // Use getColorForValue in render logic
}
```

### 3.2 UI Components

1. ColorScaleSelector:

```typescript
function ColorScaleSelector({ onSelect }: ColorScaleSelectorProps) {
  const { getAvailableScales } = useColorScales();
  // Implementation using hook
}
```

2. ColorScaleEditor:

```typescript
function ColorScaleEditor({ scaleId }: ColorScaleEditorProps) {
  const { getScaleById, updateColorScale } = useColorScales();
  // Implementation using hook
}
```

## 4. Implementation Order

1. Core Data Layer:

   - Add minimal state for color scales
   - Add basic update functions

2. Hook Development:

   - Implement useColorScales hook
   - Add core functionality
   - Add performance optimizations

3. Component Integration:

   - Update chart components to use hook
   - Create UI components using hook
   - Add color scale management UI

4. Polish and Testing:
   - Add error handling
   - Implement caching
   - Add hook-specific tests

## 5. Technical Considerations

### 5.1 Hook Performance

- Memoize expensive calculations
- Cache d3 scale objects
- Batch updates to DataLayer

### 5.2 State Management

- Keep minimal state in DataLayer
- Handle complex logic in hook
- Use hook for all color operations

### 5.3 Error Handling

- Validate color values in hook
- Provide fallback colors
- Handle edge cases
