import { useDataLayer } from "@/providers/DataLayerProvider";
import {
  WORKSPACE_THEMES,
  isWorkspaceThemeId,
  resolveThemeId,
} from "@/lib/themes";
import { ActionTooltip } from "../ui/tooltip";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";

/**
 * Picks the workspace theme. Charts restyle as soon as a theme is chosen, and
 * the choice saves with the analysis.
 */
export function ThemeSettingsPanel() {
  const themeId = resolveThemeId(useDataLayer((state) => state.theme));
  const setTheme = useDataLayer((state) => state.setTheme);

  return (
    <div className="eda-theme-settings">
      <ToggleGroup
        type="single"
        value={themeId}
        onValueChange={(value) => {
          if (isWorkspaceThemeId(value)) setTheme(value);
        }}
        aria-label="Workspace theme"
        className="eda-theme-options"
      >
        {WORKSPACE_THEMES.map((theme) => (
          <ActionTooltip key={theme.id} content={theme.description}>
            <ToggleGroupItem
              value={theme.id}
              aria-label={theme.name}
              className="eda-theme-option"
            >
              <span
                className="eda-theme-swatch"
                data-eda-theme={theme.id}
                data-headline={theme.headline}
                aria-hidden="true"
              >
                <span className="eda-theme-swatch-title">Aa</span>
                <span className="eda-theme-swatch-rule" />
              </span>
              <span className="eda-theme-name">{theme.name}</span>
            </ToggleGroupItem>
          </ActionTooltip>
        ))}
      </ToggleGroup>
    </div>
  );
}
