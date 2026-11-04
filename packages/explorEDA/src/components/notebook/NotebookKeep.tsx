import { createContext, useContext } from "react";
import type { Filter } from "@/types/FilterTypes";
import type { SavedChartSettings } from "@/types/SavedDataTypes";

/**
 * A notebook's text holds each chart's kept selection. Clicks stay
 * exploratory; Keep writes the live selection into the text on purpose.
 */
export interface NotebookKeepValue {
  /** The selection the text saves for a chart. */
  kept: (chartId: string) => Filter[];
  /** Writes the chart, selection included, back into the text. */
  keep: (chart: SavedChartSettings) => void;
}

export const NotebookKeepContext = createContext<NotebookKeepValue | null>(
  null
);

/** Null outside an editable notebook. */
export function useNotebookKeep() {
  return useContext(NotebookKeepContext);
}
