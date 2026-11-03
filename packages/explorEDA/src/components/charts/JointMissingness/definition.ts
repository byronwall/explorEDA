import { Grid2x2Check as JointMissingnessIcon } from "lucide-react";
import { applyFilter } from "@/hooks/applyFilter";
import { getPopulationTest } from "@/lib/chartPopulation";
import type { BaseChartSettings, ChartDefinition } from "@/types/ChartTypes";
import type { MissingnessPatternFilter } from "@/types/FilterTypes";
import { DEFAULT_CHART_SETTINGS } from "@/utils/defaultSettings";
import { JointMissingness } from "./JointMissingness";
import { JointMissingnessSettingsPanel } from "./JointMissingnessSettingsPanel";
import { MIN_MISSINGNESS_FIELDS, patternMatcher } from "./jointMissingnessPlan";

export interface JointMissingnessSettings extends BaseChartSettings {
  type: "joint-missingness";
  /** Fields in column order. Order is display only. */
  fields: string[];
  /** Optional field whose groups each get a share column. */
  groupField?: string;
}

/** The chart's own selection: a union of exact missing patterns. */
export function patternSelection(settings: Pick<BaseChartSettings, "filters">) {
  return settings.filters.find(
    (filter): filter is MissingnessPatternFilter =>
      filter.type === "missingness-pattern"
  );
}

export const jointMissingnessDefinition: ChartDefinition<JointMissingnessSettings> =
  {
    type: "joint-missingness",
    name: "Joint missingness",
    description: "See which fields are missing together, row by row",
    icon: JointMissingnessIcon,
    component: JointMissingness,
    settingsPanel: JointMissingnessSettingsPanel,
    createDefaultSettings: (layout, field) => ({
      ...DEFAULT_CHART_SETTINGS,
      id: crypto.randomUUID(),
      type: "joint-missingness",
      title: "",
      field: "",
      fields: field ? [field] : [],
      layout,
      filters: [],
    }),
    validateSettings: (settings) =>
      settings.fields.length >= MIN_MISSINGNESS_FIELDS,
    getFilterFunction: (settings, fieldGetter) => {
      // Columns resolve once here; the row test only reads them.
      const selection = patternSelection(settings);
      const others = settings.filters
        .filter((filter) => filter !== selection)
        .map((filter) => ({ filter, values: fieldGetter(filter.field) }));
      let matches: ((id: number) => boolean) | undefined;
      if (selection) {
        const columns = Object.fromEntries(
          settings.fields.map((field) => [field, fieldGetter(field)])
        );
        const test = patternMatcher(
          settings.fields,
          columns,
          selection.patterns
        );
        // The selection describes this chart's own rows, so it carries the
        // chart's local population with it.
        const population = getPopulationTest(settings, fieldGetter);
        matches = population ? (id) => population(id) && test(id) : test;
      }
      return (id) =>
        (!matches || matches(id)) &&
        others.every(({ filter, values }) => applyFilter(values[id], filter));
    },
  };
