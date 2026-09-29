import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ChartLayout, ChartSettings, ChartType } from "@/types/ChartTypes";
import { useCreateCharts } from "@/hooks/useCreateCharts";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { AddChartDialog } from "./AddChartDialog";
import { overlapsAny } from "./chartPlacement";

type DraftSettings = Omit<ChartSettings, "id">;

export interface ChartDraftState {
  settings: DraftSettings;
  /** A spot chosen before the dialog opened, such as the grid's plus. */
  target?: ChartLayout;
  phase: "editing" | "placing";
}

interface ChartDraftApi {
  draft: ChartDraftState | null;
  /** Opens the add chart dialog with a blank chart of this type. */
  openDraft: (type?: ChartType, target?: ChartLayout) => void;
  updateDraft: (settings: DraftSettings) => void;
  /** Leaves the dialog for the grid so the user can choose a spot. */
  startPlacing: () => void;
  /** Returns from placement to the dialog with the draft intact. */
  backToEditing: () => void;
  /** Adds the draft to the grid at this layout. */
  place: (layout: ChartLayout) => void;
  cancel: () => void;
  /** Narrow grids stack charts, so they skip placement. */
  setSkipPlacement: (skip: boolean) => void;
}

const ChartDraftContext = createContext<ChartDraftApi | null>(null);

export function useChartDraft() {
  return useContext(ChartDraftContext);
}

const DEFAULT_TYPE: ChartType = "bar";

export function ChartDraftProvider({ children }: { children: ReactNode }) {
  const { buildChart } = useCreateCharts();
  const addChart = useDataLayer((state) => state.addChart);
  const charts = useDataLayer((state) => state.charts);
  const [draft, setDraft] = useState<ChartDraftState | null>(null);
  const [skipPlacement, setSkipPlacement] = useState(false);

  const openDraft = useCallback(
    (type: ChartType = DEFAULT_TYPE, target?: ChartLayout) => {
      setDraft({
        settings: buildChart(type, "", target),
        target,
        phase: "editing",
      });
    },
    [buildChart]
  );

  const place = useCallback(
    (layout: ChartLayout) => {
      if (draft) addChart({ ...draft.settings, layout } as DraftSettings);
      setDraft(null);
    },
    [addChart, draft]
  );

  const startPlacing = useCallback(() => {
    if (!draft) return;
    const { settings, target } = draft;
    const occupied = charts.map((chart) => chart.layout);
    // A spot picked from the grid is used as is while it stays free.
    if (target && !overlapsAny(target, occupied)) {
      place(target);
      return;
    }
    if (skipPlacement) {
      place({
        ...settings.layout,
        x: 0,
        y: Math.max(0, ...occupied.map((layout) => layout.y + layout.h)),
      });
      return;
    }
    setDraft({ ...draft, phase: "placing" });
  }, [charts, draft, place, skipPlacement]);

  const api = useMemo<ChartDraftApi>(
    () => ({
      draft,
      openDraft,
      updateDraft: (settings) =>
        setDraft((current) => (current ? { ...current, settings } : current)),
      startPlacing,
      backToEditing: () =>
        setDraft((current) =>
          current ? { ...current, phase: "editing" } : current
        ),
      place,
      cancel: () => setDraft(null),
      setSkipPlacement,
    }),
    [draft, openDraft, place, startPlacing]
  );

  return (
    <ChartDraftContext.Provider value={api}>
      {children}
      {draft?.phase === "editing" && <AddChartDialog />}
    </ChartDraftContext.Provider>
  );
}
