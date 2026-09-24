import { getChartFields } from "@/components/charts/chartAccessibility";
import { chartRegistry, getChartDefinition } from "@/charts/registry";
import {
  CrossfilterWrapper,
  LiveItem,
  LiveItemMap,
} from "@/hooks/CrossfilterWrapper";
import {
  CalculationDefinition,
  CalculationManager,
} from "@/lib/calculations/CalculationState";
import { parseExpression } from "@/lib/calculations/parser/semantics";
import { FieldProfile, buildFieldProfiles } from "@/lib/fieldProfiles";
import type { DataType } from "@/components/SummaryTable/utils/dataTypeDetection";
import {
  AggregateResult,
  AggregateSpec,
  calculateGroupedAggregate,
} from "@/lib/aggregates";
import {
  applyFieldSettings,
  buildConversionPreview,
  convertFieldValue,
  FieldSettings,
  FieldSettingsMap,
  formatFieldValue as formatValue,
  getFieldSettingsError,
  getFieldLabel as resolveFieldLabel,
} from "@/lib/fieldSettings";
import { ChartLayout, ChartSettings, datum } from "@/types/ChartTypes";
import { ColorScaleType } from "@/types/ColorScaleTypes";
import {
  GridSettings,
  SavedChartSettings,
  SavedRowsSettings,
  SerializedColorScale,
  ViewMetadata,
} from "@/types/SavedDataTypes";
import {
  SavedAnalysisStructure,
  SavedCalculation,
  SavedDataStructure,
  SavedRow,
} from "@/types/SavedDataStructure";
import { createContext, useContext, useEffect, useRef } from "react";
import { createStore, useStore } from "zustand";
import { IdType, initializeData } from "./lib/dataLayerState";

type DatumObject = { [key: string]: datum };
export type { DatumObject };
export type { IdType } from "./lib/dataLayerState";

function typeOverrides(settings: FieldSettingsMap): Record<string, DataType> {
  return Object.fromEntries(
    Object.entries(settings)
      .filter(([, value]) => value.type)
      .map(([field, value]) => [field, value.type as DataType])
  );
}

function validateFieldSettings(settings: FieldSettingsMap) {
  for (const [field, value] of Object.entries(settings)) {
    const error = getFieldSettingsError(value);
    if (error) {
      throw new Error(`Invalid settings for ${field}: ${error}`);
    }
  }
}

const toVector3 = ({ x, y, z }: { x: number; y: number; z: number }) => ({
  x,
  y,
  z,
  toArray: () => [x, y, z],
  clone: () => toVector3({ x, y, z }),
});

function toRuntimeChart(chart: SavedChartSettings): ChartSettings {
  if (chart.type !== "3d-scatter") {
    return chart as ChartSettings;
  }

  return {
    ...chart,
    cameraPosition: toVector3(chart.cameraPosition),
    cameraTarget: toVector3(chart.cameraTarget),
  } as ChartSettings;
}

function toSavedChart(chart: ChartSettings): SavedChartSettings {
  if (chart.type !== "3d-scatter") {
    return chart as SavedChartSettings;
  }

  return {
    ...chart,
    cameraPosition: {
      x: chart.cameraPosition.x,
      y: chart.cameraPosition.y,
      z: chart.cameraPosition.z,
    },
    cameraTarget: {
      x: chart.cameraTarget.x,
      y: chart.cameraTarget.y,
      z: chart.cameraTarget.z,
    },
  } as SavedChartSettings;
}

function toRuntimeCalculations(
  calculations: SavedCalculation[]
): CalculationDefinition[] {
  return calculations.map(({ resultColumnName, expression }) => ({
    resultColumnName,
    expression: parseExpression(expression),
  }));
}

function toSavedCalculations(
  calculations: CalculationDefinition[]
): SavedCalculation[] {
  return calculations.map(({ resultColumnName, expression }) => ({
    resultColumnName,
    expression: expression.rawInput,
  }));
}

function validateAggregateState(
  aggregates: AggregateSpec[],
  charts: SavedChartSettings[] | ChartSettings[],
  fieldNames?: Iterable<string>
) {
  const ids = new Set<string>();
  const availableFields = fieldNames ? new Set(fieldNames) : undefined;
  for (const aggregate of aggregates) {
    if (
      !aggregate.id ||
      !aggregate.name.trim() ||
      !aggregate.groupField.trim() ||
      !["count", "sum", "average"].includes(aggregate.aggregation) ||
      (aggregate.aggregation !== "count" && !aggregate.measureField?.trim())
    ) {
      throw new Error("Invalid grouped summary definition");
    }
    if (availableFields && !availableFields.has(aggregate.groupField)) {
      throw new Error(
        `Grouped summary ${aggregate.name} references missing group field ${aggregate.groupField}`
      );
    }
    if (
      availableFields &&
      aggregate.measureField &&
      !availableFields.has(aggregate.measureField)
    ) {
      throw new Error(
        `Grouped summary ${aggregate.name} references missing measure field ${aggregate.measureField}`
      );
    }
    if (ids.has(aggregate.id)) {
      throw new Error(`Duplicate grouped summary id: ${aggregate.id}`);
    }
    ids.add(aggregate.id);
  }
  for (const chart of charts) {
    const aggregateId = (chart as ChartSettings & { aggregateId?: unknown })
      .aggregateId;
    if (
      aggregateId !== undefined &&
      (typeof aggregateId !== "string" || !ids.has(aggregateId))
    ) {
      throw new Error(
        `Chart references missing grouped summary: ${String(aggregateId)}`
      );
    }
  }
}

