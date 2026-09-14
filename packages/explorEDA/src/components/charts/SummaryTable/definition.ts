import { BaseChartSettings, ChartDefinition } from "@/types/ChartTypes";
import { DEFAULT_CHART_SETTINGS } from "@/utils/defaultSettings";
import { Info } from "lucide-react";

import { SummaryTable } from "./SummaryTable";
import { SummaryTableSettingsPanel } from "./SummaryTableSettingsPanel";

export interface SummaryTableSettings extends BaseChartSettings {
  type: "summary";
  // Summary table is a simple display of statistics
  // It inherits all base settings and doesn't need additional settings
}

export const summaryTableDefinition: ChartDefinition<SummaryTableSettings> = {
  type: "summary",
  name: "Summary Table",
  description: "Display summary statistics for your data",
  icon: Info,

  component: SummaryTable,
  settingsPanel: SummaryTableSettingsPanel,

  createDefaultSettings: (layout) => ({
    ...DEFAULT_CHART_SETTINGS,
    id: crypto.randomUUID(),
    type: "summary",
    title: "Summary Table",
    layout,
    margin: { top: 20, right: 20, bottom: 20, left: 20 },
  }),

  validateSettings: () => {
    // Summary table is always valid as it shows basic statistics
    return true;
  },

  getFilterFunction: () => {
    // Summary table doesn't support filtering
    return () => true;
  },
};
