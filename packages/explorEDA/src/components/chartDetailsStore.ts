import { createContext } from "react";
import { create } from "zustand";

interface ChartDetailsStore {
  /** The chart whose panel should open its details view next. */
  requested?: string;
  /** Asks a chart's panel to open its details view. */
  open: (chartId: string) => void;
  /** Called by the panel once it has opened. */
  clear: () => void;
}

/**
 * Lets a chart body or the workspace open a chart's details view, which the
 * chart's panel owns. A blank composition uses it for its editor button, and
 * a new composition opens its editor this way.
 */
export const useChartDetailsStore = create<ChartDetailsStore>((set) => ({
  requested: undefined,
  open: (chartId) => set({ requested: chartId }),
  clear: () => set({ requested: undefined }),
}));

/**
 * True inside a grid chart's settings popover. Settings shown there can offer
 * to move to the details view; the details view and draft previews cannot.
 */
export const SettingsPopoverContext = createContext(false);
