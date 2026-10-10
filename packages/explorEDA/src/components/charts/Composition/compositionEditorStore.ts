import { create } from "zustand";

export type CompositionMode = "edit" | "view";

export interface CompositionSelection {
  elementId: string;
  /** One repeat of a chart unit, edited apart from its template. */
  instanceKey?: string;
}

interface EditorState {
  mode: CompositionMode;
  selection?: CompositionSelection;
}

const VIEWING: EditorState = { mode: "view" };

interface CompositionEditorStore {
  /** Editor state by chart ID. Temporary: it does not save with the chart. */
  editors: Record<string, EditorState>;
  setMode: (chartId: string, mode: CompositionMode) => void;
  select: (chartId: string, selection: CompositionSelection | undefined) => void;
  close: (chartId: string) => void;
}

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
    close: (chartId) =>
      set((state) => {
        const editors = { ...state.editors };
        delete editors[chartId];
        return { editors };
      }),
  })
);

export function useCompositionEditor(chartId: string): EditorState {
  return useCompositionEditorStore(
    (state) => state.editors[chartId] ?? VIEWING
  );
}
