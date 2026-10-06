import { FieldSelector } from "@/components/FieldSelector";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ActionTooltip } from "@/components/ui/tooltip";
import type { AggregateAggregation } from "@/lib/aggregates";
import { utcDay } from "@/lib/dailyRollup";
import { finiteNumber } from "@/lib/numeric";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { ChartSettingsPanelProps } from "@/types/ChartTypes";
import { useMemo } from "react";
import type { CalendarSettings } from "./definition";

export function CalendarSettingsPanel({
  settings,
  onSettingsChange,
}: ChartSettingsPanelProps<CalendarSettings>) {
  const getColumnNames = useDataLayer((state) => state.getColumnNames);
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const calculations = useDataLayer((state) => state.calculations);
  const { dateFields, measureFields } = useMemo(() => {
    void calculations;
    const names = getColumnNames();
    const values = (field: string) => Object.values(getColumnData(field));
    return {
      dateFields: names.filter((field) =>
        values(field).some((value) => utcDay(value) !== undefined)
      ),
      measureFields: names.filter((field) =>
        values(field).some(
          (value) =>
            typeof value !== "boolean" && finiteNumber(value) !== undefined
        )
      ),
    };
  }, [calculations, getColumnData, getColumnNames]);
  const change = (next: Partial<CalendarSettings>) => {
    const merged = { ...settings, ...next };
    onSettingsChange({
      ...merged,
      // A day selection belongs to the date field it was made on.
      filters: merged.filters.filter(
        (filter) =>
          filter.type !== "date-range" || filter.field === merged.field
      ),
      ...(next.field && next.field !== settings.field
        ? { year: undefined }
        : {}),
    });
  };

  return (
    <div className="space-y-2.5">
      <div className="eda-setting-grid">
        <Label>Date</Label>
        <FieldSelector
          label=""
          placeholder="Date field"
          value={settings.field}
          fields={
            dateFields.includes(settings.field) || !settings.field
              ? dateFields
              : [settings.field, ...dateFields]
          }
          onChange={(value) => change({ field: value })}
        />

        <Label htmlFor="calendar-metric">Metric</Label>
        <select
          id="calendar-metric"
          className="h-9 rounded-md border-input bg-background px-2 text-sm"
          value={settings.aggregation}
          onChange={(event) => {
            const aggregation = event.target.value as AggregateAggregation;
            change({
              aggregation,
              ...(aggregation !== "count" && !settings.measureField
                ? { measureField: measureFields[0] }
                : {}),
            });
          }}
        >
          <option value="count">Count rows</option>
          <option value="sum" disabled={!measureFields.length}>
            Sum
          </option>
          <option value="average" disabled={!measureFields.length}>
            Average
          </option>
        </select>

        {settings.aggregation !== "count" && (
          <>
            <Label>Measure</Label>
            <FieldSelector
              label=""
              placeholder="Measure"
              value={settings.measureField ?? ""}
              fields={measureFields}
              onChange={(value) => change({ measureField: value })}
            />
          </>
        )}

        <Label>Weeks start</Label>
        <ToggleGroup
          type="single"
          size="sm"
          variant="outline"
          value={settings.weekStart}
          onValueChange={(next) =>
            next && change({ weekStart: next as CalendarSettings["weekStart"] })
          }
          aria-label="Weeks start"
          className="justify-start"
        >
          {(
            [
              [
                "monday",
                "Monday",
                "Start each week column on Monday, as ISO weeks do.",
              ],
              [
                "sunday",
                "Sunday",
                "Start each week column on Sunday, as US calendars do.",
              ],
            ] as const
          ).map(([value, text, help]) => (
            <ActionTooltip key={value} content={help}>
              <span className="inline-flex">
                <ToggleGroupItem value={value} className="px-2">
                  {text}
                </ToggleGroupItem>
              </span>
            </ActionTooltip>
          ))}
        </ToggleGroup>
        <p className="col-start-2 text-xs text-muted-foreground">
          Days follow UTC. Use the arrows above the calendar to change the year.
        </p>
      </div>
    </div>
  );
}
