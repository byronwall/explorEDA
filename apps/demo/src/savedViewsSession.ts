import { parseSavedAnalysis, type SavedDataStructure } from "exploreda";
import type { DatumObject } from "./LandingPage";

const STORAGE_KEY = "exploreda.saved-views.v1";
const HISTORY_LIMIT = 50;

type SavedView = {
  id: string;
  name: string;
  settings?: SavedDataStructure;
};

type ChangeLabel = "View" | "Filter" | "Both" | "Shared";
type HistoryEntry = {
  at: string;
  label: ChangeLabel;
  tabs: SavedView[];
};

export type SavedViewsSession = {
  version: 1;
  sourceAnalysis: string;
  tabs: SavedView[];
  activeTabId: string;
  history: HistoryEntry[];
  path: number[];
  cursor: number;
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function getSavedViewsRows(session: SavedViewsSession): DatumObject[] {
  return parseSavedAnalysis(session.sourceAnalysis).data as DatumObject[];
}

export function readSavedViewsSession(): SavedViewsSession | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    const value = JSON.parse(raw) as SavedViewsSession;
    if (
      value.version !== 1 ||
      typeof value.sourceAnalysis !== "string" ||
      !Array.isArray(value.tabs) ||
      value.tabs.length === 0 ||
      !value.tabs.every(
        (tab) => typeof tab.id === "string" && typeof tab.name === "string"
      ) ||
      !value.tabs.some((tab) => tab.id === value.activeTabId)
    )
      return undefined;
    parseSavedAnalysis(value.sourceAnalysis);
    if (!Array.isArray(value.history) || !Array.isArray(value.path)) {
      const initial = clone(value.tabs);
      value.history = [
        { at: new Date().toISOString(), label: "View", tabs: initial },
      ];
      value.path = [0];
      value.cursor = 0;
    }
    if (
      value.history.length === 0 ||
      value.history.length > HISTORY_LIMIT ||
      value.cursor < 0 ||
      value.cursor >= value.path.length ||
      !value.path.every(
        (index) =>
          Number.isInteger(index) && index >= 0 && index < value.history.length
      )
    )
      return undefined;
    return value;
  } catch {
    return undefined;
  }
}
