import type { ChartSettingsPanelProps } from "@/types/ChartTypes";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ActionTooltip } from "@/components/ui/tooltip";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type {
  ScatterPlotSettings,
  ScatterRegressionSettings,
} from "./definition";
import { DEFAULT_DEGREE, DEFAULT_SPAN } from "./regression";
import { DEFAULT_MARGINAL_BINS } from "./marginalPlan";

type Method = ScatterRegressionSettings["method"] | "none";

/** One fit method and its shared parameters for every facet of this chart. */
export function RegressionSettings({
  settings,
  onSettingsChange,
}: ChartSettingsPanelProps<ScatterPlotSettings>) {
  const regression = settings.regression;
  const update = (next: Partial<ScatterRegressionSettings>) =>
    onSettingsChange({
      ...settings,
      regression: { ...regression!, ...next },
    });
  return (
    <>
      <Label className="col-span-2">Fit method</Label>
      <ToggleGroup
        type="single"
        value={regression?.method ?? "none"}
        onValueChange={(value) => {
          const method = (value || "none") as Method;
          onSettingsChange({
            ...settings,
            regression:
              method === "none" ? undefined : { ...regression, method },
          });
        }}
        aria-label="Fit method"
        variant="outline"
        size="sm"
        className="col-span-2 grid grid-cols-2"
      >
        {(
          [
            ["none", "None", "Do not draw a fitted curve."],
            [
              "linear",
              "Linear",
              "Fit a least-squares line with slope, offset, and R².",
            ],
            [
              "polynomial",
              "Polynomial",
              "Add powers of X up to a chosen degree.",
            ],
            ["loess", "LOESS", "Follow the data with local weighted lines."],
          ] as const
        ).map(([value, label, help]) => (
          <ActionTooltip key={value} content={help}>
            <ToggleGroupItem
              value={value}
              aria-label={label}
              className="text-xs aria-checked:bg-primary/10 aria-checked:font-semibold aria-checked:text-primary"
            >
              {label}
            </ToggleGroupItem>
          </ActionTooltip>
        ))}
      </ToggleGroup>
      {regression?.method === "polynomial" && (
        <>
          <Label htmlFor="scatter-fit-degree">Degree</Label>
          <ActionTooltip content="Highest power of X, from 2 to 6. Every group and facet uses this degree. A group needs more distinct X values than the degree.">
            <Input
              id="scatter-fit-degree"
              type="number"
              min={2}
              max={6}
              step={1}
              value={regression.degree ?? DEFAULT_DEGREE}
              onChange={(event) => {
                const degree = Number(event.target.value);
                if (Number.isInteger(degree) && degree >= 2 && degree <= 6)
                  update({ degree });
              }}
            />
          </ActionTooltip>
        </>
      )}
      {regression?.method === "loess" && (
        <>
          <Label htmlFor="scatter-fit-span">Span</Label>
          <ActionTooltip content="Share of each group's rows in every local fit, from 0.2 to 1. Larger spans give smoother curves. Every group and facet uses this span.">
            <Input
              id="scatter-fit-span"
              type="number"
              min={0.2}
              max={1}
              step={0.05}
              value={regression.span ?? DEFAULT_SPAN}
              onChange={(event) => {
                const span = Number(event.target.value);
                if (span >= 0.2 && span <= 1) update({ span });
              }}
            />
          </ActionTooltip>
        </>
      )}
      {regression && settings.colorField && (
        <div className="col-start-2 flex items-center gap-2">
          <ActionTooltip content="Adds one dashed fit through every color group in each facet, beside the per-group fits. Off by default.">
            <span className="inline-flex w-fit">
              <Switch
                id="scatter-fit-overall"
                checked={Boolean(regression.overall)}
                onCheckedChange={(checked) =>
                  update({ overall: checked || undefined })
                }
              />
            </span>
          </ActionTooltip>
          <Label htmlFor="scatter-fit-overall">Overall fit</Label>
        </div>
      )}
      <div className="col-start-2 flex items-center gap-2">
        <ActionTooltip content="Shows Pearson r and the pair count on the chart. Alt-click it for means, standard deviations, the sample covariance matrix, and per-group results. Uses the rows that pass the other charts' filters.">
          <span className="inline-flex w-fit">
            <Switch
              id="scatter-summary"
              checked={Boolean(settings.summary)}
              onCheckedChange={(checked) =>
                onSettingsChange({ ...settings, summary: checked || undefined })
              }
            />
          </span>
        </ActionTooltip>
        <Label htmlFor="scatter-summary">Paired summary</Label>
      </div>
      <div className="col-start-2 flex items-center gap-2">
        <ActionTooltip content="Adds an X histogram above the plot and a Y histogram to its right, counting the plotted points. Click a bar to filter to its range.">
          <span className="inline-flex w-fit">
            <Switch
              id="scatter-marginals"
              checked={Boolean(settings.marginals)}
              onCheckedChange={(checked) =>
                onSettingsChange({
                  ...settings,
                  marginals: checked ? {} : undefined,
                })
              }
            />
          </span>
        </ActionTooltip>
        <Label htmlFor="scatter-marginals">Marginal histograms</Label>
      </div>
      {settings.marginals && (
        <>
          <Label htmlFor="scatter-marginal-bins">Histogram bins</Label>
          <ActionTooltip content="Equal intervals across each axis's full-source range, from 5 to 60. Edges stay fixed while filtering.">
            <Input
              id="scatter-marginal-bins"
              type="number"
              min={5}
              max={60}
              step={1}
              value={settings.marginals.bins ?? DEFAULT_MARGINAL_BINS}
              onChange={(event) => {
                const bins = Number(event.target.value);
                if (Number.isInteger(bins) && bins >= 5 && bins <= 60)
                  onSettingsChange({ ...settings, marginals: { bins } });
              }}
            />
          </ActionTooltip>
        </>
      )}
    </>
  );
}
