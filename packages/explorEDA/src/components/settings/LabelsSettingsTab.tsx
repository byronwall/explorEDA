import { ChartSettings, type ChartStyleOverrides } from "@/types/ChartTypes";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ActionTooltip } from "../ui/tooltip";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";

const toggleClass =
  "w-full min-w-0 px-1 text-xs aria-checked:bg-primary/10 aria-checked:font-semibold aria-checked:text-primary";

const WEIGHTS = [
  ["Regular", 400],
  ["Semibold", 600],
  ["Bold", 700],
] as const;

interface LabelsSettingsTabProps {
  settings: ChartSettings;
  onSettingChange: (key: string, value: unknown) => void;
}

export function LabelsSettingsTab({
  settings,
  onSettingChange,
}: LabelsSettingsTabProps) {
  const style = settings.style ?? {};
  const setStyle = (key: keyof ChartStyleOverrides, value?: number) => {
    const next = { ...style, [key]: value };
    if (value === undefined) delete next[key];
    onSettingChange("style", Object.keys(next).length ? next : undefined);
  };
  const sizeInput = (
    id: string,
    key: "titleSize" | "subtitleSize",
    what: string
  ) => (
    <ActionTooltip
      content={`${what} size in px for this chart. Leave it empty to follow the workspace theme.`}
    >
      <Input
        id={id}
        type="number"
        min={8}
        max={64}
        placeholder="Theme"
        value={style[key] ?? ""}
        onChange={(e) => {
          if (!e.target.value) setStyle(key, undefined);
          else if (e.target.validity.valid)
            setStyle(key, e.target.valueAsNumber);
        }}
      />
    </ActionTooltip>
  );
  return (
    <div className="space-y-2.5">
      <div className="eda-setting-grid">
        <Label htmlFor="chart-title">Chart title</Label>
        <Input
          id="chart-title"
          value={settings.title || ""}
          onChange={(e) => onSettingChange("title", e.target.value)}
          placeholder="Enter chart title"
        />

        <Label htmlFor="chart-subtitle">Subtitle</Label>
        <Input
          id="chart-subtitle"
          value={settings.subtitle ?? ""}
          onChange={(e) =>
            onSettingChange("subtitle", e.target.value || undefined)
          }
          placeholder="What the chart shows, for whom"
        />

        <Label htmlFor="chart-note">Source note</Label>
        <Input
          id="chart-note"
          value={settings.note ?? ""}
          onChange={(e) => onSettingChange("note", e.target.value || undefined)}
          placeholder="Source: …"
        />

        <Label htmlFor="chart-title-size">Title size</Label>
        {sizeInput("chart-title-size", "titleSize", "Title")}

        <span className="eda-setting-label">Title weight</span>
        <ToggleGroup
          type="single"
          value={style.titleWeight ? String(style.titleWeight) : "theme"}
          onValueChange={(value) => {
            if (value)
              setStyle(
                "titleWeight",
                value === "theme" ? undefined : Number(value)
              );
          }}
          aria-label="Title weight"
          variant="outline"
          size="sm"
          className="grid w-full grid-cols-4"
        >
          <ActionTooltip content="Follow the workspace theme's title weight.">
            <ToggleGroupItem
              value="theme"
              aria-label="Theme"
              className={toggleClass}
            >
              Theme
            </ToggleGroupItem>
          </ActionTooltip>
          {WEIGHTS.map(([name, weight]) => (
            <ActionTooltip
              key={weight}
              content={`${name} title (${weight}) for this chart, whatever the theme.`}
            >
              <ToggleGroupItem
                value={String(weight)}
                aria-label={name}
                className={toggleClass}
              >
                {name.slice(0, 4)}
              </ToggleGroupItem>
            </ActionTooltip>
          ))}
        </ToggleGroup>

        <Label htmlFor="chart-subtitle-size">Subtitle size</Label>
        {sizeInput("chart-subtitle-size", "subtitleSize", "Subtitle")}

        {settings.style && (
          <Button
            variant="ghost"
            size="sm"
            className="col-start-2 justify-self-start"
            tooltip="Clear this chart's title and subtitle type so they follow the workspace theme again"
            onClick={() => onSettingChange("style", undefined)}
          >
            Reset type to theme
          </Button>
        )}

        {["row", "bar", "scatter", "line", "boxplot"].includes(
          settings.type
        ) && (
          <>
            <Label htmlFor="chart-x-label">X axis & units</Label>
            <Input
              id="chart-x-label"
              value={settings.xAxisLabel || ""}
              onChange={(e) => onSettingChange("xAxisLabel", e.target.value)}
              placeholder="Enter X axis label"
            />

            <Label htmlFor="chart-y-label">Y axis & units</Label>
            <Input
              id="chart-y-label"
              value={settings.yAxisLabel || ""}
              onChange={(e) => onSettingChange("yAxisLabel", e.target.value)}
              placeholder="Enter Y axis label"
            />
            <p className="col-start-2 text-xs text-muted-foreground">
              Leave an axis label blank to inherit the field label. Text here
              always stays local to this chart.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
