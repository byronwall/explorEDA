import {
  ChartSettings,
  FacetSettings,
  GridFacetSettings,
  WrapFacetSettings,
} from "@/types/ChartTypes";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { FieldSelector } from "../FieldSelector";
import { NumericInputEnter } from "../NumericInputEnter";
import { ComboBox } from "../ComboBox";
import MultiSelect, { Option } from "../ui/multi-select";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { groupFacetData } from "@/components/charts/FacetRelated/FacetContainer";
import { useMemo } from "react";
import { categoryLabel } from "@/lib/categories";
import { hasFieldDisplayFormat } from "@/lib/fieldSettings";

interface FacetSettingsTabProps {
  settings: ChartSettings;
  onSettingChange: (key: string, value: unknown) => void;
}

const FACET_TYPES = [
  { value: "wrap", label: "Wrap" },
  { value: "grid", label: "Grid" },
];

export function FacetSettingsTab({
  settings,
  onSettingChange,
}: FacetSettingsTabProps) {
  const data = useDataLayer((state) => state.data);
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const fieldSettings = useDataLayer((state) => state.fieldSettings);
  const nonce = useDataLayer((state) => state.nonce);
  const calculations = useDataLayer((state) => state.calculations);
  const formatFieldValue = useDataLayer((state) => state.formatFieldValue);
  const formatFacetValue = (
    field: string,
    value: Parameters<typeof formatFieldValue>[1]
  ) =>
    hasFieldDisplayFormat(fieldSettings[field])
      ? formatFieldValue(field, value)
      : categoryLabel(value);
  const handleFacetChange = (key: string, value: unknown) => {
    onSettingChange("facet", {
      ...settings.facet,
      [key]: value,
    });
  };

  const handleFacetTypeChange = (type: FacetSettings["type"]) => {
    if (type === "wrap") {
      onSettingChange("facet", {
        ...settings.facet,
        type,
        columnCount: 2,
      } as WrapFacetSettings);
    } else if (type === "grid") {
      onSettingChange("facet", {
        ...settings.facet,
        type,
        columnVariable: "",
      } as GridFacetSettings);
    }
  };

  const facetOptions = useMemo<Option[]>(() => {
    const facet = settings.facet;
    if (!facet?.enabled || !facet.rowVariable) return [];
    const rows = data.map((row) => row.__ID);
    const groups = groupFacetData(
      rows,
      getColumnData(facet.rowVariable),
      facet.type === "grid" ? getColumnData(facet.columnVariable) : null
    );
    return groups.map((group) => ({
      value: group.id,
      label:
        facet.type === "grid" && group.columnRawValue !== null
          ? `${formatFacetValue(facet.rowVariable, group.rowRawValue)} · ${formatFacetValue(facet.columnVariable, group.columnRawValue)}`
          : formatFacetValue(facet.rowVariable, group.rowRawValue),
    }));
  }, [
    data,
    fieldSettings,
    formatFieldValue,
    getColumnData,
    settings.facet,
    nonce,
    calculations,
  ]);
  const selectedFacetOptions = useMemo(() => {
    const byId = new Map(facetOptions.map((option) => [option.value, option]));
    return (settings.facet?.visibleFacetIds ?? []).flatMap((id) => {
      const option = byId.get(id);
      return option ? [option] : [];
    });
  }, [facetOptions, settings.facet?.visibleFacetIds]);

  return (
    <div className="space-y-4">
      {"aggregateId" in settings && settings.aggregateId ? (
        <p role="status" className="text-xs text-muted-foreground">
          Faceting is unavailable for grouped summary charts.
        </p>
      ) : null}
      {"aggregateId" in settings && settings.aggregateId ? null : (
        <div className="grid grid-cols-[120px_1fr] items-center gap-4">
          <Label htmlFor="enableFacet">Enable Faceting</Label>
          <div className="flex items-center">
            <Switch
              id="enableFacet"
              checked={!!settings.facet?.enabled}
              onCheckedChange={(checked) => {
                if (checked) {
                  onSettingChange("facet", {
                    enabled: true,
                    type: "wrap",
                    rowVariable: "",
                    columnCount: 2,
                  });
                } else {
                  handleFacetChange("enabled", false);
                }
              }}
            />
          </div>

          {settings.facet?.enabled && (
            <>
              <Label htmlFor="facetType">Facet Type</Label>
              <ComboBox
                value={FACET_TYPES.find(
                  (option) => option.value === settings.facet?.type
                )}
                options={FACET_TYPES}
                onChange={(option) =>
                  handleFacetTypeChange(option?.value as FacetSettings["type"])
                }
                optionToString={(option) => option.label}
                placeholder="Select facet type"
              />

              <Label>Row Variable</Label>
              <FieldSelector
                label=""
                value={settings.facet.rowVariable || ""}
                onChange={(value) => handleFacetChange("rowVariable", value)}
              />

              {settings.facet.type === "grid" ? (
                <>
                  <Label>Column Variable</Label>
                  <FieldSelector
                    label=""
                    value={
                      (settings.facet as GridFacetSettings).columnVariable || ""
                    }
                    onChange={(value) => {
                      onSettingChange("facet", {
                        ...settings.facet,
                        columnVariable: value,
                        enabled: true,
                        type: "grid",
                      } as GridFacetSettings);
                    }}
                  />
                </>
              ) : (
                <>
                  <Label htmlFor="columns">Number of Columns</Label>
                  <NumericInputEnter
                    value={
                      (settings.facet as WrapFacetSettings).columnCount || 2
                    }
                    onChange={(value) => {
                      onSettingChange("facet", {
                        ...settings.facet,
                        columnCount: value,
                        enabled: true,
                        type: "wrap",
                      } as WrapFacetSettings);
                    }}
                    min={1}
                    max={10}
                    stepSmall={1}
                    stepMedium={1}
                    stepLarge={2}
                    placeholder="Enter number of columns"
                  />
                </>
              )}

              <Label>Visible facets</Label>
              <div className="space-y-2">
                <p
                  id="visible-facets-help"
                  className="text-xs text-muted-foreground"
                >
                  Select the groups to show. Drag selected chips to reorder
                  them.
                </p>
                <MultiSelect
                  options={facetOptions}
                  value={selectedFacetOptions}
                  commandProps={{ "aria-describedby": "visible-facets-help" }}
                  onChange={(options: Option[]) =>
                    handleFacetChange(
                      "visibleFacetIds",
                      options.map((option) => option.value)
                    )
                  }
                  placeholder="All facets"
                  hideClearAllButton
                />
                {settings.facet?.visibleFacetIds !== undefined && (
                  <button
                    type="button"
                    className="text-xs underline"
                    onClick={() =>
                      handleFacetChange("visibleFacetIds", undefined)
                    }
                  >
                    Show all facets
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
