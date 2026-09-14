# Chart Faceting Implementation Plan

## Overview

This document outlines the implementation plan for adding faceting capabilities to all chart types in the data visualization application. Faceting allows users to create multiple small charts based on unique values of a specified variable, either in a grid layout (with row and column variables) or a wrapped layout (with a single variable).

## Requirements Summary

- Support faceting for all chart types (Row Chart, Bar Chart, Scatter Plot, Pivot Table)
- Two faceting modes:
  - Grid: Requires 2 variables (row and column)
  - Wrap: Requires 1 variable (row) and number of columns
- Each facet represents a unique value of the facet variable
- Charts should be aware of each other's axis limits
- A component above the chart will handle the DOM layout for facets

## Detailed Implementation

### 1. ChartTypes.ts Updates

```typescript
// Base facet settings interface
export interface BaseFacetSettings {
  enabled: boolean;
  type: "grid" | "wrap";
}

// Grid facet settings
export interface GridFacetSettings extends BaseFacetSettings {
  type: "grid";
  rowVariable: string;
  columnVariable: string;
}

// Wrap facet settings
export interface WrapFacetSettings extends BaseFacetSettings {
  type: "wrap";
  rowVariable: string;
  columns: number; // Number of columns in wrap mode
}

// Discriminated union for facet settings
export type FacetSettings = GridFacetSettings | WrapFacetSettings;

// Update BaseChartSettings
export interface BaseChartSettings {
  // ... existing fields
  facet?: FacetSettings;
  facetIds?: string[]; // IDs for the current facet when in facet mode
}
```

### 2. Facet Context Provider

```typescript
// src/providers/FacetAxisProvider.tsx
import { createContext, useContext, useState, ReactNode } from "react";

// Numerical axis limits
interface NumericalAxisLimits {
  type: "numerical";
  min: number;
  max: number;
}

// Categorical axis limits
interface CategoricalAxisLimits {
  type: "categorical";
  categories: Set<string>;
}

// Union type for axis limits
type AxisLimits = NumericalAxisLimits | CategoricalAxisLimits;

interface FacetAxisContextType {
  registerAxisLimits: (
    chartId: string,
    axis: "x" | "y",
    limits: AxisLimits
  ) => void;
  getGlobalAxisLimits: (axis: "x" | "y") => AxisLimits | null;
}

const FacetAxisContext = createContext<FacetAxisContextType | null>(null);

export function FacetAxisProvider({ children }: { children: ReactNode }) {
  const [axisLimits, setAxisLimits] = useState<{
    x: Record<string, AxisLimits>;
    y: Record<string, AxisLimits>;
  }>({ x: {}, y: {} });

  const registerAxisLimits = (
    chartId: string,
    axis: "x" | "y",
    limits: AxisLimits
  ) => {
    setAxisLimits((prev) => ({
      ...prev,
      [axis]: {
        ...prev[axis],
        [chartId]: limits,
      },
    }));
  };

  const getGlobalAxisLimits = (axis: "x" | "y"): AxisLimits | null => {
    const limits = Object.values(axisLimits[axis]);
    if (limits.length === 0) return null;

    // Check if all limits are of the same type
    const firstLimitType = limits[0].type;
    const allSameType = limits.every((limit) => limit.type === firstLimitType);

    if (!allSameType) {
      console.warn("Mixed axis types detected in facets. Using first type.");
    }

    if (firstLimitType === "numerical") {
      // For numerical limits, find min and max across all charts
      const numericalLimits = limits.filter(
        (limit): limit is NumericalAxisLimits => limit.type === "numerical"
      );

      return {
        type: "numerical",
        min: Math.min(...numericalLimits.map((l) => l.min)),
        max: Math.max(...numericalLimits.map((l) => l.max)),
      };
    } else {
      // For categorical limits, create a union of all categories
      const categoricalLimits = limits.filter(
        (limit): limit is CategoricalAxisLimits => limit.type === "categorical"
      );

      const allCategories = new Set<string>();
      categoricalLimits.forEach((limit) => {
        limit.categories.forEach((category) => {
          allCategories.add(category);
        });
      });

      return {
        type: "categorical",
        categories: allCategories,
      };
    }
  };

  return (
    <FacetAxisContext.Provider
      value={{ registerAxisLimits, getGlobalAxisLimits }}
    >
      {children}
    </FacetAxisContext.Provider>
  );
}

export function useFacetAxis() {
  const context = useContext(FacetAxisContext);
  if (!context) {
    throw new Error("useFacetAxis must be used within a FacetAxisProvider");
  }
  return context;
}
```