function getDefaultRowsSettings(
  fields: string[],
  calculationNames: string[] = []
): SavedRowsSettings {
  const allFields = [
    ...fields,
    ...calculationNames.filter((field) => !fields.includes(field)),
  ];
  return {
    columns: allFields.map((field) => ({ id: field, field })),
    sortDirection: "asc",
    filters: [],
    globalSearch: "",
  };
}

function getSavedStateFingerprint(savedData: SavedDataStructure): string {
  return JSON.stringify(
    {
      ...savedData,
      metadata: {
        ...savedData.metadata,
        modifiedAt: "",
      },
    },
    (_key, value: unknown) => {
      if (value === undefined) {
        return { __exploreda_fingerprint: "undefined" };
      }
      if (typeof value === "number" && !Number.isFinite(value)) {
        return {
          __exploreda_fingerprint: Number.isNaN(value)
            ? "NaN"
            : value === Infinity
              ? "Infinity"
              : "-Infinity",
        };
      }
      return value;
    }
  );
}

// Props and State interfaces
interface DataLayerProps<T extends DatumObject> {
  data?: T[];
  charts?: ChartSettings[];
  savedData?: SavedDataStructure;
  onStateChange?: (state: SavedDataStructure) => void;
}

// Add ID to the data type
export type HasId = { __ID: IdType };

interface DataLayerState<T extends DatumObject> extends DataLayerProps<T> {
  rawData: T[];
  data: (T & HasId)[];
  fieldProfiles: FieldProfile[];
  emptyColumn: Record<IdType, datum>;
  fileName: string | undefined;
  setData: (data: T[], fileName?: string, useDefaults?: boolean) => void;
  fieldSettings: FieldSettingsMap;
  aggregates: AggregateSpec[];
  addAggregate: (spec: Omit<AggregateSpec, "id">) => AggregateSpec;
  updateAggregate: (
    id: string,
    updates: Partial<Omit<AggregateSpec, "id">>
  ) => void;
  removeAggregate: (id: string) => void;
  getAggregate: (id: string) => AggregateSpec | undefined;
  getAggregateResult: (
    id: string,
    sourceIds?: IdType[]
  ) => AggregateResult | undefined;
  updateFieldSettings: (
    field: string,
    settings: Partial<FieldSettings>
  ) => void;
  getFieldLabel: (field: string) => string;
  formatFieldValue: (field: string, value: datum) => string;
  getFieldConversionPreview: (
    field: string,
    settings?: FieldSettings
  ) => ReturnType<typeof buildConversionPreview>;

  liveItems: LiveItemMap;

  // Chart state
  charts: ChartSettings[];
  addChart: (chart: Omit<ChartSettings, "id">) => void;
  removeChart: (chart: ChartSettings) => void;
  removeAllCharts: () => void;
  updateChart: (id: string, settings: Partial<ChartSettings>) => void;
  updateChartLayouts: (layouts: Record<string, ChartLayout>) => void;

  // Color scale state
  colorScales: ColorScaleType[];
  addColorScale: (scale: Omit<ColorScaleType, "id">) => ColorScaleType;
  removeColorScale: (id: string) => void;
  updateColorScale: (id: string, updates: Partial<ColorScaleType>) => void;

  // Filter state (placeholder)
  clearAllFilters: () => void;
  filterReset: number;
  clearFilter: (chart: ChartSettings) => void;

  crossfilterWrapper: CrossfilterWrapper<T & HasId>;
  nonce: number;
  getLiveItems: (chart: ChartSettings) => LiveItem | undefined;

  // data and key functions
  getColumnData: (field: string | undefined) => Record<IdType, datum>;
  getColumnNames: () => string[];
  columnCache: Record<string, Record<IdType, datum>>;

  // Calculation state
  calculationManager: CalculationManager<T>;
  calculations: CalculationDefinition[];
  addCalculation: (
    calculation: Omit<CalculationDefinition, "id">
  ) => Promise<CalculationDefinition>;
  removeCalculation: (resultColumnName: string) => void;
  updateCalculation: (
    resultColumnName: string,
    newCalculation: CalculationDefinition
  ) => void;

  calcColumnCache: Record<string, Record<IdType, datum> | undefined>;

  // Grid settings
  gridSettings: GridSettings;
  updateGridSettings: (settings: Partial<GridSettings>) => void;
  rowsSettings: SavedRowsSettings;
  updateRowsSettings: (settings: Partial<SavedRowsSettings>) => void;
  metadata: ViewMetadata;

  // Save/Restore functionality
  saveToStructure: () => SavedDataStructure;
  restoreFromStructure: (savedData: SavedDataStructure) => void;
  saveAnalysisToStructure: () => SavedAnalysisStructure;
  restoreAnalysisFromStructure: (savedData: SavedAnalysisStructure) => void;
}

// Store type
type DataLayerStore<T extends DatumObject> = ReturnType<
  typeof createDataLayerStore<T>
>;

