import { applyFilter } from "@/hooks/applyFilter";
import { IdType } from "@/providers/DataLayerProvider";
import { BaseChartSettings, ChartDefinition, datum } from "@/types/ChartTypes";
import { Filter } from "@/types/FilterTypes";
import { DEFAULT_CHART_SETTINGS } from "@/utils/defaultSettings";
import { ChartColumnBig } from "lucide-react";
import { BarChart } from "./BarChart";
import { BarChartSettingsPanel } from "./BarChartSettingsPanel";
import type { WidthBinning } from "./histogramBins";
import type { SpecLimits } from "@/lib/specification";

/**
 * Engineering histogram settings. Their presence marks a numeric field's
 * bars as authored: bins hold still, a selection keeps the exact range it
 * was made with, and a bin that a selection cuts through shows its share.
 */
export interface HistogramSettings {
  /** Auto keeps the bin-count algorithm; width repeats a saved grid. */
  binning: { mode: "auto" } | WidthBinning;
  /**
   * Inclusive specification limits. Either may be absent. A spec-status
   * selection reads them live.
   */
  spec?: SpecLimits;
}

export interface BarChartSettings extends BaseChartSettings {
  type: "bar";
  binCount?: number;
  histogram?: HistogramSettings;
  forceString?: boolean;
  aggregateId?: string;
  seriesField?: string;
  seriesLayout?: "grouped" | "stacked" | "percent";
  /**
   * Category bars in data order (the default), sorted by their labels, or by
   * their values, largest first. Binned bars keep their numeric order.
   */
  categoryOrder?: "data" | "label" | "value";
  filters: Filter[];
}

export const barChartDefinition: ChartDefinition<BarChartSettings> = {
  type: "bar",
  name: "Bar Chart",
  description: "Display data as vertical bars",
  icon: ChartColumnBig,

  component: BarChart,
  settingsPanel: BarChartSettingsPanel,

  createDefaultSettings: (layout, field) => ({
    ...DEFAULT_CHART_SETTINGS,
    id: crypto.randomUUID(),
    field: field ?? "",
    binCount: 20,
    type: "bar",
    title: "Bar Chart",
    layout,
    filters: [],
  }),

  validateSettings: (settings) => {
    return !!settings.field;
  },

  getFilterFunction: (
    settings: BarChartSettings,
    fieldGetter: (name: string) => Record<IdType, datum>
  ) => {
    if (settings.seriesField) {
      const active = settings.filters.map((filter) => ({
        filter,
        data: fieldGetter(filter.field),
      }));
      return (id: IdType) =>
        active.every(({ filter, data }) => applyFilter(data[id], filter));
    }
    if (settings.aggregateId) {
      // A grouped bar selects groups with a value filter on its group field
      // and keeps an optional measure range from the Selection tab.
      const range = [...settings.filters]
        .reverse()
        .find((f) => f.type === "range" || f.type === "date-range");
      const active = [
        ...settings.filters.filter((f) => f.type === "value"),
        ...(range ? [range] : []),
      ].map((filter) => ({ filter, data: fieldGetter(filter.field) }));
      return (d: IdType) =>
        active.every(({ filter, data }) => applyFilter(data[d], filter));
    }
    // Every predicate on the measurement must hold: a bin range and a
    // specification status can both narrow it.
    const own = settings.filters.filter(
      (f): f is Filter => f.field === settings.field
    );
    const dataHash = fieldGetter(settings.field);
    const spec = settings.histogram?.spec;

    return (d: IdType) => {
      const value = dataHash[d];
      return own.every((filter) => applyFilter(value, filter, spec));
    };
  },
};
