import { useMemo } from "react";
import { FieldSelector } from "@/components/FieldSelector";
import { FilterListEditor } from "@/components/settings/FiltersSettingsTab";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ActionTooltip } from "@/components/ui/tooltip";
import { finiteNumber } from "@/lib/valueParsing";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { ChartSettingsPanelProps } from "@/types/ChartTypes";
import type {
  WaterfallAggregation,
  WaterfallMode,
  WaterfallSettings,
  WaterfallState,
} from "./waterfallTypes";

const STATE_NAMES = ["Start", "End"];
const STATE_HELP = [
  "The first bar: the measure over the rows this state counts, such as the plan or last year.",
  "The last bar: the measure over the rows this state counts, such as the actual or this year.",
];

export function WaterfallSettingsPanel({
  settings,
  onSettingsChange,
}: ChartSettingsPanelProps<WaterfallSettings>) {
  const getColumnNames = useDataLayer((state) => state.getColumnNames);
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const calculations = useDataLayer((state) => state.calculations);
  const profiles = useDataLayer((state) => state.fieldProfiles);
  const nonce = useDataLayer((state) => state.nonce);
  const measureFields = useMemo(() => {
    void calculations;
    void nonce;
    return getColumnNames().filter(
      (field) =>
        profiles.some(
          (profile) => profile.name === field && profile.dataType === "numeric"
        ) ||
        Object.values(getColumnData(field)).some(
          (value) =>
            typeof value !== "boolean" && finiteNumber(value) !== undefined
        )
    );
  }, [calculations, profiles, nonce, getColumnData, getColumnNames]);

  const states = [0, 1].map(
    (index) =>
      settings.states[index] ?? {
        label: STATE_NAMES[index]!,
        filters: [],
      }
  );
  const changeState = (index: number, next: Partial<WaterfallState>) =>
    onSettingsChange({
      ...settings,
      states: states.map((state, position) =>
        position === index ? { ...state, ...next } : state
      ),
    });
  const changeAggregation = (aggregation: WaterfallAggregation) =>
    onSettingsChange({
      ...settings,
      aggregation,
      ...(aggregation === "sum" && !settings.measureField
        ? { measureField: measureFields[0] }
        : {}),
    });

  const running = settings.mode === "accumulate";
  return (
    <div className="space-y-3">
      <div className="eda-setting-grid">
        <Label htmlFor={`waterfall-mode-${settings.id}`}>Shows</Label>
        <ActionTooltip content="Change between states bridges two totals, such as plan to actual, a step per category. Running total adds each step's signed measure in order, such as energy in and out through a day.">
          <select
            id={`waterfall-mode-${settings.id}`}
            className="h-9 min-w-0 rounded-md border border-input bg-background px-2 text-sm"
            value={settings.mode}
            onChange={(event) =>
              onSettingsChange({
                ...settings,
                mode: event.target.value as WaterfallMode,
              })
            }
          >
            <option value="bridge">Change between states</option>
            <option value="accumulate">Running total</option>
          </select>
        </ActionTooltip>
        <Label htmlFor={`waterfall-aggregation-${settings.id}`}>Measure</Label>
        <select
          id={`waterfall-aggregation-${settings.id}`}
          className="h-9 min-w-0 rounded-md border border-input bg-background px-2 text-sm"
          value={settings.aggregation}
          onChange={(event) =>
            changeAggregation(event.target.value as WaterfallAggregation)
          }
        >
          <option value="sum" disabled={!measureFields.length}>
            Sum
          </option>
          <option value="count">Count rows</option>
        </select>
        {settings.aggregation === "sum" && (
          <>
            <Label>Of</Label>
            <FieldSelector
              label=""
              placeholder="Measure"
              value={settings.measureField ?? ""}
              fields={measureFields}
              onChange={(measureField) =>
                onSettingsChange({ ...settings, measureField })
              }
            />
          </>
        )}
        <Label>Steps</Label>
        <ActionTooltip
          content={
            running
              ? "One step per category of this field, in order: numbers and dates in sequence, other values as they first appear."
              : "One step per category of this field, showing how much it changed between the two states."
          }
        >
          <FieldSelector
            label=""
            placeholder="Step field"
            value={settings.field}
            onChange={(field) => onSettingsChange({ ...settings, field })}
          />
        </ActionTooltip>
        <Label>Group by</Label>
        <ActionTooltip content="Groups steps by this field and closes each group with a subtotal bar of the running total.">
          <FieldSelector
            label=""
            placeholder="No subtotals"
            value={settings.parentField ?? ""}
            allowClear
            onChange={(parentField) =>
              onSettingsChange({
                ...settings,
                parentField: parentField || undefined,
              })
            }
          />
        </ActionTooltip>
      </div>
      {running && (
        <section className="eda-chart-rows" aria-label="Running total ends">
          <div className="eda-setting-grid">
            <Label htmlFor={`waterfall-start-label-${settings.id}`}>
              Start label
            </Label>
            <Input
              id={`waterfall-start-label-${settings.id}`}
              className="h-9"
              value={states[0]!.label}
              onChange={(event) =>
                changeState(0, { label: event.target.value })
              }
            />
            <Label htmlFor={`waterfall-start-value-${settings.id}`}>
              Start value
            </Label>
            <ActionTooltip content="The value the running total starts from, drawn as the first bar. Leave it blank to start at zero with no start bar.">
              <Input
                id={`waterfall-start-value-${settings.id}`}
                className="h-9"
                type="number"
                value={settings.startValue ?? ""}
                placeholder="0"
                onChange={(event) => {
                  const value = event.target.value;
                  const number = value === "" ? undefined : Number(value);
                  if (number === undefined || Number.isFinite(number))
                    onSettingsChange({ ...settings, startValue: number });
                }}
              />
            </ActionTooltip>
            <Label htmlFor={`waterfall-end-label-${settings.id}`}>
              End label
            </Label>
            <Input
              id={`waterfall-end-label-${settings.id}`}
              className="h-9"
              value={states[1]!.label}
              onChange={(event) =>
                changeState(1, { label: event.target.value })
              }
            />
          </div>
        </section>
      )}
      {!running &&
        states.map((state, index) => (
          <section
            key={index}
            className="eda-chart-rows"
            aria-label={`${STATE_NAMES[index]} state`}
          >
            <ActionTooltip content={STATE_HELP[index]}>
              <h3 className="w-fit text-xs font-semibold">
                {STATE_NAMES[index]} state
              </h3>
            </ActionTooltip>
            <div className="eda-setting-grid">
              <Label htmlFor={`waterfall-state-${index}-${settings.id}`}>
                Label
              </Label>
              <Input
                id={`waterfall-state-${index}-${settings.id}`}
                className="h-9"
                value={state.label}
                onChange={(event) =>
                  changeState(index, { label: event.target.value })
                }
              />
              {settings.aggregation === "sum" && (
                <>
                  <Label>Measure</Label>
                  <ActionTooltip content="Use another measure for this state, for data that keeps each state in its own column, such as plan and actual.">
                    <FieldSelector
                      label=""
                      placeholder="Same as chart"
                      value={state.measureField ?? ""}
                      allowClear
                      fields={measureFields}
                      onChange={(measureField) =>
                        changeState(index, {
                          measureField: measureField || undefined,
                        })
                      }
                    />
                  </ActionTooltip>
                </>
              )}
            </div>
            <FilterListEditor
              filters={state.filters}
              onChange={(filters) => changeState(index, { filters })}
              addPlaceholder="Count only rows where…"
            />
          </section>
        ))}
    </div>
  );
}
