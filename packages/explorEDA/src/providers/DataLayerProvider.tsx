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
import { FieldProfile, buildFieldProfiles } from "@/lib/fieldProfiles";
import { DataTableSettings } from "@/components/charts/DataTable/definition";
import { ChartLayout, ChartSettings, datum } from "@/types/ChartTypes";
import { ColorScaleType } from "@/types/ColorScaleTypes";
import {
  GridSettings,
  SavedChartSettings,
  SerializedColorScale,
  ViewMetadata,
} from "@/types/SavedDataTypes";
import { SavedDataStructure } from "@/types/SavedDataStructure";
import { createContext, useContext, useEffect, useRef } from "react";
import { createStore, useStore } from "zustand";
import {
  IdType,
  initializeData,
  invalidateCalculationCache,
} from "./lib/dataLayerState";

type DatumObject = { [key: string]: datum };
export type { DatumObject };
export type { IdType } from "./lib/dataLayerState";

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

function getSavedStateFingerprint(savedData: SavedDataStructure): string {
  return JSON.stringify({
    charts: savedData.charts,
    calculations: savedData.calculations,
    gridSettings: savedData.gridSettings,
    colorScales: savedData.colorScales,
  });
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
  data: (T & HasId)[];
  fieldProfiles: FieldProfile[];
  emptyColumn: Record<IdType, datum>;
  fileName: string | undefined;
  setData: (data: T[], fileName?: string, useDefaults?: boolean) => void;

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

  // Save/Restore functionality
  saveToStructure: () => SavedDataStructure;
  restoreFromStructure: (savedData: SavedDataStructure) => void;
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
  if (
    fieldProfiles.length === 0 ||
    !chartRegistry.has("summary") ||
    !chartRegistry.has("data-table")
  ) {
    return [];
  }

  const summary = getChartDefinition("summary").createDefaultSettings({
    x: 0,
    y: 0,
    w: 4,
    h: 6,
  });
  const table = getChartDefinition("data-table").createDefaultSettings({
    x: 4,
    y: 0,
    w: 8,
    h: 6,
  }) as DataTableSettings;
  table.columns = fieldProfiles.map(({ name }) => ({ id: name, field: name }));

  return [summary, table];
}

// Store creator
const getInitialStoreState = <T extends DatumObject>(
  initProps?: Partial<DataLayerProps<T>>
): Required<
  Pick<
    DataLayerState<T>,
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
  >
