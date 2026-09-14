import { getChartDefinition } from "@/charts/registry";
import {
  CrossfilterWrapper,
  LiveItem,
  LiveItemMap,
} from "@/hooks/CrossfilterWrapper";
import {
  CalculationDefinition,
  CalculationManager,
} from "@/lib/calculations/CalculationState";
import { ChartSettings, datum } from "@/types/ChartTypes";
import { ColorScaleType } from "@/types/ColorScaleTypes";
import {
  GridSettings,
  SavedChartSettings,
  SerializedColorScale,
  ViewMetadata,
} from "@/types/SavedDataTypes";
import { SavedDataStructure } from "@/types/SavedDataStructure";
import { saveProject } from "@/utils/localStorage";
import { createContext, useContext, useEffect, useRef } from "react";
import { createStore, useStore } from "zustand";
import * as THREE from "three";

type DatumObject = { [key: string]: datum };
export type { DatumObject };

function toRuntimeChart(chart: SavedChartSettings): ChartSettings {
  if (chart.type !== "3d-scatter") {
    return chart as ChartSettings;
  }

  return {
    ...chart,
    cameraPosition: new THREE.Vector3(
      chart.cameraPosition.x,
      chart.cameraPosition.y,
      chart.cameraPosition.z
    ),
    cameraTarget: new THREE.Vector3(
      chart.cameraTarget.x,
      chart.cameraTarget.y,
      chart.cameraTarget.z
    ),
  } as ChartSettings;
}

// Props and State interfaces
interface DataLayerProps<T extends DatumObject> {
  data?: T[];
  charts?: ChartSettings[];
  savedData?: SavedDataStructure;
}

// Add ID to the data type
export type IdType = number;
export type HasId = { __ID: IdType };

interface DataLayerState<T extends DatumObject> extends DataLayerProps<T> {
  data: (T & HasId)[];
  emptyColumn: Record<IdType, datum>;
  fileName: string | undefined;
  setData: (data: T[], fileName?: string) => void;

  liveItems: LiveItemMap;

  // Chart state
  charts: ChartSettings[];
  addChart: (chart: Omit<ChartSettings, "id">) => void;
  removeChart: (chart: ChartSettings) => void;
  removeAllCharts: () => void;
  updateChart: (id: string, settings: Partial<ChartSettings>) => void;

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

  // Project and View Management
  currentProject: SavedProject | null;
  setCurrentProject: (project: SavedProject) => void;
  saveCurrentView: (name: string) => void;
  loadView: (view: SavedView) => void;

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
  const dataWithIds = data.map((row, index) => ({
    ...row,
    __ID: index,
  }));
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
    emptyColumn: dataWithIds.reduce(
      (acc, row) => {
        acc[row.__ID] = undefined;
        return acc;
      },
      {} as Record<IdType, datum>
    ),
    crossfilterWrapper: newCrossFilter,
    charts: charts ?? [],
    colorScales: [],
    calculationManager: new CalculationManager<T>(dataWithIds),
    calculations: [],
  };
}

// Store creator
const getInitialStoreState = <T extends DatumObject>(
  initProps?: Partial<DataLayerProps<T>>
): Required<
  Pick<
    DataLayerState<T>,
    | "data"
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
    | "currentProject"
    | "fileName"
  >
