import { ReactNode } from "react";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import type { Layout } from "react-grid-layout";
import type { ChartSettings } from "@/types/ChartTypes";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { GridBackground } from "./GridBackground";

import React from "react";

type BottomRightHandleProps = React.HTMLAttributes<HTMLDivElement> & {
  handleAxis?: string;
};

interface ChartGridLayoutProps {
  children: ReactNode;
  charts: ChartSettings[];
  containerWidth: number;
}

export function ChartGridLayout({
  children,
  charts,
  containerWidth,
}: ChartGridLayoutProps) {
  const gridSettings = useDataLayer((s) => s.gridSettings);
  const updateChartLayouts = useDataLayer((s) => s.updateChartLayouts);
  const isNarrow = containerWidth > 0 && containerWidth < 960;

  const layout: Layout[] = charts.map((chart, index) => ({
    ...chart.layout,
    ...(isNarrow ? { x: 0, y: index, w: 1 } : {}),
    i: chart.id,
  }));

  // Calculate the total height based on the rendered layout.
  const totalHeight = Math.max(
    ...layout.map((chart) => (chart.y + chart.h) * gridSettings.rowHeight),
    400 // minimum height
  );

  const handleLayoutChange = (newLayout: Layout[]) => {
    updateChartLayouts(
      Object.fromEntries(
        newLayout.map(({ i, x, y, w, h }) => [i, { x, y, w, h }])
      )
    );
  };

  return (
    <div className="relative w-full">
      <GridBackground
        settings={gridSettings}
        width={containerWidth}
        height={totalHeight}
      />
      <GridLayout
        className="layout"
        layout={layout}
        cols={isNarrow ? 1 : gridSettings.columnCount}
        rowHeight={gridSettings.rowHeight}
        width={Math.max(containerWidth, 1)}
        margin={[0, 0]}
        containerPadding={[
          gridSettings.containerPadding,
          gridSettings.containerPadding,
        ]}
        onLayoutChange={isNarrow ? undefined : handleLayoutChange}
        draggableHandle=".drag-handle"
        isDraggable={!isNarrow}
        isResizable={!isNarrow}
        style={{ position: "relative" }}
        resizeHandle={<BottomRightHandle />}
      >
        {children}
      </GridLayout>
    </div>
  );
}

const SouthEastArrow = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
    <path
      d="M5 12L12 5M9 12l3-3"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
);

export const BottomRightHandle = React.forwardRef<
  HTMLDivElement,
  BottomRightHandleProps
>((props, ref) => {
  const domProps = { ...props };
  delete domProps.handleAxis;

  return (
    <div
      style={{
        width: "20px",
        height: "20px",
        position: "absolute",
        bottom: 0,
        right: 0,
        padding: 0,
        cursor: "se-resize",
      }}
      className="handle-se"
      ref={ref}
      aria-hidden="true"
      {...domProps}
    >
      {" "}
      <SouthEastArrow />{" "}
    </div>
  );
});
