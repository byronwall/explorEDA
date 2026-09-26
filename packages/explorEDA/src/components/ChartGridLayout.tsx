import React, { ReactNode, useEffect, useRef, useState } from "react";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import type { Layout } from "react-grid-layout";
import { Plus } from "lucide-react";
import type { ChartLayout, ChartSettings } from "@/types/ChartTypes";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { useCreateCharts } from "@/hooks/useCreateCharts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GridBackground } from "./GridBackground";
import { ChartTypeMenuItems } from "./plot/ChartCreationButtons";
import {
  findEmptyPlacement,
  GridCell,
  resizeLimits,
} from "./chartGridPlacement";

export type ResizeAxis = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

const RESIZE_AXES: ResizeAxis[] = ["n", "s", "e", "w", "ne", "nw", "se", "sw"];
const ADD_CONTROL_DELAY_MS = 500;

interface ChartGridLayoutProps {
  children: ReactNode;
  charts: ChartSettings[];
  containerWidth: number;
}

interface AddTarget {
  cell: GridCell;
  placement: ChartLayout;
}

export function ChartGridLayout({
  children,
  charts,
  containerWidth,
}: ChartGridLayoutProps) {
  const gridSettings = useDataLayer((s) => s.gridSettings);
  const updateChartLayouts = useDataLayer((s) => s.updateChartLayouts);
  const { createChart } = useCreateCharts();
  const isNarrow = containerWidth > 0 && containerWidth < 960;

  const containerRef = useRef<HTMLDivElement>(null);
  const pendingCell = useRef<string | null>(null);
  const hoverTimer = useRef<number | undefined>(undefined);
  const isInteracting = useRef(false);
  const [addTarget, setAddTarget] = useState<AddTarget | null>(null);
  const [menuOpen, setMenuOpenState] = useState(false);
  // Opening the menu makes the page inert, which fires pointer leave events
  // before the open state re-renders, so handlers read this ref instead.
  const menuOpenRef = useRef(false);
  const setMenuOpen = (open: boolean) => {
    menuOpenRef.current = open;
    setMenuOpenState(open);
  };
  const [previewVisible, setPreviewVisible] = useState(false);
  const createdChart = useRef(false);
  // Growing a chart into its neighbor stops at the neighbor instead of
  // pushing it down and leaving a hole. Only a bottom-edge resize may push
  // the charts below it further down.
  const [activeResize, setActiveResize] = useState<{
    id: string;
    axis: string;
    maxW?: number;
    maxH?: number;
  } | null>(null);

  const layout: Layout[] = charts.map((chart, index) => ({
    ...chart.layout,
    ...(isNarrow ? { x: 0, y: index, w: 1 } : {}),
    ...(activeResize?.id === chart.id
      ? { maxW: activeResize.maxW, maxH: activeResize.maxH }
      : {}),
    i: chart.id,
  }));

  const contentRows = Math.max(0, ...layout.map((item) => item.y + item.h));
  // One spare row below the charts gives room to add a chart underneath.
  const gridRows = isNarrow ? contentRows : contentRows + 1;
  const totalHeight = Math.max(
    gridRows * gridSettings.rowHeight + gridSettings.containerPadding * 2,
    400
  );
  const columnWidth =
    (containerWidth - gridSettings.containerPadding * 2) /
    gridSettings.columnCount;

  const clearHover = () => {
    // Removing a focused add button would drop focus to the page body.
    if (document.activeElement?.closest("[data-grid-add-control]")) {
      containerRef.current?.focus({ preventScroll: true });
    }
    window.clearTimeout(hoverTimer.current);
    pendingCell.current = null;
    setAddTarget(null);
    setPreviewVisible(false);
  };

  useEffect(() => () => window.clearTimeout(hoverTimer.current), []);

  useEffect(() => {
    if (isNarrow) {
      window.clearTimeout(hoverTimer.current);
      pendingCell.current = null;
      setAddTarget(null);
      setMenuOpen(false);
    }
  }, [isNarrow]);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (menuOpenRef.current) return;
    const target = event.target as Element;
    if (target.closest("[data-grid-add-control]")) return;
    if (
      isNarrow ||
      event.pointerType !== "mouse" ||
      event.buttons !== 0 ||
      isInteracting.current ||
      target.closest(".react-grid-item") ||
      !containerRef.current
    ) {
      clearHover();
      return;
    }

    const bounds = containerRef.current.getBoundingClientRect();
    const cell = {
      x: Math.floor(
        (event.clientX - bounds.left - gridSettings.containerPadding) /
          columnWidth
      ),
      y: Math.floor(
        (event.clientY - bounds.top - gridSettings.containerPadding) /
          gridSettings.rowHeight
      ),
    };
    const key = `${cell.x}:${cell.y}`;
    if (key === pendingCell.current) return;

    clearHover();
    if (cell.y >= gridRows) return;
    const occupied = charts.map((chart) => chart.layout);
    const placement = findEmptyPlacement(
      cell,
      occupied,
      gridSettings.columnCount
    );
    if (!placement) return;
    pendingCell.current = key;
    hoverTimer.current = window.setTimeout(
      () => setAddTarget({ cell, placement }),
      ADD_CONTROL_DELAY_MS
    );
  };

  const handleCreate = (type: ChartSettings["type"]) => {
    if (!addTarget) return;
    // Recheck against the current charts in case the space filled meanwhile.
    const placement = findEmptyPlacement(
      addTarget.cell,
      charts.map((chart) => chart.layout),
      gridSettings.columnCount
    );
    createChart(type, "", placement ?? undefined);
    // The new chart takes focus, so the menu must not return it to the plus.
    createdChart.current = true;
    clearHover();
  };

  const handleLayoutChange = (newLayout: Layout[]) => {
    updateChartLayouts(
      Object.fromEntries(
        newLayout.map(({ i, x, y, w, h }) => [i, { x, y, w, h }])
      )
    );
  };

  const startInteraction = () => {
    isInteracting.current = true;
    clearHover();
  };
  const stopInteraction = () => {
    isInteracting.current = false;
    setActiveResize(null);
  };
  const startResize: GridLayout.ItemCallback = (
    currentLayout,
    item,
    _newItem,
    _placeholder,
    event
  ) => {
    const axis =
      (event.target as Element | null)
        ?.closest("[data-resize-axis]")
        ?.getAttribute("data-resize-axis") ?? "se";
    setActiveResize({
      id: item.i,
      axis,
      ...resizeLimits(
        item,
        axis,
        currentLayout.filter((other) => other.i !== item.i),
        gridSettings.columnCount
      ),
    });
    startInteraction();
  };

  const toPixels = (cell: { x: number; y: number }) => ({
    left: gridSettings.containerPadding + cell.x * columnWidth,
    top: gridSettings.containerPadding + cell.y * gridSettings.rowHeight,
  });

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      className="relative w-full outline-none"
      style={{ minHeight: totalHeight }}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => {
        if (!menuOpenRef.current) clearHover();
      }}
    >
      <GridBackground
        settings={gridSettings}
        width={containerWidth}
        height={totalHeight}
      />
      {addTarget && previewVisible && (
        <div
          className="eda-grid-add-preview"
          aria-hidden="true"
          style={{
            ...toPixels(addTarget.placement),
            width: addTarget.placement.w * columnWidth,
            height: addTarget.placement.h * gridSettings.rowHeight,
          }}
        />
      )}
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
        // Free placement keeps charts where the user puts them, so a chart
        // added in empty space stays there and a top or left resize keeps
        // the opposite edge fixed. The narrow layout stays a simple stack.
        compactType={isNarrow ? "vertical" : null}
        // A backstop for corner resizes that meet a chart diagonally.
        preventCollision={
          activeResize !== null && !activeResize.axis.includes("s")
        }
        onLayoutChange={isNarrow ? undefined : handleLayoutChange}
        onDragStart={startInteraction}
        onDragStop={stopInteraction}
        onResizeStart={startResize}
        onResizeStop={stopInteraction}
        draggableHandle=".drag-handle"
        isDraggable={!isNarrow}
        isResizable={!isNarrow}
        style={{ position: "relative" }}
        resizeHandles={isNarrow ? [] : RESIZE_AXES}
        // react-resizable calls this with (axis, ref); the published types
        // omit the ref argument.
        resizeHandle={
          ((axis: ResizeAxis, ref: React.Ref<HTMLDivElement>) => (
            <ResizeHandle axis={axis} ref={ref} />
          )) as unknown as React.ReactElement
        }
      >
        {children}
      </GridLayout>
      {addTarget && (
        <DropdownMenu
          open={menuOpen}
          onOpenChange={(open) => {
            setMenuOpen(open);
            setPreviewVisible(open);
          }}
        >
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              data-grid-add-control
              aria-label="Add chart here"
              className="eda-grid-add"
              style={{
                left: toPixels(addTarget.cell).left + columnWidth / 2,
                top: toPixels(addTarget.cell).top + gridSettings.rowHeight / 2,
              }}
              onPointerEnter={() => setPreviewVisible(true)}
              onPointerLeave={() => {
                if (!menuOpenRef.current) setPreviewVisible(false);
              }}
              onFocus={() => setPreviewVisible(true)}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            sideOffset={6}
            onCloseAutoFocus={(event) => {
              if (createdChart.current) event.preventDefault();
              createdChart.current = false;
            }}
          >
            <ChartTypeMenuItems onSelect={handleCreate} />
          </DropdownMenuContent>
        </DropdownMenu>
      )}
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

export const ResizeHandle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { axis: ResizeAxis }
>(({ axis, className, ...props }, ref) => (
  <div
    ref={ref}
    aria-hidden="true"
    data-resize-axis={axis}
    className={`react-resizable-handle eda-resize-handle eda-resize-${axis}${
      axis === "se" ? " handle-se" : ""
    }${className ? ` ${className}` : ""}`}
    {...props}
  >
    {axis === "se" && <SouthEastArrow />}
  </div>
));
ResizeHandle.displayName = "ResizeHandle";
