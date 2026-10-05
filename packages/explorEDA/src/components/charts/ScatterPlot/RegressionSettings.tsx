import type { ChartSettingsPanelProps } from "@/types/ChartTypes";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ActionTooltip } from "@/components/ui/tooltip";
import type {
  ScatterPlotSettings,
  ScatterRegressionSettings,
} from "./definition";
import { DEFAULT_DEGREE, DEFAULT_SPAN } from "./regression";

type Method = ScatterRegressionSettings["method"] | "none";

const METHOD_HELP =
  "Draws a fitted curve and its equation for each color group in each facet. Fits use the rows that pass the other charts' filters; selecting points on this chart does not refit. Linear fits a least-squares line with slope, offset, and R². Polynomial adds powers of X up to a chosen degree. LOESS follows the data with local weighted lines and has no single equation.";

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
      <Label htmlFor="scatter-fit">Fit</Label>
      <ActionTooltip content={METHOD_HELP}>
        <select
          id="scatter-fit"
          className="h-9 min-w-0 rounded-md border border-input bg-background px-2 text-sm"
          value={regression?.method ?? "none"}
          onChange={(event) => {
            const method = event.target.value as Method;
            onSettingsChange({
              ...settings,
              regression:
                method === "none" ? undefined : { ...regression, method },
            });
          }}
        >
          <option value="none">None</option>
          <option value="linear">Linear</option>
          <option value="polynomial">Polynomial</option>
          <option value="loess">LOESS</option>
        </select>
      </ActionTooltip>
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
    </>
  );
}
