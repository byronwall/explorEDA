import type { ChartSettingsPanelProps } from "@/types/ChartTypes";
import { FieldSelector } from "@/components/FieldSelector";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ActionTooltip } from "@/components/ui/tooltip";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { ScatterConnectSettings, ScatterPlotSettings } from "./definition";

/** Joins points in order. Its details show only once it is on. */
export function ConnectSettings({
  settings,
  onSettingsChange,
}: ChartSettingsPanelProps<ScatterPlotSettings>) {
  const connect = settings.connect;
  const update = (next: Partial<ScatterConnectSettings>) =>
    onSettingsChange({ ...settings, connect: { ...connect, ...next } });
  return (
    <>
      <Label htmlFor="scatter-connect">Connect points</Label>
      <ActionTooltip content="Joins points with straight lines in the order of a field, one path per group. A row that a filter removes, or that has no position, breaks the path instead of being skipped. Alt-click a path to list its rows in order.">
        <span className="inline-flex w-fit">
          <Switch
            id="scatter-connect"
            checked={Boolean(connect)}
            onCheckedChange={(checked) =>
              onSettingsChange({
                ...settings,
                connect: checked ? {} : undefined,
              })
            }
          />
        </span>
      </ActionTooltip>
      {connect && (
        <>
          <Label>Order by</Label>
          <FieldSelector
            label=""
            placeholder="Row order"
            value={connect.orderField ?? ""}
            allowClear
            onChange={(value) => update({ orderField: value || undefined })}
          />
          <Label>One path per</Label>
          <FieldSelector
            label=""
            placeholder="One path"
            value={connect.groupField ?? ""}
            allowClear
            onChange={(value) =>
              update({
                groupField: value || undefined,
                labels: value ? connect.labels : undefined,
              })
            }
          />
          {connect.groupField && (
            <>
              <Label>Path labels</Label>
              <ToggleGroup
                type="single"
                value={connect.labels ?? "none"}
                onValueChange={(value) => {
                  if (value)
                    update({
                      labels:
                        value === "none"
                          ? undefined
                          : (value as "end" | "both"),
                    });
                }}
                aria-label="Path labels"
                variant="outline"
                size="sm"
                className="grid w-full grid-cols-3"
              >
                {(
                  [
                    ["none", "None", "Draw no path names."],
                    ["end", "End", "Name each path at its last point."],
                    [
                      "both",
                      "Both ends",
                      "Name each path at its first and last points, as in a slope chart.",
                    ],
                  ] as const
                ).map(([value, label, help]) => (
                  <ActionTooltip key={value} content={help}>
                    <ToggleGroupItem
                      value={value}
                      aria-label={label}
                      className="w-full min-w-0 px-1 text-xs aria-checked:bg-primary/10 aria-checked:font-semibold aria-checked:text-primary"
                    >
                      {label}
                    </ToggleGroupItem>
                  </ActionTooltip>
                ))}
              </ToggleGroup>
            </>
          )}
        </>
      )}
    </>
  );
}
