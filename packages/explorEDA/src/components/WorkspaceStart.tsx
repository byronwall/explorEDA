import { useMemo } from "react";
import { Plus } from "lucide-react";
import { getChartDefinition } from "@/charts/registry";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ActionTooltip } from "@/components/ui/tooltip";
import { getChartTitle } from "@/components/charts/chartAccessibility";
import { useCreateCharts } from "@/hooks/useCreateCharts";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { ChartLayout } from "@/types/ChartTypes";
import { ChartTypeMenuItems } from "./plot/ChartCreationButtons";
import { useChartDraft } from "./plot/ChartDraftContext";
import { startSuggestions } from "./plot/startSuggestions";

/** Past this many characters a title may not fit two lines of the tile. */
const LONG_LABEL = 56;

interface WorkspaceStartProps {
  /** The grid spot this tile holds. A chart started here takes it. */
  slot?: ChartLayout;
  onShowRows: () => void;
  onShowFields: () => void;
  onShowSchema: () => void;
}

/**
 * A placeholder tile in the first free grid spot of a fresh workspace. It
 * offers first charts drawn from the data's own fields, and the rows, fields,
 * and schema, until a chart other than a summary lands.
 */
export function WorkspaceStart({
  slot,
  onShowRows,
  onShowFields,
  onShowSchema,
}: WorkspaceStartProps) {
  const profiles = useDataLayer((state) => state.fieldProfiles);
  const getFieldLabel = useDataLayer((state) => state.getFieldLabel);
  const addChart = useDataLayer((state) => state.addChart);
  const { buildChart, createChart } = useCreateCharts();
  const chartDraft = useChartDraft();
  // Each suggestion is the chart it starts, labeled with that chart's title.
  const suggestions = useMemo(
    () =>
      startSuggestions(profiles).map(({ type, field, yField }) => {
        const settings = buildChart(type, field, slot);
        if (settings.type === "scatter" && yField) {
          settings.xField = field;
          settings.yField = yField;
        }
        return { settings, label: getChartTitle(settings, getFieldLabel) };
      }),
    // buildChart is rebuilt each render; profiles and slot decide the result.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [profiles, slot?.x, slot?.y, slot?.w, slot?.h, getFieldLabel]
  );

  const otherLabel = suggestions.length > 0 ? "Other chart" : "Add a chart";
  const other = chartDraft ? (
    <button
      type="button"
      className="eda-start-chart eda-start-other"
      aria-haspopup="dialog"
      onClick={() => chartDraft.openDraft(undefined, slot)}
    >
      <Plus aria-hidden="true" />
      <span>{otherLabel}</span>
    </button>
  ) : (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="eda-start-chart eda-start-other">
          <Plus aria-hidden="true" />
          <span>{otherLabel}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <ChartTypeMenuItems onSelect={(type) => createChart(type, "", slot)} />
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <section className="eda-workspace-start" aria-label="Start exploring">
      <ul className="eda-start-charts" aria-label="Suggested charts">
        {suggestions.map(({ settings, label }) => {
          const Icon = getChartDefinition(settings.type).icon;
          const button = (
            <button
              type="button"
              className="eda-start-chart"
              onClick={() => addChart(settings)}
            >
              <Icon aria-hidden="true" />
              <span>{label}</span>
            </button>
          );
          return (
            <li key={settings.type}>
              {/* A long title clamps to two lines; hover shows all of it. */}
              {label.length > LONG_LABEL ? (
                <ActionTooltip content={label}>{button}</ActionTooltip>
              ) : (
                button
              )}
            </li>
          );
        })}
        <li>{other}</li>
      </ul>
      <p className="eda-start-panels">
        Or open the{" "}
        <ActionTooltip content="Peek at the rows that pass every linked filter (R)">
          <button type="button" onClick={onShowRows}>
            rows
          </button>
        </ActionTooltip>
        ,{" "}
        <ActionTooltip content="Every field with search, quick stats, and chart actions (F)">
          <button type="button" onClick={onShowFields}>
            fields
          </button>
        </ActionTooltip>
        , or{" "}
        <ActionTooltip content="Every table, field, and relationship">
          <button type="button" onClick={onShowSchema}>
            schema
          </button>
        </ActionTooltip>
      </p>
    </section>
  );
}
