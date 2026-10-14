import { FieldSelector } from "@/components/FieldSelector";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ActionTooltip } from "@/components/ui/tooltip";
import { categoryKey, categoryValue } from "@/lib/categories";
import type { ChartSettingsPanelProps } from "@/types/ChartTypes";
import { useEventValues } from "../useEventValues";
import {
  DEFAULT_RETENTION_PERIODS,
  MAX_RETENTION_PERIODS,
  type RetentionSettings,
} from "./definition";
import type { RetentionPeriod } from "./retentionPlan";

const SELECT =
  "h-7 w-full min-w-0 rounded-md border border-input bg-background px-2 text-sm";

const PERIODS: [RetentionPeriod, string, string][] = [
  ["day", "Day", "Cohorts by the UTC day each entity entered."],
  ["week", "Week", "Cohorts by the UTC week, Monday to Sunday."],
  ["month", "Month", "Cohorts by the calendar month."],
];

export function RetentionSettingsPanel({
  settings,
  onSettingsChange,
}: ChartSettingsPanelProps<RetentionSettings>) {
  const events = useEventValues(settings.field);
  const byKey = new Map(events.map((item) => [item.key, item]));
  // A change to who is in which cell drops the selection made before it.
  const change = (next: Partial<RetentionSettings>) =>
    onSettingsChange({
      ...settings,
      filters: [],
      selectedCell: undefined,
      ...next,
    });
  const activity = new Set(
    (settings.activityEvents ?? []).map((value) =>
      categoryKey(categoryValue(value))
    )
  );

  return (
    <div className="space-y-2.5">
      <div className="eda-setting-grid">
        <Label>Entity</Label>
        <ActionTooltip content="Who is retained, such as a user or account ID. Each entity joins one cohort.">
          <FieldSelector
            label=""
            placeholder="Entity field"
            value={settings.entityField}
            onChange={(entityField) => change({ entityField })}
          />
        </ActionTooltip>
        <Label>Time</Label>
        <ActionTooltip content="When each event happened. Cohorts and periods are UTC calendar periods.">
          <FieldSelector
            label=""
            placeholder="Time field"
            value={settings.timeField}
            onChange={(timeField) => change({ timeField })}
          />
        </ActionTooltip>
        <Label>Event</Label>
        <ActionTooltip content="Optional. The field that names each event, so entry and activity can be limited to some events.">
          <FieldSelector
            label=""
            placeholder="Any event"
            allowClear
            value={settings.field}
            onChange={(field) =>
              change({
                field,
                entryEvent: undefined,
                activityEvents: undefined,
              })
            }
          />
        </ActionTooltip>
        {settings.field && (
          <>
            <Label htmlFor={`retention-entry-${settings.id}`}>Entry</Label>
            <ActionTooltip content="The event that puts an entity into its cohort, such as signup. First event uses whatever the entity did first.">
              <select
                id={`retention-entry-${settings.id}`}
                className={SELECT}
                value={
                  settings.entryEvent === undefined
                    ? ""
                    : categoryKey(categoryValue(settings.entryEvent))
                }
                onChange={(event) =>
                  change({ entryEvent: byKey.get(event.target.value)?.value })
                }
              >
                <option value="">First event</option>
                {events.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.label} ({item.count.toLocaleString()})
                  </option>
                ))}
              </select>
            </ActionTooltip>
          </>
        )}
        <Label>Period</Label>
        <ToggleGroup
          type="single"
          size="sm"
          variant="outline"
          value={settings.period}
          onValueChange={(period) =>
            period && change({ period: period as RetentionPeriod })
          }
          aria-label="Period"
          className="justify-start"
        >
          {PERIODS.map(([value, text, help]) => (
            <ActionTooltip key={value} content={help}>
              <span className="inline-flex">
                <ToggleGroupItem value={value} className="px-2">
                  {text}
                </ToggleGroupItem>
              </span>
            </ActionTooltip>
          ))}
        </ToggleGroup>
        <Label htmlFor={`retention-periods-${settings.id}`}>Show</Label>
        <ActionTooltip content="How many periods after entry to show, starting from period 0.">
          <Input
            id={`retention-periods-${settings.id}`}
            className="h-7"
            type="number"
            min={1}
            max={MAX_RETENTION_PERIODS}
            placeholder={String(DEFAULT_RETENTION_PERIODS)}
            value={settings.periods}
            onChange={(event) => {
              const periods = Number(event.target.value);
              if (
                Number.isInteger(periods) &&
                periods >= 1 &&
                periods <= MAX_RETENTION_PERIODS
              )
                change({ periods });
            }}
          />
        </ActionTooltip>
      </div>
      {settings.field && events.length > 0 && (
        <section className="space-y-1" aria-labelledby="retention-activity">
          <div className="flex items-baseline justify-between">
            <h5 id="retention-activity" className="text-sm font-medium">
              Counts as active
            </h5>
            <span className="text-xs text-muted-foreground">
              {activity.size ? `${activity.size} events` : "Any event"}
            </span>
          </div>
          <ul className="max-h-36 space-y-0.5 overflow-y-auto">
            {events.map((item) => (
              <li key={item.key}>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={activity.has(item.key)}
                    onChange={(event) => {
                      const next = event.target.checked
                        ? [...(settings.activityEvents ?? []), item.value]
                        : (settings.activityEvents ?? []).filter(
                            (value) =>
                              categoryKey(categoryValue(value)) !== item.key
                          );
                      change({
                        activityEvents: next.length ? next : undefined,
                      });
                    }}
                  />
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {item.count.toLocaleString()}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
