import { FieldSelector } from "@/components/FieldSelector";
import { Label } from "@/components/ui/label";
import { ActionTooltip } from "@/components/ui/tooltip";
import type { AggregateAggregation } from "@/lib/aggregates";
import { finiteNumber } from "@/lib/numeric";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { ChartSettingsPanelProps } from "@/types/ChartTypes";
import { useMemo } from "react";
import type { MetricCardSettings } from "./definition";

export function MetricCardSettingsPanel({
  settings,
  onSettingsChange,
}: ChartSettingsPanelProps<MetricCardSettings>) {
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

  const changeAggregation = (aggregation: AggregateAggregation) =>
    onSettingsChange({
      ...settings,
      aggregation,
      ...(aggregation !== "count" && !settings.measureField
        ? { measureField: measureFields[0] }
        : {}),
    });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[120px_minmax(0,1fr)] items-center gap-4">
        <Label htmlFor={`metric-card-aggregation-${settings.id}`}>Metric</Label>
        <select
          id={`metric-card-aggregation-${settings.id}`}
          className="h-9 min-w-0 rounded-md border border-input bg-background px-2 text-sm"
          value={settings.aggregation}
          onChange={(event) =>
            changeAggregation(event.target.value as AggregateAggregation)
          }
        >
          <option value="count">Count rows</option>
          <option value="sum" disabled={!measureFields.length}>
            Sum
          </option>
          <option value="average" disabled={!measureFields.length}>
            Average
          </option>
        </select>

        <Label>Entity ID</Label>
        <ActionTooltip content="Count distinct entities or use one agreeing measure value per entity. Leave empty to use result rows.">
          <FieldSelector
            label=""
            placeholder="Entity ID"
            value={settings.entityField ?? ""}
            allowClear
            fields={getColumnNames()}
            onChange={(entityField) =>
              onSettingsChange({
                ...settings,
                entityField: entityField || undefined,
              })
            }
          />
        </ActionTooltip>

        {settings.aggregation !== "count" && (
          <>
            <Label>Measure</Label>
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
      </div>
    </div>
  );
}
