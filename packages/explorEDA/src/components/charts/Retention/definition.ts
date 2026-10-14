import { Grid2x2 as RetentionIcon } from "lucide-react";
import { applyFilter } from "@/hooks/applyFilter";
import type {
  BaseChartSettings,
  ChartDefinition,
  datum,
} from "@/types/ChartTypes";
import type { ValueFilter } from "@/types/FilterTypes";
import { DEFAULT_CHART_SETTINGS } from "@/utils/defaultSettings";
import { Retention } from "./Retention";
import { RetentionSettingsPanel } from "./RetentionSettingsPanel";
import type { RetentionPeriod } from "./retentionPlan";

export interface RetentionSettings extends BaseChartSettings {
  type: "retention";
  entityField: string;
  timeField: string;
  /** `field` is the optional event field that entry and activity read. */
  entryEvent?: datum;
  /** Events that count as active; unset or empty counts every event. */
  activityEvents?: datum[];
  period: RetentionPeriod;
  /** Elapsed periods shown, from period 0. */
  periods: number;
  /** The cell behind the chart's entity selection, as `cohort:period`. */
  selectedCell?: string;
}

export const DEFAULT_RETENTION_PERIODS = 8;
export const MAX_RETENTION_PERIODS = 24;

/** The chart's own selection: the entities active in one cell. */
export function retentionSelectionFilter(settings: RetentionSettings) {
  return settings.filters.find(
    (filter): filter is ValueFilter =>
      filter.type === "value" && filter.field === settings.entityField
  );
}

export const retentionDefinition: ChartDefinition<RetentionSettings> = {
  type: "retention",
  name: "Retention",
  description: "Group entities by when they started and see who came back",
  icon: RetentionIcon,
  component: Retention,
  settingsPanel: RetentionSettingsPanel,
  createDefaultSettings: (layout, field) => ({
    ...DEFAULT_CHART_SETTINGS,
    id: crypto.randomUUID(),
    type: "retention",
    title: "",
    field: field ?? "",
    entityField: "",
    timeField: "",
    period: "week",
    periods: DEFAULT_RETENTION_PERIODS,
    layout,
    filters: [],
  }),
  validateSettings: (settings) =>
    Boolean(settings.entityField && settings.timeField) &&
    settings.periods >= 1,
  getFilterFunction: (settings, fieldGetter) => {
    // A cell selects its entities by value, so every event of theirs passes.
    const filters = settings.filters.map((filter) => ({
      filter,
      values: fieldGetter(filter.field),
    }));
    return (id) =>
      filters.every(({ filter, values }) => applyFilter(values[id], filter));
  },
};
