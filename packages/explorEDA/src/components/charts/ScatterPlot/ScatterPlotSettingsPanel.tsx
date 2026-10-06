import { ChartSettingsPanelProps } from "@/types/ChartTypes";
import { ScatterPlotSettings } from "./definition";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldSelector } from "@/components/FieldSelector";
import { useColorScales } from "@/hooks/useColorScales";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { ActionTooltip } from "@/components/ui/tooltip";
import { DensitySettings } from "./DensitySettings";
import { RegressionSettings } from "./RegressionSettings";
import { SurfaceSettings } from "./SurfaceSettings";
import { ColorScaleControl } from "@/components/colorScales/ColorScaleControl";

export function ScatterPlotSettingsPanel({
  settings,
  onSettingsChange,
}: ChartSettingsPanelProps<ScatterPlotSettings>) {
  const density = settings.display === "density";
  const { getOrCreateScaleForField } = useColorScales();
  const profiles = useDataLayer((s) => s.fieldProfiles);
  const calculations = useDataLayer((s) => s.calculations);
  const sizeFields = [
    ...new Set([
      ...profiles
        .filter((field) => field.dataType === "numeric")
        .map((field) => field.name),
      ...calculations.map((field) => field.resultColumnName),
      ...(settings.sizeField ? [settings.sizeField] : []),
    ]),
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[120px_1fr] items-center gap-4">
        <Label htmlFor="scatter-display">Display</Label>
        <ActionTooltip content="Points show individual rows. Rectangular and hexagonal bins count rows in fixed cells; a click selects a cell's exact rows. Smoothed density estimates rows per unit area and draws filled regions and contour lines.">
          <select
            id="scatter-display"
            className="h-9 min-w-0 rounded-md border border-input bg-background px-2 text-sm"
            value={settings.display ?? "points"}
            onChange={(event) =>
              onSettingsChange({
                ...settings,
                display: event.target.value as NonNullable<
                  ScatterPlotSettings["display"]
                >,
              })
            }
          >
            <option value="points">Points</option>
            <option value="density">Rectangular bins</option>
            <option value="hexbin">Hexagonal bins</option>
            <option value="contour">Smoothed density</option>
          </select>
        </ActionTooltip>
        <Label>X Field</Label>
        <FieldSelector
          label=""
          value={settings.xField}
          onChange={(value) => onSettingsChange({ ...settings, xField: value })}
        />

        <Label>Y Field</Label>
        <FieldSelector
          label=""
          value={settings.yField}
          onChange={(value) => onSettingsChange({ ...settings, yField: value })}
        />

        {density ? (
          <DensitySettings
            settings={settings}
            onSettingsChange={onSettingsChange}
          />
        ) : (
          <>
            <Label>Color Field</Label>
            <FieldSelector
              label=""
              value={settings.colorField ?? ""}
              allowClear
              onChange={(value) =>
                onSettingsChange({
                  ...settings,
                  colorField: value || undefined,
                  colorScaleId: value
                    ? getOrCreateScaleForField(value)
                    : undefined,
                })
              }
            />
            {settings.colorScaleId && (
              <div className="col-start-2 -mt-2">
                <ColorScaleControl scaleId={settings.colorScaleId} />
              </div>
            )}
            {settings.display === "hexbin" || settings.display === "contour" ? (
              <SurfaceSettings
                settings={settings}
                onSettingsChange={onSettingsChange}
              />
            ) : (
              <>
                <Label>Size by</Label>
                <FieldSelector
                  label=""
                  placeholder="Size field"
                  value={settings.sizeField ?? ""}
                  fields={sizeFields}
                  allowClear
                  onChange={(value) =>
                    onSettingsChange({
                      ...settings,
                      sizeField: value || undefined,
                    })
                  }
                />
                {settings.sizeField ? (
                  <>
                    <Label htmlFor="bubble-radius">Largest radius</Label>
                    <ActionTooltip content="Radius in pixels for the largest source value. Bubble area stays proportional to value. Small panels reduce the radius to fit.">
                      <Input
                        id="bubble-radius"
                        type="number"
                        min={6}
                        max={32}
                        step={1}
                        value={settings.maxBubbleRadius ?? 20}
                        onChange={(event) => {
                          const value = Number(event.target.value);
                          if (value >= 6 && value <= 32)
                            onSettingsChange({
                              ...settings,
                              maxBubbleRadius: value,
                            });
                        }}
                      />
                    </ActionTooltip>
                  </>
                ) : (
                  <>
                    <Label htmlFor="scatter-point-size">Point size</Label>
                    <Input
                      id="scatter-point-size"
                      type="number"
                      min={1}
                      max={12}
                      step={0.5}
                      value={settings.pointSize ?? 3}
                      onChange={(event) => {
                        const value = Number(event.target.value);
                        if (value >= 1 && value <= 12)
                          onSettingsChange({ ...settings, pointSize: value });
                      }}
                    />
                  </>
                )}
                <Label htmlFor="scatter-opacity">Opacity</Label>
                <Input
                  id="scatter-opacity"
                  type="number"
                  min={0.1}
                  max={1}
                  step={0.1}
                  value={settings.pointOpacity ?? 0.7}
                  onChange={(event) => {
                    const value = Number(event.target.value);
                    if (value >= 0.1 && value <= 1)
                      onSettingsChange({ ...settings, pointOpacity: value });
                  }}
                />
              </>
            )}
            <RegressionSettings
              settings={settings}
              onSettingsChange={onSettingsChange}
            />
          </>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {settings.display === "hexbin"
          ? "Each hexagon counts rows with numeric X and Y values. Darker color means more rows. Click a hexagon to select its source rows; Alt-click it to list them."
          : settings.display === "contour"
            ? "Shaded regions mark where the smoothed density reaches each level, in rows per X unit × Y unit. Lines outline the same levels. Drag to select a region."
            : density
              ? "Each bin counts rows with numeric X and Y values. Darker color means more rows. Bin widths use equal numeric intervals; a symmetric log axis changes their screen widths. Click a bin to select its source rows."
              : settings.sizeField
                ? "Bubble area represents a nonnegative value. The scale uses all source rows and stays fixed during filtering. Click a bubble to select its row. Drag a rectangle to select a range."
                : "Smaller, transparent points reveal overlap. Drag a rectangle to filter the other views."}
      </p>
    </div>
  );
}
