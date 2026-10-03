import { useMemo } from "react";
import { FieldSelector } from "@/components/FieldSelector";
import { Label } from "@/components/ui/label";
import { ActionTooltip } from "@/components/ui/tooltip";
import { utcDay } from "@/lib/dailyRollup";
import { finiteNumber } from "@/lib/numeric";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { useColorScales } from "@/hooks/useColorScales";
import type { ChartSettingsPanelProps } from "@/types/ChartTypes";
import {
  DEFAULT_TIME_SERIES,
  type LineChartSettings,
  type TimeSeriesSettings,
} from "./definition";

export function useTimeSeriesFields() {
  const getNames = useDataLayer((s) => s.getColumnNames);
  const getData = useDataLayer((s) => s.getColumnData);
  const profiles = useDataLayer((s) => s.fieldProfiles);
  const nonce = useDataLayer((s) => s.nonce);
  return useMemo(() => {
    void nonce;
    const names = getNames();
    return {
      dates: names.filter((field) =>
        Object.values(getData(field)).some((value) => utcDay(value))
      ),
      measures: names.filter(
        (field) =>
          profiles.some(
            (profile) =>
              profile.name === field && profile.dataType === "numeric"
          ) ||
          Object.values(getData(field)).some(
            (value) =>
              typeof value !== "boolean" && finiteNumber(value) !== undefined
          )
      ),
    };
  }, [getNames, getData, profiles, nonce]);
}

export function LineDataMode({
  settings,
  onSettingsChange,
}: ChartSettingsPanelProps<LineChartSettings>) {
  const fields = useTimeSeriesFields();
  return (
    <label className="grid grid-cols-[120px_minmax(0,1fr)] items-center gap-4 text-sm">
      Data mode
      <select
        className="h-9 min-w-0 rounded-md border border-input bg-background px-2"
        value={settings.time ? "calendar" : "observations"}
        onChange={(event) => {
          const calendar = event.target.value === "calendar";
          onSettingsChange({
            ...settings,
            time: calendar ? { ...DEFAULT_TIME_SERIES } : undefined,
            xField: calendar
              ? fields.dates.includes(settings.xField)
                ? settings.xField
                : (fields.dates[0] ?? "")
              : settings.xField,
            styles: { curveType: "linear" },
            filters: settings.filters.filter(
              (filter) =>
                filter.field !== settings.xField &&
                filter.field !== settings.time?.splitField
            ),
          });
        }}
      >
        <option value="observations">Raw observations</option>
        <option value="calendar">Calendar summaries</option>
      </select>
    </label>
  );
}

export function TimeSeriesSettingsPanel({
  settings,
  onSettingsChange,
}: ChartSettingsPanelProps<LineChartSettings>) {
  const fields = useTimeSeriesFields();
  const { getOrCreateScaleForField: getOrCreateScale } = useColorScales();
  const time = settings.time!;
  const change = (next: Partial<TimeSeriesSettings>) =>
    onSettingsChange({ ...settings, time: { ...time, ...next } });
  const inputClass =
    "h-9 min-w-0 rounded-md border border-input bg-background px-2 text-sm";
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[120px_minmax(0,1fr)] items-center gap-4">
        <Label>Date</Label>
        <FieldSelector
          label=""
          placeholder="Date field"
          value={settings.xField}
          fields={fields.dates}
          onChange={(xField) =>
            onSettingsChange({
              ...settings,
              xField,
              filters: settings.filters.filter(
                (filter) => filter.field !== settings.xField
              ),
            })
          }
        />
        <Label htmlFor={`${settings.id}-interval`}>Interval</Label>
        <select
          id={`${settings.id}-interval`}
          className={inputClass}
          value={time.interval}
          onChange={(e) =>
            change({
              interval: e.target.value as TimeSeriesSettings["interval"],
            })
          }
        >
          <option value="day">Day</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
        </select>
        {time.interval === "week" && (
          <>
            <Label htmlFor={`${settings.id}-week`}>Weeks start</Label>
            <select
              id={`${settings.id}-week`}
              className={inputClass}
              value={time.weekStart}
              onChange={(e) =>
                change({
                  weekStart: e.target.value as TimeSeriesSettings["weekStart"],
                })
              }
            >
              <option value="monday">Monday</option>
              <option value="sunday">Sunday</option>
            </select>
          </>
        )}
        <Label htmlFor={`${settings.id}-metric`}>Metric</Label>
        <select
          id={`${settings.id}-metric`}
          className={inputClass}
          value={time.aggregation}
          onChange={(e) =>
            change({
              aggregation: e.target.value as TimeSeriesSettings["aggregation"],
              measureField: time.measureField ?? fields.measures[0],
              ...(e.target.value === "average"
                ? { missingPeriods: "gap" }
                : {}),
            })
          }
        >
          <option value="count">Count rows</option>
          <option value="sum" disabled={!fields.measures.length}>
            Sum
          </option>
          <option value="average" disabled={!fields.measures.length}>
            Average
          </option>
        </select>
        {time.aggregation !== "count" && (
          <>
            <Label>Measure</Label>
            <FieldSelector
              label=""
              placeholder="Measure"
              value={time.measureField ?? ""}
              fields={fields.measures}
              onChange={(measureField) => change({ measureField })}
            />
          </>
        )}
        <Label>Split by</Label>
        <FieldSelector
          label=""
          placeholder="Series field"
          value={time.splitField ?? ""}
          allowClear
          onChange={(splitField) =>
            onSettingsChange({
              ...settings,
              time: { ...time, splitField: splitField || undefined },
              colorField: splitField || undefined,
              colorScaleId: splitField
                ? getOrCreateScale(splitField)
                : undefined,
              filters: settings.filters.filter(
                (filter) => filter.field !== time.splitField
              ),
            })
          }
        />
        <Label htmlFor={`${settings.id}-missing`}>Missing periods</Label>
        <ActionTooltip content="A gap leaves absent periods unconnected. Zero draws an empty count or sum at zero. Averages require observations.">
          <select
            id={`${settings.id}-missing`}
            className={inputClass}
            value={time.aggregation === "average" ? "gap" : time.missingPeriods}
            disabled={time.aggregation === "average"}
            onChange={(e) =>
              change({
                missingPeriods: e.target
                  .value as TimeSeriesSettings["missingPeriods"],
              })
            }
          >
            <option value="gap">Gap</option>
            <option value="zero">Zero</option>
          </select>
        </ActionTooltip>
        <Label htmlFor={`${settings.id}-time-style`}>Line style</Label>
        <select
          id={`${settings.id}-time-style`}
          className={inputClass}
          value={settings.styles.curveType}
          onChange={(e) =>
            onSettingsChange({
              ...settings,
              styles: { curveType: e.target.value as "linear" | "step" },
            })
          }
        >
          <option value="linear">Linear</option>
          <option value="step">Step</option>
        </select>
      </div>
      <p className="text-xs text-muted-foreground">
        Periods use UTC. Click a point to select its period and series. Drag
        across dates to select complete periods.
      </p>
    </div>
  );
}