### 3. FacetContainer Component

```typescript
// src/components/charts/FacetContainer.tsx
import { ReactNode, useMemo } from "react";
import { ChartSettings, FacetSettings } from "@/types/ChartTypes";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { FacetAxisProvider } from "@/providers/FacetAxisProvider";
import { FacetGridLayout } from "./FacetGridLayout";
import { FacetWrapLayout } from "./FacetWrapLayout";

interface FacetContainerProps {
  settings: ChartSettings;
  width: number;
  height: number;
  renderChart: (
    facetData: any[],
    facetValue: string,
    facetId: string
  ) => ReactNode;
}

export function FacetContainer({
  settings,
  width,
  height,
  renderChart,
}: FacetContainerProps) {
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const getLiveItems = useDataLayer((state) => state.getLiveItems);

  const liveItems = getLiveItems(settings);

  const facetData = useMemo(() => {
    if (!settings.facet?.enabled) return [];

    const liveIds = liveItems.items
      .filter((c) => c.value > 0)
      .map((d) => d.key);

    const facet = settings.facet;
    const rowVariable = facet.rowVariable;

    if (!rowVariable) return [];

    const rowData = getColumnData(rowVariable);
    const columnData =
      facet.type === "grid" ? getColumnData(facet.columnVariable) : null;

    // Group data by facet variables
    const facets: Record<string, any[]> = {};

    liveIds.forEach((id) => {
      const rowValue = String(rowData[id]);
      const columnValue = columnData ? String(columnData[id]) : null;

      const facetKey = columnValue ? `${rowValue}__${columnValue}` : rowValue;

      if (!facets[facetKey]) {
        facets[facetKey] = [];
      }

      facets[facetKey].push(id);
    });

    return Object.entries(facets).map(([key, ids]) => {
      const [rowValue, columnValue] = columnValue
        ? key.split("__")
        : [key, null];

      return {
        id: key,
        rowValue,
        columnValue,
        ids,
      };
    });
  }, [settings, liveItems, getColumnData]);

  if (!settings.facet?.enabled) {
    return null;
  }

  return (
    <FacetAxisProvider>
      {settings.facet.type === "grid" ? (
        <FacetGridLayout
          width={width}
          height={height}
          rowVariable={settings.facet.rowVariable}
          columnVariable={settings.facet.columnVariable}
          facetData={facetData}
          renderChart={renderChart}
        />
      ) : (
        <FacetWrapLayout
          width={width}
          height={height}
          rowVariable={settings.facet.rowVariable}
          columns={settings.facet.columns}
          facetData={facetData}
          renderChart={renderChart}
        />
      )}
    </FacetAxisProvider>
  );
}
```

### 4. FacetGridLayout Component

