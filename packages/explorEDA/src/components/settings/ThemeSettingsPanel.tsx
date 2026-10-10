import { useRef } from "react";
import { RotateCcw } from "lucide-react";
import { useDataLayer } from "@/providers/DataLayerProvider";
import {
  WORKSPACE_THEMES,
  isWorkspaceThemeId,
  resolveThemeId,
} from "@/lib/themes";
import {
  listStyleOverrides,
  resetChartStyle,
  type StyleOverride,
} from "@/lib/styleOverrides";
import { getChartTitle } from "../charts/chartAccessibility";
import { useThemeTypography } from "../charts/chartTypography";
import { focusChartInContainer } from "../chartFocus";
import { Button } from "../ui/button";
import { ActionTooltip } from "../ui/tooltip";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";

function formatValue(override: Pick<StyleOverride, "unit">, value: number) {
  return override.unit === "px" ? `${value} px` : String(value);
}

/**
 * Picks the workspace theme, and lists the charts that deliberately differ
 * from it. Charts restyle as soon as a theme is chosen, and the choice saves
 * with the analysis.
 */
export function ThemeSettingsPanel() {
  const ref = useRef<HTMLDivElement>(null);
  const themeId = resolveThemeId(useDataLayer((state) => state.theme));
  const setTheme = useDataLayer((state) => state.setTheme);
  const charts = useDataLayer((state) => state.charts);
  const updateChart = useDataLayer((state) => state.updateChart);
  const getFieldLabel = useDataLayer((state) => state.getFieldLabel);
  // The panel sits in the themed workspace, so it reads the theme's values.
  const { typography } = useThemeTypography(ref, themeId);
  const overridden = listStyleOverrides(charts);

  return (
    <div ref={ref} className="eda-theme-settings">
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

      <section className="eda-setting-section" aria-labelledby="eda-overrides">
        <h5 id="eda-overrides">
          Overrides
          <span className="eda-override-count">{overridden.length}</span>
        </h5>
        {overridden.length === 0 ? (
          <p className="eda-setting-note">
            Every chart follows the{" "}
            {WORKSPACE_THEMES.find((t) => t.id === themeId)!.name} theme.
          </p>
        ) : (
          <ul className="eda-override-list">
            {overridden.map(({ chart, overrides }) => {
              const title = getChartTitle(chart, getFieldLabel);
              return (
                <li key={chart.id}>
                  <div className="eda-override-chart">
                    <ActionTooltip content="Show this chart in the workspace">
                      <button
                        type="button"
                        className="eda-override-title"
                        onClick={() =>
                          focusChartInContainer(
                            ref.current?.closest(".eda-workspace") ?? null,
                            chart.id
                          )
                        }
                      >
                        {title}
                      </button>
                    </ActionTooltip>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Reset ${title} to the theme`}
                      tooltip="Return all of this chart's type to the theme. Fields, filters, and layout stay."
                      onClick={() =>
                        updateChart(chart.id, resetChartStyle(chart))
                      }
                    >
                      <RotateCcw />
                    </Button>
                  </div>
                  <dl>
                    {overrides.map((override) => (
                      <div key={override.key} className="eda-override-row">
                        <dt>{override.label}</dt>
                        <dd>
                          <b>{formatValue(override, override.value)}</b>
                          <span>
                            theme{" "}
                            {formatValue(
                              override,
                              typography[override.themeKey]
                            )}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Reset ${override.label} of ${title}`}
                            tooltip={`Return ${override.label.toLowerCase()} to the theme`}
                            onClick={() =>
                              updateChart(chart.id, override.reset)
                            }
                          >
                            <RotateCcw />
                          </Button>
                        </dd>
                      </div>
                    ))}
                  </dl>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
