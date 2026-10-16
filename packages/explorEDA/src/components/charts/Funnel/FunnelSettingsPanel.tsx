import { ArrowDown, ArrowUp, X } from "lucide-react";
import { FieldSelector } from "@/components/FieldSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ActionTooltip } from "@/components/ui/tooltip";
import { categoryKey, categoryLabel, categoryValue } from "@/lib/categories";
import type { ChartSettingsPanelProps, datum } from "@/types/ChartTypes";
import {
  MAX_FUNNEL_STEPS,
  MIN_FUNNEL_STEPS,
  type FunnelSettings,
} from "./definition";
import { useEventValues } from "../useEventValues";

const SELECT =
  "h-7 w-full min-w-0 rounded-md border border-input bg-background px-2 text-sm";

export function FunnelSettingsPanel({
  settings,
  onSettingsChange,
}: ChartSettingsPanelProps<FunnelSettings>) {
  // Event values, most frequent first, as step choices.
  const events = useEventValues(settings.field);
  const byKey = new Map(events.map((item) => [item.key, item]));

  const change = (next: Partial<FunnelSettings>) =>
    onSettingsChange({ ...settings, ...next });
  // Changing what the steps mean drops the selection made under the old ones.
  const setSteps = (steps: datum[]) => change({ steps, filters: [] });
  const move = (from: number, to: number) => {
    const next = settings.steps.slice();
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setSteps(next);
  };
  const stepSelect = (
    value: datum | undefined,
    onChange: (value: datum) => void,
    label: string
  ) => (
    <select
      className={SELECT}
      aria-label={label}
      value={value === undefined ? "" : categoryKey(categoryValue(value))}
      onChange={(event) => {
        const item = byKey.get(event.target.value);
        if (item) onChange(item.value);
      }}
    >
      {value === undefined && <option value="">{label}</option>}
      {events.map((item) => (
        <option key={item.key} value={item.key}>
          {item.label} ({item.count.toLocaleString()})
        </option>
      ))}
    </select>
  );

  return (
    <div className="space-y-2.5">
      <div className="eda-setting-grid">
        <Label>Entity</Label>
        <ActionTooltip content="Who moves through the funnel, such as a user or account ID. Each entity counts once per step.">
          <FieldSelector
            label=""
            placeholder="Entity field"
            value={settings.entityField}
            onChange={(entityField) => change({ entityField, filters: [] })}
          />
        </ActionTooltip>
        <Label>Event</Label>
        <ActionTooltip content="The field that names what happened. Steps are values of this field.">
          <FieldSelector
            label=""
            placeholder="Event field"
            value={settings.field}
            onChange={(field) => change({ field, steps: [], filters: [] })}
          />
        </ActionTooltip>
        <Label>Time</Label>
        <ActionTooltip content="When each event happened. Steps count in time order.">
          <FieldSelector
            label=""
            placeholder="Time field"
            value={settings.timeField}
            onChange={(timeField) => change({ timeField, filters: [] })}
          />
        </ActionTooltip>
        <Label htmlFor={`funnel-window-${settings.id}`}>Window</Label>
        <ActionTooltip content="Days from an entity's first step in which later steps count. Blank counts later steps at any time.">
          <Input
            id={`funnel-window-${settings.id}`}
            className="h-7"
            type="number"
            min={1}
            placeholder="Any time"
            value={settings.windowDays ?? ""}
            onChange={(event) => {
              const text = event.target.value;
              const days = text === "" ? undefined : Number(text);
              if (days === undefined || (Number.isFinite(days) && days > 0))
                change({ windowDays: days, filters: [] });
            }}
          />
        </ActionTooltip>
      </div>
      <section className="space-y-2" aria-labelledby="funnel-steps-heading">
        <div className="flex items-baseline justify-between">
          <h5 id="funnel-steps-heading" className="text-sm font-medium">
            Steps, in order
          </h5>
          <span className="text-xs text-muted-foreground">
            {settings.steps.length} of {MAX_FUNNEL_STEPS}
          </span>
        </div>
        <ol className="space-y-1.5">
          {settings.steps.map((step, index) => {
            const label = categoryLabel(categoryValue(step));
            return (
              <li
                key={`${categoryKey(categoryValue(step))}-${index}`}
                className="flex min-w-0 items-center gap-1"
              >
                <span className="w-4 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  {stepSelect(
                    step,
                    (value) =>
                      setSteps(
                        settings.steps.map((item, position) =>
                          position === index ? value : item
                        )
                      ),
                    `Step ${index + 1}`
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  aria-label={`Move ${label} earlier`}
                  tooltip="Move this step one place earlier."
                  disabled={index === 0}
                  onClick={() => move(index, index - 1)}
                >
                  <ArrowUp />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  aria-label={`Move ${label} later`}
                  tooltip="Move this step one place later."
                  disabled={index === settings.steps.length - 1}
                  onClick={() => move(index, index + 1)}
                >
                  <ArrowDown />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  aria-label={`Remove ${label}`}
                  tooltip="Remove this step."
                  onClick={() =>
                    setSteps(
                      settings.steps.filter((_, position) => position !== index)
                    )
                  }
                >
                  <X />
                </Button>
              </li>
            );
          })}
        </ol>
        {settings.field && settings.steps.length < MAX_FUNNEL_STEPS && (
          <div className="pl-5">
            {stepSelect(
              undefined,
              (value) => setSteps([...settings.steps, value]),
              "Add a step"
            )}
          </div>
        )}
        {settings.steps.length < MIN_FUNNEL_STEPS && (
          <p className="text-xs text-muted-foreground">
            A funnel needs at least two steps.
          </p>
        )}
      </section>
    </div>
  );
}