function getDataAndCrossfilterWrapper<T extends DatumObject>(
  data: T[],
  fieldGetter?: (name: string) => Record<IdType, datum>,
  charts?: ChartSettings[]
): Partial<DataLayerState<T>> {
  const { dataWithIds, emptyColumn } = initializeData(data);
  const newCrossFilter = new CrossfilterWrapper<T & HasId>(
    dataWithIds,
    (d) => d.__ID
  );

  if (fieldGetter) {
    newCrossFilter.setFieldGetter(fieldGetter);
  }

  if (charts) {
    charts.forEach((chart) => {
      newCrossFilter.addChart(chart);
    });
  }

  return {
    data: dataWithIds,
    emptyColumn,
    crossfilterWrapper: newCrossFilter,
    charts: charts ?? [],
    colorScales: [],
    calculationManager: new CalculationManager<T>(dataWithIds),
    calculations: [],
  };
}

function createDefaultWorkspaceCharts(
  fieldProfiles: FieldProfile[]
): ChartSettings[] {
  if (fieldProfiles.length === 0) {
    return [];
  }

  const summary = chartRegistry.has("summary")
    ? getChartDefinition("summary").createDefaultSettings({
        x: 0,
        y: 0,
        w: 5,
        h: 6,
      })
    : undefined;
  const table = chartRegistry.has("data-table")
    ? getChartDefinition("data-table").createDefaultSettings({
        x: 5,
        y: 0,
        w: 7,
        h: 6,
      })
    : undefined;
  if (table?.type === "data-table") {
    table.columns = fieldProfiles.map(({ name }) => ({
      id: name,
      field: name,
    }));
  }

  return [summary, table].filter((item): item is ChartSettings =>
    Boolean(item)
  );
}

// Store creator
const getInitialStoreState = <T extends DatumObject>(
  initProps?: Partial<DataLayerProps<T>>
): Required<
  Pick<
    DataLayerState<T>,
    | "rawData"
    | "data"
    | "fieldProfiles"
    | "emptyColumn"
    | "crossfilterWrapper"
    | "calculationManager"
    | "calculations"
    | "charts"
    | "colorScales"
    | "gridSettings"
    | "columnCache"
    | "calcColumnCache"
    | "nonce"
    | "fileName"
    | "rowsSettings"
    | "metadata"
    | "fieldSettings"
    | "aggregates"
  >
> => {
  const rawData = initProps?.data ?? [];
  const fieldSettings = initProps?.savedData?.fieldSettings ?? {};
  validateFieldSettings(fieldSettings);
  const inferredTypes = Object.fromEntries(
    buildFieldProfiles(rawData, typeOverrides(fieldSettings)).map((profile) => [
      profile.name,
      profile.dataType,
    ])
  );
  const runtimeData = applyFieldSettings(rawData, fieldSettings, inferredTypes);
  const {
    data: initData,
    emptyColumn: initialEmptyColumn,
    crossfilterWrapper,
    calculationManager: ogCalculationManager,
  } = getDataAndCrossfilterWrapper(runtimeData);
  const fieldProfiles = buildFieldProfiles(
    runtimeData,
    typeOverrides(fieldSettings)
  );

  if (!crossfilterWrapper || !initData || !ogCalculationManager) {
    throw new Error(
      "Data, crossfilterWrapper, or calculationManager not found"
    );
  }

  // Initialize with saved data if provided
  if (initProps?.savedData) {
    const savedData = initProps.savedData;

    // Restore calculations
    ogCalculationManager.setCalculations(
      toRuntimeCalculations(savedData.calculations)
    );
    const newCalculations = ogCalculationManager.getCalculations();
    validateAggregateState(savedData.aggregates ?? [], savedData.charts, [
      ...fieldProfiles.map((profile) => profile.name),
      ...newCalculations.map((calculation) => calculation.resultColumnName),
    ]);

    // Restore color scales with proper Map objects
    const restoredColorScales: ColorScaleType[] = savedData.colorScales.map(
      (scale) => {
        if (scale.type === "categorical") {
          return {
            ...scale,
            mapping: new Map(scale.mapping),
          };
        }
        return scale;
      }
    );

    return {
      rawData,
      data: initData,
      fieldProfiles,
      emptyColumn: initialEmptyColumn!,
      crossfilterWrapper,
      calculationManager: ogCalculationManager,
      calculations: newCalculations,
      charts: savedData.charts.map(toRuntimeChart),
      colorScales: restoredColorScales,
      gridSettings: savedData.gridSettings,
      rowsSettings:
        savedData.rowsSettings ??
        getDefaultRowsSettings(
          fieldProfiles.map((profile) => profile.name),
          newCalculations.map((calculation) => calculation.resultColumnName)
        ),
      metadata: savedData.metadata,
      columnCache: {},
      calcColumnCache: {},
      nonce: 0,
      fileName: undefined,
      fieldSettings,
      aggregates: savedData.aggregates ?? [],
    };
  }

  // Return default state if no saved data
  return {
    rawData,
    data: initData,
    fieldProfiles,
    emptyColumn: initialEmptyColumn!,
    crossfilterWrapper,
    calculationManager: ogCalculationManager,
    calculations: [],
    charts: initProps?.charts ?? createDefaultWorkspaceCharts(fieldProfiles),
    colorScales: [],
    gridSettings: {
      columnCount: 12,
      rowHeight: 100,
      containerPadding: 10,
      showBackgroundMarkers: true,
    },
    rowsSettings: getDefaultRowsSettings(
      fieldProfiles.map((profile) => profile.name)
    ),
    metadata: {
      name: "Untitled",
      version: 1,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    },
    columnCache: {},
    calcColumnCache: {},
    nonce: 0,
    fileName: undefined,
    fieldSettings,
    aggregates: [],
  };
};

