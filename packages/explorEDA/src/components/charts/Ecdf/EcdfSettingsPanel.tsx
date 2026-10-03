import { FieldSelector } from "@/components/FieldSelector";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ActionTooltip } from "@/components/ui/tooltip";
import { useColorScales } from "@/hooks/useColorScales";
import { finiteNumber } from "@/lib/numeric";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { ChartSettingsPanelProps } from "@/types/ChartTypes";
import { useMemo } from "react";
import type { EcdfSettings } from "./definition";

function Toggle({
  id,
  label,
  help,
  checked,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  help: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="col-start-2">
      <ActionTooltip content={help}>
        <div className="flex items-center space-x-2">
          <Switch
            id={id}
            checked={checked}
            disabled={disabled}
            onCheckedChange={onChange}
          />
          <Label htmlFor={id}>{label}</Label>
        </div>
      </ActionTooltip>
    </div>
  );
}

export function EcdfSettingsPanel({
  settings,
  onSettingsChange,
}: ChartSettingsPanelProps<EcdfSettings>) {
  const getColumnNames = useDataLayer((s) => s.getColumnNames);
  const getColumnData = useDataLayer((s) => s.getColumnData);
  const calculations = useDataLayer((s) => s.calculations);
  const { getOrCreateScaleForField } = useColorScales();
  const numericFields = useMemo(() => {
    void calculations;
    return getColumnNames().filter((field) =>
      Object.values(getColumnData(field)).some(
        (value) =>
          typeof value !== "boolean" && finiteNumber(value) !== undefined
      )
    );
  }, [calculations, getColumnData, getColumnNames]);

  const change = (next: Partial<EcdfSettings>) =>
    onSettingsChange({ ...settings, ...next });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[120px_1fr] items-center gap-4">
        <Label>Field</Label>
        <FieldSelector
          label=""
          placeholder="Numeric field"
          value={settings.field}
          fields={numericFields}
          onChange={(field) =>
            // A threshold on the old field no longer applies.
            change({
              field,
              filters: settings.filters.filter(
                (filter) =>
                  !(filter.type === "range" && filter.field === settings.field)
              ),
            })
          }
        />

        <ActionTooltip content="Draw one curve per value of this field. Each curve uses its own rows as 100%, so groups of different sizes compare fairly.">
          <Label>Split by</Label>
        </ActionTooltip>
        <FieldSelector
          label=""
          placeholder="One curve"
          value={settings.colorField ?? ""}
          allowClear
          onChange={(value) =>
            change({
              colorField: value || undefined,
              colorScaleId: value ? getOrCreateScaleForField(value) : undefined,
              filters: settings.filters.filter(
                (filter) =>
                  filter.field !== settings.colorField ||
                  filter.field === settings.field
              ),
            })
          }
        />

        <Label>Read as</Label>
        <ToggleGroup
          type="single"
          size="sm"
          variant="outline"
          value={settings.direction}
          onValueChange={(next) => {
            if (!next || next === settings.direction) {
              return;
            }
            // A one-sided threshold points the other way after a switch.
            change({
              direction: next as EcdfSettings["direction"],
              filters: settings.filters.filter(
                (filter) =>
                  !(
                    filter.type === "range" &&
                    filter.field === settings.field &&
                    (filter.min === undefined || filter.max === undefined)
                  )
              ),
            });
          }}
          aria-label="Read as"
          className="justify-start"
        >
          {(
            [
              [
                "below",
                "≤ x",
                "Each point shows the share of rows at or below x. A click selects rows at or below a value.",
              ],
              [
                "above",
                "≥ x",
                "Each point shows the share of rows at or above x, for questions such as how many exceed a limit. A click selects rows at or above a value.",
              ],
            ] as const
          ).map(([value, text, help]) => (
            <ActionTooltip key={value} content={help}>
              <span className="inline-flex">
                <ToggleGroupItem
                  value={value}
                  className="px-2"
                  aria-label={value === "below" ? "At or below" : "At or above"}
                >
                  {text}
                </ToggleGroupItem>
              </span>
            </ActionTooltip>
          ))}
        </ToggleGroup>

        <Toggle
          id="ecdf-log"
          label="Log scale"
          help="Spread out small values when the field is skewed. Needs every value above zero."
          checked={settings.logX}
          onChange={(logX) => change({ logX })}
        />
        <Toggle
          id="ecdf-quantiles"
          label="Mark median and 90%"
          help="Put a dot where each curve crosses 50% and 90%, with guide labels at the right edge."
          checked={settings.showQuantiles}
          onChange={(showQuantiles) => change({ showQuantiles })}
        />
        <Toggle
          id="ecdf-overall"
          label="Add all-rows curve"
          help="Draw a dashed curve for every row together, behind the split curves."
          checked={settings.showOverall}
          disabled={!settings.colorField}
          onChange={(showOverall) => change({ showOverall })}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Click the chart to select rows past a value, or drag to select a span.
        Each step is an observed value, so no bin width changes the answer.
      </p>
    </div>
  );
}
