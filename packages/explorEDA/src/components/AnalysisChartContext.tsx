import { createContext, useContext, type ReactNode } from "react";
import type {
  AnalysisField,
  AnalysisResultRow,
  AnalysisStep,
  SourceDefinition,
} from "@/types/AnalysisProject";

export interface AnalysisChartContextValue {
  query: { id: string; label: string; glyph: string };
  frame: { id: string; label: string; glyph: string };
  /** Rows in the selected query result, before chart and view filters. */
  availableCount: number;
  /** Evaluator rows keyed by the runtime numeric ID assigned at the chart boundary. */
  resultRowsById: Record<number, AnalysisResultRow>;
  fields?: AnalysisField[];
  sources?: SourceDefinition[];
  steps?: AnalysisStep[];
  onOpenQueryFlow?: (rowKey?: string) => void;
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