const createDataLayerStore = <T extends DatumObject>(
  initProps?: Partial<DataLayerProps<T>>
) => {
  const initialState = getInitialStoreState(initProps);
  const { crossfilterWrapper } = initialState;

  if (!crossfilterWrapper) {
    throw new Error("crossfilterWrapper not found in initial state");
  }

  const store = createStore<DataLayerState<T>>()((set, get) => ({
    ...initialState,
    liveItems: {},
    filterReset: 0,
    setData: (rawData, fileName, useDefaults = true) => {
      const inferredTypes = Object.fromEntries(
        buildFieldProfiles(rawData, typeOverrides({})).map((profile) => [
          profile.name,
          profile.dataType,
        ])
      );
      const runtimeData = applyFieldSettings(rawData, {}, inferredTypes);
      // Get fresh crossfilter and data with IDs
      const {
        data: newData,
        emptyColumn: newEmptyColumn,
        crossfilterWrapper: newCrossfilter,
        calculationManager: newCalculationManager,
      } = getDataAndCrossfilterWrapper(runtimeData, get().getColumnData);
      const fieldProfiles = buildFieldProfiles(runtimeData, typeOverrides({}));

      if (
        !newData ||
        !newEmptyColumn ||
        !newCrossfilter ||
        !newCalculationManager
      ) {
        throw new Error("Failed to reset data layer");
      }

      const charts = useDefaults
        ? createDefaultWorkspaceCharts(fieldProfiles)
        : [];
      charts.forEach((chart) => newCrossfilter.addChart(chart));

      // Reset everything to initial state
      set({
        rawData,
        data: newData,
        fieldProfiles,
        emptyColumn: newEmptyColumn,
        fileName,
        crossfilterWrapper: newCrossfilter,
        calculationManager: newCalculationManager,
        calculations: [],
        charts,
        colorScales: [],
        rowsSettings: getDefaultRowsSettings(
          fieldProfiles.map((profile) => profile.name)
        ),
        liveItems: newCrossfilter.getAllData(),
        columnCache: {},
        calcColumnCache: {},
        fieldSettings: {},
        aggregates: [],
        nonce: get().nonce + 1,
        filterReset: get().filterReset + 1,
      });
    },

    updateFieldSettings: (field, updates) => {
      const current = get().fieldSettings[field] ?? {};
      const nextFieldSettings = { ...current, ...updates };
      const settingsError = getFieldSettingsError(nextFieldSettings);
      if (settingsError) {
        throw new Error(settingsError);
      }
      const nextFieldSettingsMap = { ...get().fieldSettings };
      if (Object.keys(nextFieldSettings).length === 0) {
        delete nextFieldSettingsMap[field];
      } else {
        nextFieldSettingsMap[field] = nextFieldSettings;
      }

      const typeChanged =
        current.type !== nextFieldSettings.type ||
        current.datePreset !== nextFieldSettings.datePreset ||
        JSON.stringify(current.nullTokens?.filter(Boolean) ?? []) !==
          JSON.stringify(nextFieldSettings.nullTokens?.filter(Boolean) ?? []);
      if (!typeChanged) {
        set((state) => ({
          fieldSettings: nextFieldSettingsMap,
          nonce: state.nonce + 1,
        }));
        return;
      }

      const inferredTypes = Object.fromEntries(
        buildFieldProfiles(
          get().rawData,
          typeOverrides(nextFieldSettingsMap)
        ).map((profile) => [profile.name, profile.dataType])
      );
      const runtimeRows = applyFieldSettings(
        get().rawData,
        nextFieldSettingsMap,
        inferredTypes
      );
      const nextData = initializeData(runtimeRows);
      const nextCrossfilter = new CrossfilterWrapper<T & HasId>(
        nextData.dataWithIds,
        (row) => row.__ID
      );
      const nextCharts = get().charts.map((chart) => ({
        ...chart,
        filters: chart.filters.filter((filter) => filter.field !== field),
        facet:
          typeChanged &&
          (chart.facet.rowVariable === field ||
            (chart.facet.type === "grid" &&
              chart.facet.columnVariable === field))
            ? { ...chart.facet, visibleFacetIds: undefined }
            : chart.facet,
      })) as ChartSettings[];
      nextCharts.forEach((chart) => nextCrossfilter.addChart(chart));
      const nextManager = new CalculationManager(
        nextData.dataWithIds,
        get().calculations
      );
      set((state) => ({
        fieldSettings: nextFieldSettingsMap,
        data: nextData.dataWithIds,
        emptyColumn: nextData.emptyColumn,
        fieldProfiles: buildFieldProfiles(
          runtimeRows,
          typeOverrides(nextFieldSettingsMap)
        ),
        crossfilterWrapper: nextCrossfilter,
        calculationManager: nextManager,
        charts: nextCharts,
        rowsSettings: {
          ...state.rowsSettings,
          filters: state.rowsSettings.filters.filter(
            (filter) => filter.field !== field
          ),
        },
        columnCache: {},
        calcColumnCache: {},
        liveItems: {},
        nonce: state.nonce + 1,
        filterReset: state.filterReset + 1,
      }));
      nextCrossfilter.setFieldGetter(get().getColumnData);
      nextCharts.forEach((chart) => nextCrossfilter.updateChartFilters(chart));
      set({ liveItems: nextCrossfilter.getAllData() });
    },

    getFieldLabel: (field) =>
      resolveFieldLabel(field, get().fieldSettings[field]),

    formatFieldValue: (field, value) =>
      formatValue(field, value, get().fieldSettings[field]),

    getFieldConversionPreview: (field, previewSettings) => {
      const rawRows = get().rawData;
      const rawProfile = buildFieldProfiles(rawRows).find(
        (profile) => profile.name === field
      );
      return buildConversionPreview(
        field,
        rawRows,
        previewSettings ?? get().fieldSettings[field],
        rawProfile?.dataType ?? "categorical"
      );
    },

    addAggregate: (spec) => {
      if (!spec.name.trim() || !spec.groupField.trim()) {
        throw new Error("Bar aggregates need a name and group field");
      }
      if (spec.aggregation !== "count" && !spec.measureField?.trim()) {
        throw new Error(`${spec.aggregation} requires a measure field`);
      }
      validateAggregateState(
        [{ ...spec, id: "new" }],
        [],
        get().getColumnNames()
      );
      const aggregate = { ...spec, id: crypto.randomUUID() };
      set((state) => ({
        aggregates: [...state.aggregates, aggregate],
        nonce: state.nonce + 1,
      }));
      return aggregate;
    },

    updateAggregate: (id, updates) => {
      const current = get().aggregates.find((aggregate) => aggregate.id === id);
      if (!current) {
        throw new Error("Grouped summary was not found");
      }
      const next = { ...current, ...updates };
      if (!next.name.trim() || !next.groupField.trim()) {
        throw new Error("Bar aggregates need a name and group field");
      }
      if (next.aggregation !== "count" && !next.measureField?.trim()) {
        throw new Error(`${next.aggregation} requires a measure field`);
      }
      validateAggregateState([next], [], get().getColumnNames());
      set((state) => ({
        aggregates: state.aggregates.map((aggregate) =>
          aggregate.id === id ? next : aggregate
        ),
        nonce: state.nonce + 1,
      }));
    },

    removeAggregate: (id) => {
      const aggregate = get().aggregates.find((item) => item.id === id);
      if (!aggregate) {
        return;
      }
      if (
        get().charts.some(
          (chart) =>
            (chart as ChartSettings & { aggregateId?: string }).aggregateId ===
            id
        )
      ) {
        throw new Error(
          `Remove charts using ${aggregate.name} before deleting the grouped summary`
        );
      }
      set((state) => ({
        aggregates: state.aggregates.filter((item) => item.id !== id),
        nonce: state.nonce + 1,
      }));
    },

    getAggregate: (id) => get().aggregates.find((item) => item.id === id),

    getAggregateResult: (id, sourceIds) => {
      const spec = get().aggregates.find((item) => item.id === id);
      if (!spec) {
        return undefined;
      }
      const ids = sourceIds ?? get().crossfilterWrapper.getFilteredRowIds();
      const groupData = get().getColumnData(spec.groupField);
      const measureData = spec.measureField
        ? get().getColumnData(spec.measureField)
        : undefined;
      const rawRows = get().rawData as Array<Record<string, datum>>;
      const rawInputs: Record<number, datum> = {};
      const exclusionReasons: Record<number, string> = {};
      const calculationField = get().calculations.some(
        (calculation) => calculation.resultColumnName === spec.measureField
      );
      const measureProfile = get().fieldProfiles.find(
        (profile) => profile.name === spec.measureField
      );
      const measureSettings = spec.measureField
        ? (get().fieldSettings[spec.measureField] ?? {})
        : {};
      const rows = ids.map((sourceId) => ({
        __ID: sourceId,
        [spec.groupField]: groupData[sourceId],
        ...(spec.measureField
          ? {
              [spec.measureField]: measureData?.[sourceId],
            }
          : {}),
      }));
      if (spec.measureField) {
        ids.forEach((sourceId) => {
          const rawValue = rawRows[sourceId]?.[spec.measureField!];
          if (!calculationField) {
            rawInputs[sourceId] = rawValue;
            const conversion = convertFieldValue(
              rawValue,
              measureSettings.type ?? measureProfile?.dataType ?? "categorical",
              measureSettings
            );
            if (conversion.error) {
              exclusionReasons[sourceId] =
                `Conversion failed: ${conversion.error}`;
            }
          }
        });
      }
      return calculateGroupedAggregate(rows, spec, rawInputs, exclusionReasons);
    },

    addChart: (chartSettings) => {
      const { crossfilterWrapper } = get();
      const newChart = {
        ...chartSettings,
        id: crypto.randomUUID(),
      } as ChartSettings;

      crossfilterWrapper.addChart(newChart);
      set((state) => ({
        charts: [...state.charts, newChart],
        liveItems: crossfilterWrapper.getAllData(),
      }));
    },

    removeChart: (chart) => {
      const { crossfilterWrapper } = get();
      crossfilterWrapper.removeChart(chart);
      set((state) => ({
        charts: state.charts.filter((ogChart) => ogChart.id !== chart.id),
        liveItems: crossfilterWrapper.getAllData(),
      }));
    },

    removeAllCharts: () => {
      const { crossfilterWrapper } = get();
      crossfilterWrapper.removeAllCharts();
      set({ charts: [], liveItems: crossfilterWrapper.getAllData() });
    },

    updateChart: (id, settings) => {
      const { crossfilterWrapper } = get();

      const chart = get().charts.find((chart) => chart.id === id);

      if (!chart) {
        return;
      }

      const updatedChart = { ...chart, ...settings, id } as ChartSettings;
      crossfilterWrapper.updateChart(updatedChart);
      set((state) => ({
        charts: state.charts.map((chart) =>
          chart.id === id ? updatedChart : chart
        ),
        liveItems: crossfilterWrapper.getAllData(),
      }));
    },

    updateChartLayouts: (layouts) => {
      set((state) => ({
        charts: state.charts.map((chart) => {
          const layout = layouts[chart.id];
          return layout ? { ...chart, layout } : chart;
        }),
      }));
    },

    addColorScale: (scale: Omit<ColorScaleType, "id">) => {
      const newScale = {
        ...scale,
        id: crypto.randomUUID(),
      } as ColorScaleType;

      set((state) => ({
        colorScales: [...state.colorScales, newScale],
      }));

      return newScale;
    },

    removeColorScale: (id: string) => {
      set((state) => ({
        colorScales: state.colorScales.filter((scale) => scale.id !== id),
      }));
    },

    updateColorScale: (id: string, updates: Partial<ColorScaleType>) => {
      set((state) => ({
        colorScales: state.colorScales.map((scale) =>
          scale.id === id ? ({ ...scale, ...updates } as ColorScaleType) : scale
        ),
      }));
    },

    clearAllFilters: () => {
      const { charts, crossfilterWrapper } = get();

      const newCharts = charts.map((chart) => ({
        ...chart,
        filters: [],
        ...(chart.type === "data-table" ? { globalSearch: "" } : {}),
      })) as ChartSettings[];

      for (const chart of newCharts) {
        crossfilterWrapper.updateChart(chart);
      }

      // Update all live items in a single update
      set((state) => ({
        charts: newCharts,
        rowsSettings: {
          ...state.rowsSettings,
          filters: [],
          globalSearch: "",
        },
        liveItems: crossfilterWrapper.getAllData(),
        filterReset: state.filterReset + 1,
      }));
    },

    clearFilter: (chart) => {
      const { updateChart } = get();
      updateChart(chart.id, { filters: [] });
    },

    getLiveItems: (chart) => {
      const { liveItems } = get();

      const liveItemsForChart = liveItems[chart.id] ?? undefined;

      return liveItemsForChart;
    },

    getColumnNames() {
      const { fieldProfiles, calculations } = get();
      const baseColumns = fieldProfiles.map((profile) => profile.name);

      const calcFields = calculations.map((calc) => calc.resultColumnName);

      return [...baseColumns, ...calcFields];
    },

    getColumnData(field: string | undefined) {
      const {
        columnCache,
        data,
        calcColumnCache,
        calculations,
        emptyColumn,
        calculationManager,
      } = get();

      if (!field) {
        return emptyColumn;
      }

      if (Object.hasOwn(columnCache, field)) {
        return columnCache[field] as Record<string, datum>;
      }

      const calculation = calculations.find(
        (calc) => calc.resultColumnName === field
      );

      if (calculation) {
        if (Object.hasOwn(calcColumnCache, field)) {
          return calcColumnCache[field] as Record<string, datum>;
        }

        // Calculate the column and its dependencies.
        const resultMap = calculationManager.executeCalculation(calculation);

        // convert to Record<IdType, datum>
        const columnData: { [key: IdType]: datum } = {};
        resultMap.forEach((value, key) => {
          columnData[key] = value;
        });

        // Caches are read through getters; nonce carries visible data changes.
        Object.defineProperty(calcColumnCache, field, {
          value: columnData,
          enumerable: true,
          configurable: true,
        });

        return columnData;
      }

      // check if field is in the data -- if not, return all undefined
      // do not add to column cache
      if (!data.some((row) => field in row)) {
        return emptyColumn;
      }

      // Otherwise, it's a regular column
      const columnData: { [key: IdType]: datum } = {};
      data.forEach((row) => {
        columnData[row.__ID] = row[field];
      });

      Object.defineProperty(columnCache, field, {
        value: columnData,
        enumerable: true,
        configurable: true,
      });

      return columnData;
    },

    // Calculation management
    addCalculation: async (calculation) => {
      get().calculationManager.addCalculation(calculation);
      refreshCalculations();
      return calculation;
    },

    removeCalculation: (name) => {
      assertUnusedCalculation(name);
      get().calculationManager.removeCalculation(name);
      refreshCalculations();
    },

    updateCalculation: (name, calculation) => {
      if (name !== calculation.resultColumnName) {
        assertUnusedCalculation(name);
      }
      get().calculationManager.updateCalculation(name, calculation);
      refreshCalculations();
    },

    updateGridSettings: (settings) => {
      set((state) => ({
        gridSettings: {
          ...state.gridSettings,
          ...settings,
        },
      }));
    },

    updateRowsSettings: (settings) => {
      set((state) => ({
        rowsSettings: { ...state.rowsSettings, ...settings },
      }));
    },

    // Save/Restore functionality
    saveToStructure: () => {
      const state = get();

      // Convert Map objects in colorScales to arrays for serialization
      const serializedColorScales: SerializedColorScale[] =
        state.colorScales.map((scale) => {
          if (scale.type === "categorical") {
            return {
              ...scale,
              mapping: Array.from(scale.mapping.entries()),
            };
          }
          return scale;
        });

      return {
        charts: state.charts.map(toSavedChart),
        calculations: toSavedCalculations(state.calculations),
        gridSettings: state.gridSettings,
        metadata: {
          ...state.metadata,
          modifiedAt: new Date().toISOString(),
        },
        colorScales: serializedColorScales,
        rowsSettings: state.rowsSettings,
        fieldSettings: state.fieldSettings,
        aggregates: state.aggregates,
      };
    },

    restoreFromStructure: (savedData: SavedDataStructure) => {
      const data = get().rawData;
      get().restoreAnalysisFromStructure({
        format: "exploreda-analysis",
        version: 1,
        data,
        settings: savedData,
      });
    },
    saveAnalysisToStructure: () => {
      const state = get();
      return {
        format: "exploreda-analysis",
        version: 1,
        data: state.rawData as SavedRow[],
        settings: state.saveToStructure(),
      };
    },
    restoreAnalysisFromStructure: (savedData) => {
      const rawData = savedData.data as T[];
      const fieldSettings = savedData.settings.fieldSettings ?? {};
      validateFieldSettings(fieldSettings);
      const inferredTypes = Object.fromEntries(
        buildFieldProfiles(rawData, typeOverrides(fieldSettings)).map(
          (profile) => [profile.name, profile.dataType]
        )
      );
      const runtimeData = applyFieldSettings(
        rawData,
        fieldSettings,
        inferredTypes
      );
      const next = getDataAndCrossfilterWrapper(runtimeData);
      const nextData = next.data;
      const nextCrossfilter = next.crossfilterWrapper;
      const nextEmptyColumn = next.emptyColumn;
      if (
        !nextData ||
        !nextCrossfilter ||
        !nextEmptyColumn ||
        !next.calculationManager
      ) {
        throw new Error("Failed to restore analysis rows");
      }
      const calculations = toRuntimeCalculations(
        savedData.settings.calculations
      );
      const calculationManager = new CalculationManager(nextData, calculations);
      const fieldProfiles = buildFieldProfiles(
        runtimeData,
        typeOverrides(fieldSettings)
      );
      validateAggregateState(
        savedData.settings.aggregates ?? [],
        savedData.settings.charts,
        [
          ...fieldProfiles.map((profile) => profile.name),
          ...calculations.map((calculation) => calculation.resultColumnName),
        ]
      );
      const charts = savedData.settings.charts.map(toRuntimeChart);
      const fieldGetter = (field: string): Record<IdType, datum> => {
        const calculation = calculations.find(
          (item) => item.resultColumnName === field
        );
        if (calculation) {
          const values: Record<IdType, datum> = {};
          calculationManager
            .executeCalculation(calculation)
            .forEach((value, id) => (values[id] = value));
          return values;
        }
        if (!nextData.some((row) => field in row)) {
          return nextEmptyColumn;
        }
        return Object.fromEntries(
          nextData.map((row) => [row.__ID, row[field]])
        ) as Record<IdType, datum>;
      };
      nextCrossfilter.setFieldGetter(fieldGetter);
      charts.forEach((chart) => nextCrossfilter.addChart(chart));
      const colorScales: ColorScaleType[] = savedData.settings.colorScales.map(
        (scale) =>
          scale.type === "categorical"
            ? { ...scale, mapping: new Map(scale.mapping) }
            : scale
      );
      set((state) => ({
        rawData,
        data: nextData,
        fieldProfiles,
        emptyColumn: nextEmptyColumn,
        fileName: undefined,
        crossfilterWrapper: nextCrossfilter,
        calculationManager,
        calculations: calculationManager.getCalculations(),
        charts,
        colorScales,
        gridSettings: savedData.settings.gridSettings,
        rowsSettings:
          savedData.settings.rowsSettings ??
          getDefaultRowsSettings(
            fieldProfiles.map((profile) => profile.name),
            calculations.map((calculation) => calculation.resultColumnName)
          ),
        metadata: savedData.settings.metadata,
        liveItems: nextCrossfilter.getAllData(),
        columnCache: {},
        calcColumnCache: {},
        nonce: state.nonce + 1,
        filterReset: state.filterReset + 1,
        fieldSettings,
        aggregates: savedData.settings.aggregates ?? [],
      }));
      nextCrossfilter.setFieldGetter(get().getColumnData);
    },
  }));

  function assertUnusedCalculation(name: string) {
    const { charts, aggregates } = store.getState();
    if (
      aggregates.some(
        (aggregate) =>
          aggregate.groupField === name || aggregate.measureField === name
      )
    ) {
      throw new Error(
        `Remove ${name} from its grouped summaries before renaming or deleting it`
      );
    }
    if (
      charts.some(
        (chart) =>
          getChartFields(chart).includes(name) ||
          chart.filters.some((filter) => filter.field === name) ||
          chart.facet.rowVariable === name ||
          (chart.facet.type === "grid" && chart.facet.columnVariable === name)
      )
    ) {
      throw new Error(
        `Remove ${name} from its charts and colors before renaming or deleting it`
      );
    }
  }

  function refreshCalculations() {
    const { calculationManager, crossfilterWrapper, charts } = store.getState();
    const previousCalculations = store.getState().calculations;
    const calculations = calculationManager.getCalculations();
    const previousNames = new Set(
      previousCalculations.map((calculation) => calculation.resultColumnName)
    );
    const nextNames = new Set(
      calculations.map((calculation) => calculation.resultColumnName)
    );
    const addedNames = calculations
      .map((calculation) => calculation.resultColumnName)
      .filter((name) => !previousNames.has(name));
    store.setState((state) => ({
      calculations,
      calcColumnCache: {},
      rowsSettings: {
        ...state.rowsSettings,
        columns: [
          ...state.rowsSettings.columns.filter(
            (column) =>
              !previousNames.has(column.field) || nextNames.has(column.field)
          ),
          ...addedNames
            .filter(
              (name) =>
                !state.rowsSettings.columns.some(
                  (column) => column.field === name
                )
            )
            .map((name) => ({ id: name, field: name })),
        ],
      },
    }));
    charts.forEach((chart) => crossfilterWrapper.updateChartFilters(chart));
    store.setState((state) => ({
      liveItems: crossfilterWrapper.getAllData(),
      nonce: state.nonce + 1,
    }));
  }

  // this stuff is done down here because we need the store methods to exist
  // before plumbing them into the crossfilter wrapper
  // not ideal... but it works.

  // this madness passes the column getter back into the crossfilter wrapper
  // this ensures that crossfilter has access to calculated fields
  crossfilterWrapper.setFieldGetter(store.getState().getColumnData);

  // add the initial charts to crossfilter
  store.getState().charts.forEach((chart) => {
    crossfilterWrapper.addChart(chart);
  });

  // set the live items
  store.setState({ liveItems: crossfilterWrapper.getAllData() });

  return store;
};