```typescript
// src/components/charts/FacetGridLayout.tsx
import { ReactNode, useMemo } from "react";

interface FacetGridLayoutProps {
  width: number;
  height: number;
  rowVariable: string;
  columnVariable: string;
  facetData: Array<{
    id: string;
    rowValue: string;
    columnValue: string;
    ids: string[];
  }>;
  renderChart: (
    facetData: string[],
    facetValue: string,
    facetId: string
  ) => ReactNode;
}

export function FacetGridLayout({
  width,
  height,
  rowVariable,
  columnVariable,
  facetData,
  renderChart,
}: FacetGridLayoutProps) {
  // Extract unique row and column values
  const { rows, columns, grid } = useMemo(() => {
    const rows = Array.from(new Set(facetData.map((d) => d.rowValue))).sort();
    const columns = Array.from(
      new Set(facetData.map((d) => d.columnValue))
    ).sort();

    // Create a grid of facets
    const grid: Record<string, Record<string, string[]>> = {};

    rows.forEach((row) => {
      grid[row] = {};
      columns.forEach((col) => {
        grid[row][col] = [];
      });
    });

    facetData.forEach((facet) => {
      if (facet.rowValue && facet.columnValue) {
        grid[facet.rowValue][facet.columnValue] = facet.ids;
      }
    });

    return { rows, columns, grid };
  }, [facetData]);

  // Calculate cell dimensions
  const cellWidth = width / (columns.length + 1); // +1 for row headers
  const cellHeight = height / (rows.length + 1); // +1 for column headers

  return (
    <div className="w-full h-full overflow-auto">
      <table className="w-full h-full border-collapse">
        <thead>
          <tr>
            {/* Top-left empty cell */}
            <th className="border p-2 bg-muted/50 font-semibold">
              {rowVariable} / {columnVariable}
            </th>

            {/* Column headers */}
            {columns.map((col) => (
              <th key={col} className="border p-2 bg-muted/50 font-semibold">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row}>
              {/* Row header */}
              <th className="border p-2 bg-muted/50 font-semibold text-left">
                {row}
              </th>

              {/* Facet cells */}
              {columns.map((col) => (
                <td key={`${row}-${col}`} className="border p-0">
                  <div style={{ width: cellWidth, height: cellHeight }}>
                    {grid[row][col].length > 0 ? (
                      renderChart(
                        grid[row][col],
                        `${row}, ${col}`,
                        `${row}__${col}`
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        No data
                      </div>
                    )}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### 5. FacetWrapLayout Component

```typescript
// src/components/charts/FacetWrapLayout.tsx
import { ReactNode, useMemo } from "react";

interface FacetWrapLayoutProps {
  width: number;
  height: number;
  rowVariable: string;
  columns: number;
  facetData: Array<{
    id: string;
    rowValue: string;
    ids: string[];
  }>;
  renderChart: (
    facetData: string[],
    facetValue: string,
    facetId: string
  ) => ReactNode;
}

export function FacetWrapLayout({
  width,
  height,
  rowVariable,
  columns,
  facetData,
  renderChart,
}: FacetWrapLayoutProps) {
  // Calculate dimensions
  const facetWidth = width / columns;
  const rows = Math.ceil(facetData.length / columns);
  const facetHeight = height / rows;

  return (
    <div
      className="w-full h-full grid"
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridAutoRows: `${facetHeight}px`,
      }}
    >
      {facetData.map((facet) => (
        <div key={facet.id} className="border p-2">
          <div className="font-medium mb-1">{facet.rowValue}</div>
          <div style={{ height: facetHeight - 30 }}>
            {renderChart(facet.ids, facet.rowValue, facet.id)}
          </div>
        </div>
      ))}
    </div>
  );
}
```

### 6. Update PlotChartPanel.tsx

```typescript
// Update PlotChartPanel.tsx to support faceting
import { FacetContainer } from "./charts/FacetContainer";

// Inside the PlotChartPanel component
const renderChart = () => {
  // Existing chart rendering logic
};

