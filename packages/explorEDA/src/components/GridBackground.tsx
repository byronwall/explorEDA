import { GridSettings } from "@/types/SavedDataTypes";
import { cn } from "@/lib/utils";

interface GridBackgroundProps {
  settings: GridSettings;
  width: number;
  height: number;
  className?: string;
}

export function GridBackground({
  settings,
  width,
  height,
  className,
}: GridBackgroundProps) {
  if (!settings.showBackgroundMarkers) {
    return null;
  }

  const columnWidth =
    (width - settings.containerPadding * 2) / settings.columnCount;

  return (
    <div
      className={cn("absolute inset-0 pointer-events-none", className)}
      aria-hidden="true"
      style={{
        width,
        height,
      }}
    >
      <div
        className="absolute inset-0 border border-dashed border-gray-200"
        style={{
          margin: settings.containerPadding,
        }}
      >
        {/* Vertical grid lines */}
        {Array.from({ length: settings.columnCount - 1 }).map((_, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 border-l border-dashed border-gray-200"
            style={{
              left: (i + 1) * columnWidth,
            }}
          />
        ))}

        {/* Horizontal grid lines */}
        {Array.from({
          length: Math.floor(height / settings.rowHeight) - 1,
        }).map((_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 border-t border-dashed border-gray-200"
            style={{
              top: (i + 1) * settings.rowHeight,
            }}
          />
        ))}
      </div>
    </div>
  );
}
