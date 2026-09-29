import { BaseChartSettings, ChartDefinition } from "@/types/ChartTypes";
import { DEFAULT_CHART_SETTINGS } from "@/utils/defaultSettings";
import { FileText } from "lucide-react";
import { Markdown } from "./Markdown";

export interface MarkdownSettings extends BaseChartSettings {
  type: "markdown";
  content: string;
}

export const markdownDefinition: ChartDefinition<MarkdownSettings> = {
  type: "markdown",
  name: "Markdown",
  description: "Notes with headings, lists, and quotes. Type / to add a block.",
  icon: FileText,

  component: Markdown,
  settingsPanel: () => null,

  createDefaultSettings: (layout) => ({
    ...DEFAULT_CHART_SETTINGS,
    id: crypto.randomUUID(),
    type: "markdown",
    content: "",
    layout,
  }),

  validateSettings: (settings) => {
    return settings.type === "markdown";
  },

  getFilterFunction: () => () => true, // No filtering for markdown
};
