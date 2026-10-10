/**
 * Workspace themes. A theme is a named set of CSS custom properties applied
 * to the workspace root (`data-eda-theme`), so a host restyles one the same
 * way it restyles `--primary`. The values live in `index.css`; this module
 * only names the themes and reads the saved choice.
 */
export type WorkspaceThemeId = "compact" | "newsprint" | "report";

/** The theme a saved analysis chose. Absent means Compact. */
export interface WorkspaceTheme {
  id: WorkspaceThemeId;
}

export interface WorkspaceThemeOption {
  id: WorkspaceThemeId;
  name: string;
  /**
   * Where the chart title sits: on one line beside the header controls, or as
   * a headline block that wraps above the plot.
   */
  headline: "inline" | "block";
  /** One line on what the theme looks like, shown in its tooltip. */
  description: string;
}

export const DEFAULT_THEME_ID: WorkspaceThemeId = "compact";

export const WORKSPACE_THEMES: readonly WorkspaceThemeOption[] = [
  {
    id: "compact",
    name: "Compact",
    headline: "inline",
    description:
      "Dense working layout: one-line chart titles and small type, so the grid fits the most charts.",
  },
  {
    id: "newsprint",
    name: "Newsprint",
    headline: "block",
    description:
      "Newspaper graphics: a large serif headline, a subtitle and source note, hairline rules on warm paper.",
  },
  {
    id: "report",
    name: "Report",
    headline: "block",
    description:
      "Annual-report graphics: a clean sans headline, generous space, quiet rules, and one restrained accent.",
  },
];

export function isWorkspaceThemeId(value: unknown): value is WorkspaceThemeId {
  return WORKSPACE_THEMES.some((theme) => theme.id === value);
}

/** The theme to draw. A theme this version doesn't know draws as Compact. */
export function resolveThemeId(theme: WorkspaceTheme | undefined) {
  return isWorkspaceThemeId(theme?.id) ? theme.id : DEFAULT_THEME_ID;
}

/** A saved theme is an object with a string id; unknown ids still load. */
export function isSavedTheme(value: unknown): value is WorkspaceTheme {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    typeof (value as { id?: unknown }).id === "string"
  );
}

export function getWorkspaceTheme(theme: WorkspaceTheme | undefined) {
  const id = resolveThemeId(theme);
  return WORKSPACE_THEMES.find((option) => option.id === id)!;
}
