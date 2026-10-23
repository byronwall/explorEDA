import { useId } from "react";
import { ListTree, Network, Plus, Rows3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCreateCharts } from "@/hooks/useCreateCharts";
import { ChartTypeMenuItems } from "./plot/ChartCreationButtons";
import { useChartDraft } from "./plot/ChartDraftContext";

interface WorkspaceStartProps {
  /** The grid already shows a summary table beside this card. */
  hasSummary: boolean;
  onShowRows: () => void;
  onShowFields: () => void;
  onShowSchema: () => void;
}

/**
 * The next steps a fresh workspace offers until the first chart lands. The
 * rows, fields, and schema open in their own panels, so the grid starts light.
 */
export function WorkspaceStart({
  hasSummary,
  onShowRows,
  onShowFields,
  onShowSchema,
}: WorkspaceStartProps) {
  const titleId = useId();
  const chartDraft = useChartDraft();
  const { createChart } = useCreateCharts();
  const addLabel = (
    <>
      <Plus aria-hidden="true" />
      Add chart
    </>
  );

  return (
    <section className="eda-workspace-start" aria-labelledby={titleId}>
      <div className="eda-workspace-start-text">
        <h3 id={titleId}>Explore this data</h3>
        <p>
          {hasSummary
            ? "The summary lists each field's type, missing values, and spread. Add a chart to compare fields, or open the rows, fields, or schema to look closer."
            : "Add a chart to compare fields, or open the rows, fields, or schema to look closer."}
        </p>
      </div>
      <div className="eda-workspace-start-actions">
        {chartDraft ? (
          <Button
            size="sm"
            aria-haspopup="dialog"
            tooltip="Pick a type and fields, preview the chart, then place it on the grid"
            onClick={() => chartDraft.openDraft()}
          >
            {addLabel}
          </Button>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm">{addLabel}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <ChartTypeMenuItems onSelect={(type) => createChart(type, "")} />
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <Button
          variant="outline"
          size="sm"
          tooltip="Peek at the rows that pass every linked filter (R)"
          onClick={onShowRows}
        >
          <Rows3 aria-hidden="true" />
          Show rows
        </Button>
        <Button
          variant="outline"
          size="sm"
          tooltip="Every field with search, quick stats, and chart actions (F)"
          onClick={onShowFields}
        >
          <ListTree aria-hidden="true" />
          Show fields
        </Button>
        <Button
          variant="outline"
          size="sm"
          tooltip="Every table, field, and relationship"
          onClick={onShowSchema}
        >
          <Network aria-hidden="true" />
          Show schema
        </Button>
      </div>
    </section>
  );
}
