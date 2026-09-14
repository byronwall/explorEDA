# Calculation Engine Rework: Lazy Execution

## Current Issues

Based on the review of the current implementation in `DataLayerProvider.tsx` and the notes in `notes_comments.md`, the following issues have been identified:

1. Calculations are pre-computed for all rows when they are added or updated
2. This is inefficient, especially for large datasets or complex calculations
3. The calculation preview functionality is broken
4. The data flow is not performant

## Proposed Solution: Lazy Calculation Execution

Instead of pre-computing all calculations when they are defined, we should implement a lazy execution approach where calculations are only executed when their results are actually requested through the `getColumnData` method.

## Implementation Plan

### 1. Modify the CalculationManager Class

```typescript
class CalculationManager<T extends DatumObject> {
  // Existing properties
  private calculations: Map<string, CalculationDefinition>;
  private data: (T & HasId)[];

  // Remove the calculationResults from here - it will be stored in DataLayerProvider

  // New properties
  private dirtyCalculations: Set<string>; // Track which calculations need recomputation

  constructor(data: (T & HasId)[]) {
    this.calculations = new Map();
    this.data = data;
    this.dirtyCalculations = new Set();
  }

  // Execute calculation for a specific row and column
  public executeCalculationForRow(
    resultColumnName: string,
    rowId: number
  ): any {
    // Check if calculation exists
    const calculation = this.calculations.get(resultColumnName);
    if (!calculation) return undefined;

    // Find the row data
    const row = this.data.find((d) => d.__ID === rowId);
    if (!row) return undefined;

    // Execute calculation for this specific row only
    try {
      // Use the parser and calculator to compute just one result
      return this.executeExpression(calculation.expression, row);
    } catch (error) {
      console.error(`Error executing calculation for row ${rowId}:`, error);
      return undefined;
    }
  }

  // Execute a calculation for all rows
  public executeCalculationForAllRows(
    resultColumnName: string
  ): Record<number, any> {
    const results: Record<number, any> = {};
    const calculation = this.calculations.get(resultColumnName);

    if (!calculation) return results;

    // Execute for each row
    for (const row of this.data) {
      try {
        results[row.__ID] = this.executeExpression(calculation.expression, row);
      } catch (error) {
        console.error(
          `Error executing calculation for row ${row.__ID}:`,
          error
        );
        results[row.__ID] = undefined;
      }
    }

    // Remove from dirty list
    this.dirtyCalculations.delete(resultColumnName);

    return results;
  }

  // Get list of fields that need to be invalidated
  public getFieldsToInvalidate(): string[] {
    return Array.from(this.dirtyCalculations);
  }

  // Mark a calculation as dirty
  public markCalculationDirty(resultColumnName: string): void {
    this.dirtyCalculations.add(resultColumnName);
  }

  // Mark all calculations as dirty
  public markAllCalculationsDirty(): void {
    for (const [resultColumnName] of this.calculations) {
      this.dirtyCalculations.add(resultColumnName);
    }
  }

  // Modify existing methods to mark calculations as dirty instead of executing them
  public updateCalculation(
    resultColumnName: string,
    updates: Partial<CalculationDefinition>
  ): void {
    // Update the calculation definition
    // ...existing code...

    // Mark as dirty
    this.markCalculationDirty(updates.resultColumnName || resultColumnName);

    // If the result column name changed, mark the new one as dirty too
    if (
      updates.resultColumnName &&
      updates.resultColumnName !== resultColumnName
    ) {
      this.markCalculationDirty(updates.resultColumnName);
    }

    // Return list of fields that need to be invalidated in the cache
    return [resultColumnName, updates.resultColumnName].filter(
      Boolean
    ) as string[];
  }

  // For calculation preview
  public executeTemporaryCalculation(
    calculation: CalculationDefinition,
    rowId: number
  ): any {
    const row = this.data.find((d) => d.__ID === rowId);
    if (!row) return undefined;

    try {
      return this.executeExpression(calculation.expression, row);
    } catch (error) {
      console.error(
        `Error executing temporary calculation for row ${rowId}:`,
        error
      );
      return undefined;
    }
  }
}
```

### 2. Update the DataLayerProvider's getColumnData Method

