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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface ScatterPlotSettingsPanelProps
  extends ChartSettingsPanelProps<ScatterPlotSettings> {
  showRegression?: boolean;
}

export function ScatterPlotSettingsPanel({
  settings,
  onSettingsChange,
  showRegression = true,
}: ScatterPlotSettingsPanelProps) {
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
    <div className="space-y-2.5">
      <div className="eda-setting-grid">
        <Label htmlFor="scatter-display">Display</Label>
        <div className="min-w-0">
          <ToggleGroup
            type="single"
            value={settings.display ?? "points"}
            onValueChange={(display) => {
              if (display)
                onSettingsChange({
                  ...settings,
                  display: display as NonNullable<
                    ScatterPlotSettings["display"]
                  >,
                });
            }}
            aria-label="Scatter display"
            className="grid w-full grid-cols-4"
            variant="outline"
            size="sm"
          >
            {(
              [
                ["points", "Points", "Points", "Show each row as a point."],
                [
                  "density",
                  "Rect bins",
                  "Rect",
                  "Count rows in rectangular bins. Click a bin to select its rows.",
                ],
                [
                  "hexbin",
                  "Hex bins",
                  "Hex",
                  "Count rows in hexagonal bins. Click a hexagon to select its rows.",
                ],
                [
                  "contour",
                  "Density",
                  "Density",
                  "Estimate rows per unit area with filled regions and contour lines.",
                ],
              ] as const
            ).map(([value, label, short, help]) => (
              <ActionTooltip key={value} content={help}>
                <ToggleGroupItem
                  value={value}
                  aria-label={label}
                  className="w-full min-w-0 px-1 text-xs aria-checked:bg-primary/10 aria-checked:font-semibold aria-checked:text-primary"
                >
                  {short}
                </ToggleGroupItem>
              </ActionTooltip>
            ))}
          </ToggleGroup>
        </div>
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
            {showRegression && (
              <RegressionSettings
                settings={settings}
                onSettingsChange={onSettingsChange}
              />
            )}
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
