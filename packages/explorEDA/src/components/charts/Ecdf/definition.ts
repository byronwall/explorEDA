import { applyFilter } from "@/hooks/applyFilter";
import { IdType } from "@/providers/DataLayerProvider";
import { BaseChartSettings, ChartDefinition, datum } from "@/types/ChartTypes";
import { DEFAULT_CHART_SETTINGS } from "@/utils/defaultSettings";
import { ChartSpline } from "lucide-react";
import { EcdfChart } from "./EcdfChart";
import { EcdfSettingsPanel } from "./EcdfSettingsPanel";

export interface EcdfSettings extends BaseChartSettings {
  type: "ecdf";
  /**
   * "below" plots the share of values at or below x; "above" plots the share
   * at or above x, which reads better for "how many exceed" questions.
   */
  direction: "below" | "above";
  /** Plot x on a log scale when every value is positive. */
  logX: boolean;
  /** Mark where each curve crosses 50% and 90%. */
  showQuantiles: boolean;
  /** Draw a dashed curve for all rows together when the chart is split by color. */
  showOverall: boolean;
}

export const ecdfDefinition: ChartDefinition<EcdfSettings> = {
  type: "ecdf",
  name: "ECDF",
  description: "Share of values at or below each value, without bins",
  icon: ChartSpline,

  component: EcdfChart,
  settingsPanel: EcdfSettingsPanel,

  createDefaultSettings: (layout, field) => ({
    ...DEFAULT_CHART_SETTINGS,
    id: crypto.randomUUID(),
    type: "ecdf",
    title: "ECDF",
    field: field ?? "",
    direction: "below",
    logX: false,
    showQuantiles: true,
    showOverall: false,
    layout,
    margin: { top: 8, right: 16, bottom: 8, left: 8 },
    filters: [],
  }),

  validateSettings: (settings) => Boolean(settings.field),

  getFilterFunction: (
    settings: EcdfSettings,
    fieldGetter: (name: string) => Record<IdType, datum>
  ) => {
    // A threshold or span is a range on the field; legend picks are values on the color field.
    const filters = settings.filters.map((filter) => ({
      filter,
      values: fieldGetter(filter.field),
    }));
    return (id: IdType) =>
      filters.every(({ filter, values }) => applyFilter(values[id], filter));
  },
};
