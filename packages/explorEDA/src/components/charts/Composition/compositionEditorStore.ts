import { create } from "zustand";

export type CompositionMode = "edit" | "view";

export interface CompositionSelection {
  elementId: string;
  /** One repeat of a chart unit, edited apart from its template. */
  instanceKey?: string;
}

/** A request to bring one part of the editor into view. */
export interface EditorReveal {
  markId?: string;
  scaleId?: string;
  /** Changes on every request, so the same target can be revealed again. */
  token: number;
}

interface EditorState {
  mode: CompositionMode;
  selection?: CompositionSelection;
  reveal?: EditorReveal;
  /** True while an inspector for the chart is mounted. */
  attached?: boolean;
}

const VIEWING: EditorState = { mode: "view" };

interface CompositionEditorStore {
  /** Editor state by chart ID. Temporary: it does not save with the chart. Closing an inspector returns to viewing but keeps the selection for the next one. */
  editors: Record<string, EditorState>;
  setMode: (chartId: string, mode: CompositionMode) => void;
  select: (
    chartId: string,
    selection: CompositionSelection | undefined
  ) => void;
  /** An inspector mounted: editing starts, and quick actions can rely on it. */
  attach: (chartId: string) => void;
  /** Scrolls the inspector to a mark or opens a scale, once it is showing. */
  reveal: (chartId: string, target: Omit<EditorReveal, "token">) => void;
  close: (chartId: string) => void;
}

let revealToken = 0;

export const useCompositionEditorStore = create<CompositionEditorStore>(
  (set) => ({
    editors: {},
    setMode: (chartId, mode) =>
      set((state) => ({
        editors: {
          ...state.editors,
          [chartId]: {
            ...(state.editors[chartId] ?? VIEWING),
            mode,
            // Viewing has no editing selection.
            ...(mode === "view" ? { selection: undefined } : {}),
          },
        },
      })),
    select: (chartId, selection) =>
      set((state) => ({
        editors: {
          ...state.editors,
          [chartId]: { ...(state.editors[chartId] ?? VIEWING), selection },
        },
      })),
    attach: (chartId) =>
      set((state) => ({
        editors: {
          ...state.editors,
          [chartId]: {
            ...(state.editors[chartId] ?? VIEWING),
            mode: "edit",
            attached: true,
          },
        },
      })),
    reveal: (chartId, target) =>
      set((state) => ({
        editors: {
          ...state.editors,
          [chartId]: {
            ...(state.editors[chartId] ?? VIEWING),
            reveal: { ...target, token: (revealToken += 1) },
          },
        },
      })),
    // Closing keeps the selection and any pending reveal: an inspector that
    // remounts, or one opened by a quick action, picks up where it was.
    close: (chartId) =>
      set((state) => {
        const current = state.editors[chartId];
        if (!current) return state;
        return {
          editors: {
            ...state.editors,
            [chartId]: { ...current, mode: "view", attached: false },
          },
        };
      }),
  })
);

export function useCompositionEditor(chartId: string): EditorState {
  return useCompositionEditorStore(
    (state) => state.editors[chartId] ?? VIEWING
  );
}
