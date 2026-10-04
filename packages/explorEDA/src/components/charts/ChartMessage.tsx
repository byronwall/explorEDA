import type { ReactNode } from "react";

/** Shown when every row is filtered out by other charts. */
export const NO_MATCHING_ROWS = "No rows match the current filters.";

/**
 * A chart's empty or setup state: one centered, muted sentence in the space the
 * chart would fill, so every chart type reads the same when it has nothing to draw.
 */
export function ChartMessage({
  width,
  height,
  children,
}: {
  width?: number;
  height?: number;
  children: ReactNode;
}) {
  return (
    <div
      className="flex h-full items-center justify-center p-4 text-center text-sm text-muted-foreground"
      style={width === undefined ? undefined : { width, height }}
      role="status"
    >
      {children}
    </div>
  );
}