> => {
  const {
    data: initData,
    emptyColumn: initialEmptyColumn,
    crossfilterWrapper,
    calculationManager: ogCalculationManager,
  } = getDataAndCrossfilterWrapper(initProps?.data ?? []);
  const fieldProfiles = buildFieldProfiles(initProps?.data ?? []);

  if (!crossfilterWrapper || !initData || !ogCalculationManager) {
    throw new Error(
      "Data, crossfilterWrapper, or calculationManager not found"
    );
  }

  // Initialize with saved data if provided
  if (initProps?.savedData) {
    const savedData = initProps.savedData;

    // Restore calculations
    const newCalculations: CalculationDefinition[] = [];
    savedData.calculations.forEach((calc) => {
      ogCalculationManager.addCalculation(calc);
      newCalculations.push(calc);
    });

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
      data: initData,
      fieldProfiles,
      emptyColumn: initialEmptyColumn!,
      crossfilterWrapper,
      calculationManager: ogCalculationManager,
      calculations: newCalculations,
      charts: savedData.charts.map(toRuntimeChart),
      colorScales: restoredColorScales,
      gridSettings: savedData.gridSettings,
      columnCache: {},
      calcColumnCache: {},
      nonce: 0,
      fileName: undefined,
    };
  }

  // Return default state if no saved data
  return {
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
    columnCache: {},
    calcColumnCache: {},
    nonce: 0,
    fileName: undefined,
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
    setData: (rawData, fileName, useDefaults = true) => {
      // Get fresh crossfilter and data with IDs
      const {
        data: newData,
        emptyColumn: newEmptyColumn,
        crossfilterWrapper: newCrossfilter,
        calculationManager: newCalculationManager,
      } = getDataAndCrossfilterWrapper(rawData, get().getColumnData);
      const fieldProfiles = buildFieldProfiles(rawData);

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
        data: newData,
        fieldProfiles,
        emptyColumn: newEmptyColumn,
        fileName,
        crossfilterWrapper: newCrossfilter,
        calculationManager: newCalculationManager,
        calculations: [],
        charts,
        colorScales: [],
        liveItems: newCrossfilter.getAllData(),
        columnCache: {},
        calcColumnCache: {},
        nonce: 0,
      });
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
      }));
    },

    removeAllCharts: () => {
      const { crossfilterWrapper } = get();
      crossfilterWrapper.removeAllCharts();
      set({ charts: [] });
    },

    updateChart: (id, settings) => {
      const { crossfilterWrapper } = get();

      const chart = get().charts.find((chart) => chart.id === id);

      if (!chart) {
        return;
      }

      let updatedChart: ChartSettings;

      if (id !== settings.id && settings.id) {
        // goal here is to catch obvious problem where id has changed

        // remove the old chart, add the new one
        crossfilterWrapper.removeChart(chart);
        crossfilterWrapper.addChart(settings as ChartSettings);

        updatedChart = settings as ChartSettings;
      } else {
        updatedChart = {
          ...chart,
          ...settings,
        } as ChartSettings;

        crossfilterWrapper.updateChart(updatedChart);
      }
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
      })) as ChartSettings[];

      for (const chart of newCharts) {
        crossfilterWrapper.updateChart(chart);
      }

      // Update all live items in a single update
      set({
        charts: newCharts,
        liveItems: crossfilterWrapper.getAllData(),
      });
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

      if (columnCache[field]) {
        return columnCache[field] as Record<string, datum>;
      }

      const calculation = calculations.find(
        (calc) => calc.resultColumnName === field
      );

      if (calculation) {
        if (calcColumnCache[field]) {
          return calcColumnCache[field] as Record<string, datum>;
        }

        // Calculate the column and its dependencies.
        const resultMap = calculationManager.executeCalculation(calculation);

        // convert to Record<IdType, datum>
        const columnData: { [key: IdType]: datum } = {};
        resultMap.forEach((value, key) => {
          columnData[key] = value;
        });

        // update the column cache
        // doing the RAF since this is called in the render loop
        requestAnimationFrame(() => {
          set((state) => {
            const newCalcColumnCache = { ...state.calcColumnCache };
            newCalcColumnCache[field] = columnData;
            return { calcColumnCache: newCalcColumnCache };
          });
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

      // doing the RAF since this is called in the render loop
      requestAnimationFrame(() => {
        set((state) => {
          const newColumnCache = { ...state.columnCache };
          newColumnCache[field] = columnData;
          return { columnCache: newColumnCache };
        });
      });

      return columnData;
    },

    // Calculation management
    addCalculation: async (calculation) => {
      const { calculationManager } = get();

      if (!calculationManager) {
        throw new Error("Calculation manager not initialized");
      }

      const affectedColumns = calculationManager.addCalculation(calculation);

      set((state) => {
        const newCalculations = [...state.calculations, calculation];
        const newCalcColumnCache = invalidateCalculationCache(
          state.calcColumnCache,
          affectedColumns
        );
        return {
          calculations: newCalculations,
          calcColumnCache: newCalcColumnCache,
          nonce: state.nonce + 1,
        };
      });

      return calculation;
    },

    removeCalculation: (resultColumnName) => {
      const { calculationManager } = get();
      if (!calculationManager) {
        throw new Error("Calculation manager not initialized");
      }

      const affectedColumns =
        calculationManager.removeCalculation(resultColumnName);

      set((state) => {
        const newCalcColumnCache = invalidateCalculationCache(
          state.calcColumnCache,
          affectedColumns
        );
        return {
          calculations: state.calculations.filter(
            (calc) => calc.resultColumnName !== resultColumnName
          ),
          calcColumnCache: newCalcColumnCache,
          nonce: state.nonce + 1,
        };
      });
    },

    updateCalculation: (resultColumnName, newCalculation) => {
      const { addCalculation, removeCalculation } = get();

      removeCalculation(resultColumnName);
      addCalculation(newCalculation);
    },

    updateGridSettings: (settings) => {
      set((state) => ({
        gridSettings: {
          ...state.gridSettings,
          ...settings,
        },
      }));
    },

    // Save/Restore functionality
    saveToStructure: () => {
      const state = get();
      const metadata: ViewMetadata = {
        name: "Untitled",
        version: 1,
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
      };

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
        calculations: state.calculations,
        gridSettings: state.gridSettings,
        metadata,
        colorScales: serializedColorScales,
      };
    },

    restoreFromStructure: (savedData: SavedDataStructure) => {
      const { crossfilterWrapper, calculationManager } = get();

      // Clear existing charts
      crossfilterWrapper.removeAllCharts();

      const charts = savedData.charts.map(toRuntimeChart);
      charts.forEach((chart) => {
        crossfilterWrapper.addChart(chart);
      });

      // Restore calculations
      for (const calc of calculationManager.getCalculations()) {
        calculationManager.removeCalculation(calc.resultColumnName);
      }

      const newCalculations: CalculationDefinition[] = [];
      for (const calc of savedData.calculations) {
        try {
          calculationManager.addCalculation(calc);
          newCalculations.push(calc);
        } catch {
          continue;
        }
      }

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

      set((state) => ({
        gridSettings: savedData.gridSettings,
        charts,
        calculations: newCalculations,
        colorScales: restoredColorScales,
        columnCache: {},
        calcColumnCache: {},
        liveItems: crossfilterWrapper.getAllData(),
        nonce: state.nonce + 1,
      }));
    },
  }));

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
          store.getState().setData(store.getState().data);
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
