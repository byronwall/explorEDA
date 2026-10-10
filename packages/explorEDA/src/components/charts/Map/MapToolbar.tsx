import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChartTraceApi } from "../trace/ChartTraceScope";
import type { MapSettings, MapView } from "./definition";
import type { PointMapPlan } from "./pointMapPlan";
import { fitMapCoordinates, projectionLabel, WORLD_VIEW } from "./mapGeometry";

export function MapToolbar({
  settings,
  plan,
  owner,
  getFieldLabel,
  onViewChange,
}: {
  settings: MapSettings;
  plan: PointMapPlan;
  owner: string;
  getFieldLabel: (field: string) => string;
  onViewChange: (view: MapView) => void;
}) {
  const api = useChartTraceApi();
  const saveView = onViewChange;
  const width = plan.width;
  return (
    <div className="flex min-h-0 flex-1 flex-col justify-center gap-1 px-2 py-1 text-xs">
      <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap">
        <Button
          size="icon"
          variant="ghost"
          className="size-6 shrink-0"
          aria-label="Zoom in"
          tooltip="Zoom in around the map center."
          disabled={plan.view.zoom >= 64}
          onClick={() =>
            saveView({
              ...plan.view,
              zoom: Math.min(64, plan.view.zoom * 1.5),
            })
          }
        >
          <Plus className="size-3.5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="size-6 shrink-0"
          aria-label="Zoom out"
          tooltip="Zoom out around the map center."
          disabled={plan.view.zoom <= 1}
          onClick={() =>
            saveView({
              ...plan.view,
              zoom: Math.max(1, plan.view.zoom / 1.5),
            })
          }
        >
          <Minus className="size-3.5" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 shrink-0 px-1.5 text-xs"
          tooltip="Fit all source coordinates. Other filters and facets do not change this view."
          disabled={!plan.coordinates.length}
          onClick={() =>
            saveView(
              fitMapCoordinates(
                plan.coordinates,
                settings.projection,
                width,
                plan.mapHeight
              )
            )
          }
        >
          Fit data
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 shrink-0 px-1.5 text-xs"
          tooltip="Return to the centered world view. Keep row selection."
          onClick={() => saveView(WORLD_VIEW)}
        >
          Reset view
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-muted-foreground">
        <span>
          {plan.points.length} drawn · {projectionLabel(settings.projection)}
        </span>
        {plan.excluded.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-5 px-0 text-xs"
            onClick={() => api?.inspect(owner, "map-exclusions", "excluded")}
          >
            {plan.excluded.length} omitted{" "}
            {plan.excluded.length === 1 ? "row" : "rows"}
          </Button>
        )}
        {plan.offscreen.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-5 px-0 text-xs"
            onClick={() => api?.inspect(owner, "map-offscreen", "offscreen")}
          >
            {plan.offscreen.length} outside view
          </Button>
        )}
      </div>
      {settings.sizeField && (
        <div
          className="flex flex-wrap items-center gap-x-2 gap-y-0.5"
          aria-label={`Point area: ${getFieldLabel(settings.sizeField)}, maximum ${plan.maxSize}`}
        >
          <span>Area: {getFieldLabel(settings.sizeField)}</span>
          {(plan.maxSize > 0 ? [0.25, 1] : [0]).map((fraction) => (
            <span key={fraction} className="inline-flex items-center gap-1">
              <svg
                width={settings.pointRadius * 2 + 6}
                height={settings.pointRadius * 2 + 4}
                aria-hidden="true"
              >
                <circle
                  cx={settings.pointRadius + 3}
                  cy={settings.pointRadius + 2}
                  r={fraction ? settings.pointRadius * Math.sqrt(fraction) : 2}
                  fill={fraction ? "var(--muted-foreground)" : "none"}
                  fillOpacity={0.4}
                  stroke="var(--muted-foreground)"
                />
              </svg>
              {Number((plan.maxSize * fraction).toPrecision(4))}
            </span>
          ))}
          <span className="text-muted-foreground">Zero is hollow</span>
        </div>
      )}
    </div>
  );
}