> => {
  const {
    data: initData,
    crossfilterWrapper,
    calculationManager: ogCalculationManager,
  } = getDataAndCrossfilterWrapper(initProps?.data ?? []);

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
      emptyColumn: initData.reduce(
        (acc, row) => {
          acc[row.__ID as IdType] = undefined;
          return acc;
        },
        {} as Record<IdType, datum>
      ),
      crossfilterWrapper,
      calculationManager: ogCalculationManager,
      calculations: newCalculations,
      charts: savedData.charts.map(toRuntimeChart),
      colorScales: restoredColorScales,
      gridSettings: savedData.gridSettings,
      columnCache: {},
      calcColumnCache: {},
      nonce: 0,
      currentProject: null,
      fileName: undefined,
    };
  }

  // Return default state if no saved data
  return {
    data: initData,
    emptyColumn: initData.reduce(
      (acc, row) => {
        acc[row.__ID as IdType] = undefined;
        return acc;
      },
      {} as Record<IdType, datum>
    ),
    crossfilterWrapper,
    calculationManager: ogCalculationManager,
    calculations: [],
    charts: initProps?.charts ?? [],
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
    currentProject: null,
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
    setData: (rawData, fileName) => {
      // Get fresh crossfilter and data with IDs
      const {
        data: newData,
        crossfilterWrapper: newCrossfilter,
        calculationManager: newCalculationManager,
      } = getDataAndCrossfilterWrapper(rawData, get().getColumnData);

      if (!newData || !newCrossfilter || !newCalculationManager) {
        throw new Error("Failed to reset data layer");
      }

      // Create default summary chart
      const definition = getChartDefinition("summary");

      const summaryChart = definition.createDefaultSettings({
        x: 0,
        y: 0,
        w: 4,
        h: 6,
      });
      newCrossfilter.addChart(summaryChart);

      // Reset everything to initial state
      set({
        data: newData,
        fileName,
        crossfilterWrapper: newCrossfilter,
        calculationManager: newCalculationManager,
        calculations: [],
        charts: [summaryChart],
        colorScales: [],
        liveItems: newCrossfilter.getAllData(),
        columnCache: {},
        calcColumnCache: {},
        nonce: 0,
        currentProject: null,
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
        console.error("updateChart: chart not found", { id });
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
      const { data, calculations } = get();
      const baseColumns = Object.keys(data[0] || {}).filter(
        (field) => field !== "__ID"
      );

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

        // Otherwise, calculate the column data
        // TODO: Implement calculation in the manager for whole column
        // needs to account for dependencies
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

    setCurrentProject: (project: SavedProject) => {
      set({ currentProject: project });
      // Only save to storage if the project is marked as saved
      if (project.isSaved) {
        saveProject(project);
      }
    },

    saveCurrentView: (name: string) => {
      const { charts, currentProject, calculations } = get();

      if (!currentProject) {
        console.error("No project selected");
        return;
      }

      const newView: SavedView = {
        version: 1,
        name,
        charts: [...charts],
        calculations: [...calculations],
      };

      const updatedProject: SavedProject = {
        ...currentProject,
        views: [...currentProject.views, newView],
      };

      set({ currentProject: updatedProject });
      // Only save to storage if the project is marked as saved
      if (updatedProject.isSaved) {
        saveProject(updatedProject);
      }
    },

    loadView: (view: SavedView) => {
      const { crossfilterWrapper, calculationManager } = get();

      // Clear existing charts
      crossfilterWrapper.charts.forEach((_, chartId) => {
        crossfilterWrapper.removeChart({ id: chartId } as ChartSettings);
      });

      // Load new charts
      set({ charts: view.charts });

      // Initialize crossfilter for new charts
      view.charts.forEach((chart) => {
        crossfilterWrapper.addChart(chart);
      });

      // Clear existing calculations before loading the view.
      for (const calc of calculationManager.getCalculations()) {
        calculationManager.removeCalculation(calc.resultColumnName);
      }

      // Add new calculations
      const newCalculations: CalculationDefinition[] = [];
      for (const calc of view.calculations ?? []) {
        try {
          calculationManager.addCalculation(calc);
          newCalculations.push(calc);
        } catch (error) {
          console.error("Error adding calculation:", error);
        }
      }

      set({ calculations: newCalculations, calcColumnCache: {} });

      set({ liveItems: crossfilterWrapper.getAllData() });
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
        const newCalcColumnCache = { ...state.calcColumnCache };
        for (const columnName of affectedColumns) {
          newCalcColumnCache[columnName] = undefined;
        }
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
        const newCalcColumnCache = { ...state.calcColumnCache };
        for (const columnName of affectedColumns) {
          delete newCalcColumnCache[columnName];
        }
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
        name: state.currentProject?.name ?? "Untitled",
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
        charts: state.charts,
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
        } catch (error) {
          console.error("Error restoring calculation:", error);
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
export const DataLayerContext = createContext<DataLayerStore<any> | null>(null);

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

    if (dataChanged) {
      store.getState().setData(nextData ?? []);
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

    propsRef.current = { data: nextData, savedData: nextSavedData };
  }, [nextData, nextSavedData]);

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
  const store = useContext(DataLayerContext);
  if (!store) {
    throw new Error("Missing DataLayerContext.Provider in the tree");
  }
  return useStore(store, selector);
}

type SavedView = {
  version: 1;
  charts: ChartSettings[];
  name: string;
  calculations?: CalculationDefinition[];
};

type SavedProject = {
  version: 1;
  name: string;
  sourceDataPath: string;
  views: SavedView[];
  isSaved: boolean;
};

export type { SavedProject, SavedView };
