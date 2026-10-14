import { ArrowDownWideNarrow as FunnelIcon } from "lucide-react";
import { applyFilter } from "@/hooks/applyFilter";
import { categoryKey, categoryValue } from "@/lib/categories";
import type {
  BaseChartSettings,
  ChartDefinition,
  datum,
} from "@/types/ChartTypes";
import type { ValueFilter } from "@/types/FilterTypes";
import { DEFAULT_CHART_SETTINGS } from "@/utils/defaultSettings";
import { Funnel } from "./Funnel";
import { FunnelSettingsPanel } from "./FunnelSettingsPanel";
import { funnelSelection } from "./funnelPlan";

export interface FunnelSettings extends BaseChartSettings {
  type: "funnel";
  /** `field` holds the event names; `steps` lists the ones the funnel follows. */
  entityField: string;
  timeField: string;
  /** Event values in funnel order. */
  steps: datum[];
  /** Later steps count only within this many days of the first. */
  windowDays?: number;
}

export const MIN_FUNNEL_STEPS = 2;
export const MAX_FUNNEL_STEPS = 8;

/** The chart's own selection: a value filter on its event field. */
export function funnelSelectionFilter(settings: FunnelSettings) {
  return settings.filters.find(
    (filter): filter is ValueFilter =>
      filter.type === "value" && filter.field === settings.field
  );
}

export const funnelDefinition: ChartDefinition<FunnelSettings> = {
  type: "funnel",
  name: "Funnel",
  description: "Follow entities through ordered steps of an event log",
  icon: FunnelIcon,
  component: Funnel,
  settingsPanel: FunnelSettingsPanel,
  createDefaultSettings: (layout, field) => ({
    ...DEFAULT_CHART_SETTINGS,
    id: crypto.randomUUID(),
    type: "funnel",
    title: "",
    field: field ?? "",
    entityField: "",
    timeField: "",
    steps: [],
    layout,
    filters: [],
  }),
  validateSettings: (settings) =>
    Boolean(settings.field && settings.entityField && settings.timeField) &&
    settings.steps.length >= MIN_FUNNEL_STEPS,
  getFilterFunction: (settings, fieldGetter) => {
    // A selected step keeps every event of the entities that reached it,
    // so linked views show their whole activity. The journeys are followed
    // once here over every row, not once per row.
    const selection = funnelSelectionFilter(settings);
    const others = settings.filters
      .filter((filter) => filter !== selection)
      .map((filter) => ({ filter, values: fieldGetter(filter.field) }));
    let entities: Set<string> | undefined;
    let entity: Record<number, datum> = {};
    if (selection && settings.entityField && settings.timeField) {
      entity = fieldGetter(settings.entityField);
      const event = fieldGetter(settings.field);
      entities = funnelSelection(
        {
          ids: Object.keys(event).map(Number),
          entity,
          event,
          time: fieldGetter(settings.timeField),
          steps: settings.steps,
          windowDays: settings.windowDays,
        },
        selection.values
      );
    }
    return (id) =>
      (!entities || entities.has(categoryKey(categoryValue(entity[id])))) &&
      others.every(({ filter, values }) => applyFilter(values[id], filter));
  },
};
