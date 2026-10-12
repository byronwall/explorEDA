import { Layers } from "lucide-react";
import { useId } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ActionTooltip } from "@/components/ui/tooltip";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { boundaryAssetId, useBoundarySets } from "@/lib/boundaries/registry";
import type { MapSettings } from "./definition";
import { useStreetMapEngine } from "./mapEngine";

const selectClass =
  "h-7 min-w-0 rounded-md border border-input bg-background px-2 text-xs";
const toggleClass =
  "h-7 w-full min-w-0 px-1 text-xs aria-checked:bg-primary/10 aria-checked:font-semibold aria-checked:text-primary";

/**
 * Points or regions above, then reference outlines, then the basemap.
 * Switches sit in spans so the tooltip's own state never replaces theirs.
 */
export function MapLayersControl({
  settings,
  onChange,
}: {
  settings: MapSettings;
  onChange: (updates: Partial<MapSettings>) => void;
}) {
  const id = useId();
  const engine = useStreetMapEngine();
  const sets = useBoundarySets();
  const assets = useDataLayer((state) => state.geometryAssets);
  const point = settings.mode === "point";
  const basemap = settings.basemap ?? "auto";
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="size-6 shrink-0"
          aria-label="Map layers"
          tooltip="Choose what the map shows: marks, labels, reference outlines, and the basemap."
        >
          <Layers className="size-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        collisionPadding={12}
        className="w-72 p-3"
        aria-label="Map layers"
      >
        <div className="eda-setting-grid text-xs">
          {point && (
            <>
              <Label htmlFor={`${id}-marks`}>Points</Label>
              <ActionTooltip content="Hide the points to read the map beneath them. Selections and filters stay as they are.">
                <span className="inline-flex justify-self-start">
                  <Switch
                    id={`${id}-marks`}
                    checked={settings.showMarks ?? true}
                    onCheckedChange={(showMarks) => onChange({ showMarks })}
                  />
                </span>
              </ActionTooltip>
            </>
          )}
          {point && (
            <>
              <Label htmlFor={`${id}-group`}>Group</Label>
              <ActionTooltip content="Above 2,000 drawn points, nearby points group into counted circles that split apart as you zoom in. Clicking a group selects all its rows.">
                <span className="inline-flex justify-self-start">
                  <Switch
                    id={`${id}-group`}
                    checked={settings.clusterPoints ?? true}
                    onCheckedChange={(clusterPoints) =>
                      onChange({ clusterPoints })
                    }
                  />
                </span>
              </ActionTooltip>
            </>
          )}
          <Label htmlFor={`${id}-labels`}>Labels</Label>
          <ActionTooltip
            content={
              point
                ? settings.labelField
                  ? "Write each point's label beside it. Labels show when 150 or fewer points are drawn."
                  : "Choose a point label field in chart settings to label points."
                : "Show each visible region's key at its center."
            }
          >
            <span className="inline-flex justify-self-start">
              <Switch
                id={`${id}-labels`}
                disabled={point && !settings.labelField}
                checked={
                  point
                    ? (settings.showLabels ?? false)
                    : (settings.showRegionLabels ?? false)
                }
                onCheckedChange={(checked) =>
                  onChange(
                    point
                      ? { showLabels: checked }
                      : { showRegionLabels: checked }
                  )
                }
              />
            </span>
          </ActionTooltip>
          {point && (
            <>
              <Label htmlFor={`${id}-outlines`}>Outlines</Label>
              <ActionTooltip content="Draw boundaries beneath the points for reference, such as districts or states. They are not selectable and do not join to rows.">
                <select
                  id={`${id}-outlines`}
                  className={selectClass}
                  value={settings.referenceAssetId ?? ""}
                  onChange={(event) =>
                    onChange({
                      referenceAssetId: event.target.value || undefined,
                    })
                  }
                >
                  <option value="">None</option>
                  <optgroup label="Supplied">
                    {sets.map((set) => (
                      <option key={set.id} value={boundaryAssetId(set.id)}>
                        {set.name}
                      </option>
                    ))}
                  </optgroup>
                  {assets.length > 0 && (
                    <optgroup label="Imported">
                      {assets.map((asset) => (
                        <option key={asset.id} value={asset.id}>
                          {asset.name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </ActionTooltip>
            </>
          )}
          <Label>Basemap</Label>
          <ToggleGroup
            type="single"
            value={basemap}
            onValueChange={(value) => {
              if (value) onChange({ basemap: value as MapSettings["basemap"] });
            }}
            aria-label="Basemap"
            variant="outline"
            size="sm"
            className={`grid w-full ${point ? "grid-cols-3" : "grid-cols-2"}`}
          >
            <ActionTooltip
              content={
                point && engine
                  ? "Land outlines at world scale, and streets once zoomed in past continent scale."
                  : "Land outlines and a latitude and longitude grid."
              }
            >
              <ToggleGroupItem
                value="auto"
                aria-label="Automatic basemap"
                className={toggleClass}
              >
                {point && engine ? "Auto" : "Land"}
              </ToggleGroupItem>
            </ActionTooltip>
            {point && (
              <ActionTooltip content="Always land outlines, even when zoomed in. Use this to keep the map quiet or to avoid loading street tiles.">
                <ToggleGroupItem
                  value="outline"
                  aria-label="Outline basemap"
                  className={toggleClass}
                >
                  Outline
                </ToggleGroupItem>
              </ActionTooltip>
            )}
            <ActionTooltip content="No basemap: only the data and any reference outlines.">
              <ToggleGroupItem
                value="none"
                aria-label="No basemap"
                className={toggleClass}
              >
                None
              </ToggleGroupItem>
            </ActionTooltip>
          </ToggleGroup>
        </div>
      </PopoverContent>
    </Popover>
  );
}
