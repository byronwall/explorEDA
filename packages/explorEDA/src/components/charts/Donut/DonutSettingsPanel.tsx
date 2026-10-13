import { useMemo } from "react";
import { FieldSelector } from "@/components/FieldSelector";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ActionTooltip } from "@/components/ui/tooltip";
import { finiteNumber } from "@/lib/valueParsing";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { ChartSettingsPanelProps } from "@/types/ChartTypes";
import type { DonutSettings } from "./definition";
import { DEFAULT_DONUT_SLICES, type DonutAggregation } from "./donutPlan";

export function DonutSettingsPanel({
  settings,
  onSettingsChange,
}: ChartSettingsPanelProps<DonutSettings>) {
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

  const changeAggregation = (aggregation: DonutAggregation) =>
    onSettingsChange({
      ...settings,
      aggregation,
      ...(aggregation === "sum" && !settings.measureField
        ? { measureField: measureFields[0] }
        : {}),
    });

  return (
    <div className="eda-setting-grid">
      <Label>Categories</Label>
      <ActionTooltip content="Each category of this field gets a slice of the whole: every row that passes the other charts' filters.">
        <FieldSelector
          label=""
          placeholder="Category field"
          value={settings.field}
          onChange={(field) => onSettingsChange({ ...settings, field })}
        />
      </ActionTooltip>
      <Label htmlFor={`donut-aggregation-${settings.id}`}>Measure</Label>
      <select
        id={`donut-aggregation-${settings.id}`}
        className="h-9 min-w-0 rounded-md border border-input bg-background px-2 text-sm"
        value={settings.aggregation}
        onChange={(event) =>
          changeAggregation(event.target.value as DonutAggregation)
        }
      >
        <option value="count">Count rows</option>
        <option value="sum" disabled={!measureFields.length}>
          Sum
        </option>
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
      <Label htmlFor={`donut-top-${settings.id}`}>Top N</Label>
      <ActionTooltip content="How many of the largest categories get their own slice. The rest pool into Other, which selects all of them.">
        <Input
          id={`donut-top-${settings.id}`}
          className="h-9"
          type="number"
          min={1}
          placeholder={String(DEFAULT_DONUT_SLICES)}
          value={settings.topN ?? ""}
          onChange={(event) => {
            const value = event.target.value;
            const number = value === "" ? undefined : Number(value);
            if (
              number === undefined ||
              (Number.isInteger(number) && number > 0)
            )
              onSettingsChange({ ...settings, topN: number });
          }}
        />
      </ActionTooltip>
    </div>
  );
}
