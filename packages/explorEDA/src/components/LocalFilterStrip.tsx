import { Filter as FilterIcon } from "lucide-react";
import type { Filter } from "@/types/FilterTypes";
import { formatFilterLabel, useFieldFormatting } from "./ActiveFilterStatus";
import { ActionTooltip } from "./ui/tooltip";

export const LOCAL_FILTER_STRIP_HEIGHT = 28;

/**
 * Names the rows a chart draws when it has its own filters, so a smaller
 * chart never reads as the whole dataset.
 */
export function LocalFilterStrip({ filters }: { filters: Filter[] }) {
  const formatting = useFieldFormatting();
  const labels = filters.map((filter) => formatFilterLabel(filter, formatting));

  return (
    <ActionTooltip
      content={`This chart draws only rows where ${labels.join(" and ")}. Other charts ignore these filters. Change them in chart settings, under Filters.`}
    >
      <div
        className="eda-local-filters"
        role="group"
        aria-label={`Chart rows: ${labels.join(", ")}`}
        tabIndex={0}
      >
        <FilterIcon className="size-3.5 shrink-0" aria-hidden="true" />
        <span className="eda-local-filters-lead">Only</span>
        {labels.map((label, index) => (
          <span key={index} className="eda-local-filter-chip">
            {label}
          </span>
        ))}
      </div>
    </ActionTooltip>
  );
}
