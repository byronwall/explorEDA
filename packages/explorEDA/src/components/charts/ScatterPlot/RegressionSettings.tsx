import type { ChartSettingsPanelProps } from "@/types/ChartTypes";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ActionTooltip } from "@/components/ui/tooltip";
import type {
  ScatterPlotSettings,
  ScatterRegressionSettings,
} from "./definition";

type Method = ScatterRegressionSettings["method"] | "none";

const METHOD_HELP =
  "Draws a fitted curve and its equation for each color group in each facet. Fits use the rows that pass the other charts' filters; selecting points on this chart does not refit. Linear fits a least-squares line and reports slope, offset, and R².";

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
        </select>
      </ActionTooltip>
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