// Update the return statement
return (
  <div
    className="bg-card border rounded-lg"
    style={{ width: width, height: height }}
  >
    {/* Header and controls */}
    <div
      className="flex items-center justify-between select-none"
      style={{ height: 24 }}
    >
      {/* ... existing header code ... */}
    </div>

    {/* Chart content */}
    <div>
      {settings.facet?.enabled ? (
        <FacetContainer
          settings={settings}
          width={width - 32}
          height={height - 56}
          renderChart={(facetIds, facetValue, facetId) => {
            // Create a faceted version of the chart
            switch (settings.type) {
              case "row":
                return (
                  <RowChart
                    settings={{ ...settings, facetIds }}
                    width={
                      width /
                      (settings.facet.type === "grid"
                        ? 3
                        : settings.facet.columns)
                    }
                    height={
                      height /
                      (settings.facet.type === "grid"
                        ? 3
                        : Math.ceil(facetIds.length / settings.facet.columns))
                    }
                    facetId={facetId}
                  />
                );
              case "bar":
                return (
                  <BarChart
                    settings={{ ...settings, facetIds }}
                    width={
                      width /
                      (settings.facet.type === "grid"
                        ? 3
                        : settings.facet.columns)
                    }
                    height={
                      height /
                      (settings.facet.type === "grid"
                        ? 3
                        : Math.ceil(facetIds.length / settings.facet.columns))
                    }
                    facetId={facetId}
                  />
                );
              case "scatter":
                return (
                  <ScatterPlot
                    settings={{ ...settings, facetIds }}
                    width={
                      width /
                      (settings.facet.type === "grid"
                        ? 3
                        : settings.facet.columns)
                    }
                    height={
                      height /
                      (settings.facet.type === "grid"
                        ? 3
                        : Math.ceil(facetIds.length / settings.facet.columns))
                    }
                    facetId={facetId}
                  />
                );
              case "pivot":
                return (
                  <PivotTable
                    settings={{ ...settings, facetIds }}
                    width={
                      width /
                      (settings.facet.type === "grid"
                        ? 3
                        : settings.facet.columns)
                    }
                    height={
                      height /
                      (settings.facet.type === "grid"
                        ? 3
                        : Math.ceil(facetIds.length / settings.facet.columns))
                    }
                    facetId={facetId}
                  />
                );
            }
          }}
        />
      ) : (
        renderChart()
      )}
    </div>
  </div>
);
```

### 7. Update Chart Components

For each chart component (BarChart, RowChart, ScatterPlot, PivotTable), add facet support:

```typescript
// Example for BarChart.tsx
interface BarChartProps extends BaseChartProps {
  settings: BarChartSettings;
  facetId?: string; // Add facet ID
}

export function BarChart({ settings, width, height, facetId }: BarChartProps) {
  // Use facet context for axis synchronization
  const { registerAxisLimits, getGlobalAxisLimits } = useFacetAxis();

  // Get data for this specific facet if facetId is provided
  const allColData = useGetLiveData(
    settings,
    undefined,
    facetId ? settings.facetIds : undefined
  );

  // Rest of the chart implementation
  // ...

  // Register axis limits with the facet context
  useEffect(() => {
    if (facetId) {
      if (isBandScale) {
        // For categorical data
        registerAxisLimits(facetId, "x", {
          type: "categorical",
          categories: new Set(uniqueValues),
        });
      } else {
        // For numerical data
        registerAxisLimits(facetId, "x", {
          type: "numerical",
          min,
          max,
        });
      }

      // Also register y-axis limits (always numerical for bar charts)
      const maxValue = Math.max(...chartData.map((d) => d.value));
      registerAxisLimits(facetId, "y", {
        type: "numerical",
        min: 0,
        max: maxValue,
      });
    }
  }, [
    facetId,
    min,
    max,
    uniqueValues,
    isBandScale,
    registerAxisLimits,
    chartData,
  ]);

  // Use global limits if available
  const effectiveXScale = useMemo(() => {
    if (facetId) {
      const globalLimits = getGlobalAxisLimits("x");

      if (globalLimits) {
        if (isBandScale && globalLimits.type === "categorical") {
          // For categorical data
          return scaleBand()
            .domain(Array.from(globalLimits.categories))
            .range([0, innerWidth])
            .padding(0.3);
        } else if (!isBandScale && globalLimits.type === "numerical") {
          // For numerical data
          return scaleLinear()
            .domain([globalLimits.min, globalLimits.max])
            .range([0, innerWidth]);
        }
      }
    }
    return xScale;
  }, [facetId, getGlobalAxisLimits, xScale, innerWidth, isBandScale]);

  // Use effectiveXScale instead of xScale in rendering
  // ...
}
```

### 8. Update useGetLiveData.tsx

```typescript
// Update useGetLiveData to support faceting
export function useGetLiveData(
  settings: ChartSettings,
  field?: "xField" | "yField",
  facetIds?: string[] // Add facet IDs parameter
) {
  // Existing code

  const data = useMemo(() => {
    // If facetIds is provided, use only those IDs
    const liveIds =
      facetIds || liveItems.items.filter((c) => c.value > 0).map((d) => d.key);

    // Rest of the implementation
    // ...

    return data as datum[];
  }, [
    // Dependencies
    facetIds, // Add facetIds to dependencies
    // ...existing dependencies
  ]);

  return data;
}
```
