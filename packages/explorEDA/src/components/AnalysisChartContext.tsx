import { createContext, useContext, type ReactNode } from "react";
import type {
  AnalysisField,
  AnalysisResultRow,
  AnalysisStep,
  SourceDefinition,
} from "@/types/AnalysisProject";

/**
 * What a chart inside `ExplorEdaProject` can learn about its rows: where each
 * field came from, and which query result row each runtime `__ID` stands for.
 * A plain `ExplorEda` has no provider, so every reader must accept undefined.
 */
export interface AnalysisChartContextValue {
  fields: AnalysisField[];
  sources: SourceDefinition[];
  steps: AnalysisStep[];
  /** Query result rows, indexed by the runtime `__ID` the charts use. */
  resultRows: readonly AnalysisResultRow[];
  /** Opens the query flow on the result rows behind a traced mark. */
  onOpenQueryFlow?: (rowKeys: string[]) => void;
}

const Context = createContext<AnalysisChartContextValue | undefined>(undefined);

export function AnalysisChartContextProvider({
  value,
  children,
}: {
  value: AnalysisChartContextValue;
  children: ReactNode;
}) {
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useAnalysisChartContext() {
  return useContext(Context);
}
