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

  return (
    <div className="space-y-4">
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
                  value={(settings.facet as WrapFacetSettings).columnCount || 2}
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
          </>
        )}
      </div>
    </div>
  );
}