// Create context
export const DataLayerContext = createContext<unknown>(null);

// Provider wrapper
type DataLayerProviderProps<T extends DatumObject> = React.PropsWithChildren<
  DataLayerProps<T>
>;

export function DataLayerProvider<T extends DatumObject>({
  children,
  ...props
}: DataLayerProviderProps<T>) {
  const storeRef = useRef<DataLayerStore<T> | null>(null);
  const propsRef = useRef(props);
  const onStateChangeRef = useRef(props.onStateChange);
  const suppressStateChangeRef = useRef(false);
  const savedStateFingerprintRef = useRef<string | undefined>(undefined);
  onStateChangeRef.current = props.onStateChange;
  const nextData = props.data;
  const nextSavedData = props.savedData;
  if (!storeRef.current) {
    storeRef.current = createDataLayerStore<T>(props);
  }

  useEffect(() => {
    const store = storeRef.current!;
    const previousProps = propsRef.current;
    const dataChanged = previousProps.data !== nextData;
    const savedDataChanged = previousProps.savedData !== nextSavedData;

    suppressStateChangeRef.current = true;
    try {
      if (dataChanged) {
        store.getState().setData(nextData ?? [], undefined, !nextSavedData);
        if (nextSavedData) {
          store.getState().restoreFromStructure(nextSavedData);
        }
      } else if (savedDataChanged) {
        if (nextSavedData) {
          store.getState().restoreFromStructure(nextSavedData);
        } else {
          store.getState().setData(store.getState().rawData);
        }
      }
    } finally {
      suppressStateChangeRef.current = false;
      savedStateFingerprintRef.current = getSavedStateFingerprint(
        store.getState().saveToStructure()
      );
    }

    propsRef.current = { data: nextData, savedData: nextSavedData };
  }, [nextData, nextSavedData]);

  useEffect(() => {
    const store = storeRef.current!;
    savedStateFingerprintRef.current = getSavedStateFingerprint(
      store.getState().saveToStructure()
    );

    return store.subscribe((state) => {
      const savedData = state.saveToStructure();
      const nextFingerprint = getSavedStateFingerprint(savedData);

      if (nextFingerprint === savedStateFingerprintRef.current) {
        return;
      }

      savedStateFingerprintRef.current = nextFingerprint;
      if (!suppressStateChangeRef.current) {
        onStateChangeRef.current?.(savedData);
      }
    });
  }, []);

  return (
    <DataLayerContext.Provider value={storeRef.current}>
      {children}
    </DataLayerContext.Provider>
  );
}

// Custom hook that mimics the hook returned by `create`
export function useDataLayer<T extends DatumObject, U>(
  selector: (state: DataLayerState<T>) => U
): U {
  const store = useContext(DataLayerContext) as DataLayerStore<T> | null;
  if (!store) {
    throw new Error("Missing DataLayerContext.Provider in the tree");
  }
  return useStore(store, selector);
}