```typescript
getColumnData(field: string | undefined) {
  const { columnCache, data, calculationManager } = get();

  if (!field) {
    return {};
  }

  // Check if it's already in the cache
  if (columnCache[field]) {
    return columnCache[field];
  }

  // Check if it's a calculated field
  const calculation = calculationManager?.getCalculation(field);
  if (calculation) {
    // Lazy execution: compute the results for this calculation now
    const results = calculationManager.executeCalculationForAllRows(field);

    // Cache the results
    set(state => ({
      columnCache: {
        ...state.columnCache,
        [field]: results
      }
    }));

    return results;
  }

  // Otherwise, it's a regular column
  const columnData: { [key: IdType]: datum } = {};
  data.forEach((row) => {
    columnData[row.__ID] = row[field];
  });

  // Cache the results
  set(state => ({
    columnCache: {
      ...state.columnCache,
      [field]: columnData
    }
  }));

  return columnData;
}
```

### 3. Modify the executeCalculations Method

```typescript
executeCalculations: async () => {
  const { calculationManager } = get();
  if (!calculationManager) {
    throw new Error("Calculation manager not initialized");
  }

  // Mark all calculations as dirty
  calculationManager.markAllCalculationsDirty();

  // Get the list of fields to invalidate
  const fieldsToInvalidate = calculationManager.getFieldsToInvalidate();

  // Clear the column cache for all calculated fields
  set((state) => {
    const newColumnCache = { ...state.columnCache };
    fieldsToInvalidate.forEach((field) => {
      delete newColumnCache[field];
    });
    return { columnCache: newColumnCache };
  });
};
```

### 4. Update the Calculation Preview Functionality

The calculation preview should use the same lazy execution mechanism:

```typescript
// In a calculation preview component
const previewCalculation = (
  expression: string,
  previewRowCount: number = 5
) => {
  const { data, calculationManager } = useDataLayer((state) => ({
    data: state.data,
    calculationManager: state.calculationManager,
  }));

  // Create a temporary calculation
  const tempCalculation: CalculationDefinition = {
    id: "preview",
    name: "Preview",
    resultColumnName: "__preview",
    expression: parseExpression(expression),
    isActive: true,
  };

  // Get preview results for a few rows
  const previewResults: any[] = [];
  for (let i = 0; i < Math.min(previewRowCount, data.length); i++) {
    const rowId = data[i].__ID;
    const result = calculationManager?.executeTemporaryCalculation(
      tempCalculation,
      rowId
    );
    previewResults.push({
      rowId,
      rowData: data[i],
      result,
    });
  }

  return previewResults;
};
```

### 5. Handling Calculation Dependencies

When a calculation depends on other calculated fields, we need to ensure they're computed in the correct order:

```typescript
// Add to CalculationManager
public getDependencies(resultColumnName: string): string[] {
  const calculation = this.calculations.get(resultColumnName);
  if (!calculation) return [];

  return calculation.expression.dependencies.filter(dep =>
    this.calculations.has(dep)
  );
}

// Update executeCalculationForRow to handle dependencies
public executeCalculationForRow(resultColumnName: string, rowId: number): any {
  // Check if calculation exists
  const calculation = this.calculations.get(resultColumnName);
  if (!calculation) return undefined;

  // Get dependencies
  const dependencies = this.getDependencies(resultColumnName);

  // Ensure all dependencies are calculated first
  const dependencyValues: Record<string, any> = {};
  for (const dep of dependencies) {
    dependencyValues[dep] = this.executeCalculationForRow(dep, rowId);
  }

  // Now execute this calculation with dependencies available
  // ...
}
```

## Benefits of Improved Architecture

1. **Clear Separation of Concerns**:

   - CalculationManager handles calculation execution logic
   - DataLayerProvider manages caching and data access

2. **Performance Improvement**:

   - Calculations are only executed when needed
   - Results are cached in the DataLayerProvider

3. **Memory Efficiency**:

   - Results are only stored for calculations that have been requested

4. **Simplified Data Flow**:

   - Clearer separation between calculation definition and execution
   - Better invalidation of cached results

5. **Dependency Management**:
   - Calculations that depend on other calculations are handled correctly

## Implementation Steps

1. Refactor the `CalculationManager` class to support lazy execution
2. Update the `getColumnData` method in `DataLayerProvider` to trigger calculation execution on demand
3. Implement cache invalidation based on the fields returned by CalculationManager
4. Modify the calculation preview functionality to use the lazy execution mechanism
5. Update the UI to show calculation status (e.g., "not computed yet", "computed", "error")
6. Add a calculation icon to fields in the summary table to indicate they are calculated fields

## Additional Improvements

1. Remove the `isActive` flag and treat all calculations as active
2. Implement dependency tracking to invalidate dependent calculations when source data changes
3. Add caching with proper invalidation to avoid recalculating unchanged values
4. Optimize vector operations for calculations that process entire columns
5. Implement a text-based editor for bulk editing calculations
