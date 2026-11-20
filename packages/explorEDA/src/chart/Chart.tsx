import { ChartReadoutProvider } from "@/components/charts/ChartReadout";
import { ChartRenderer } from "@/components/charts/ChartRenderer";
import {
  AxisTypographyProvider,
  toAxisTypography,
  useThemeTypography,
} from "@/components/charts/chartTypography";
import { ChartColorLegend } from "@/components/charts/ColorLegend/ChartColorLegend";
import { FacetContainer } from "@/components/charts/FacetRelated/FacetContainer";
import { FacetBarSlotContext } from "@/components/charts/FacetRelated/facetBarSlot";
import { ChartSettingsContent } from "@/components/ChartSettingsContent";
import { SettingsPopoverContext } from "@/components/chartDetailsStore";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PortalContainerContext } from "@/components/ui/portalContainer";
import { Settings2 } from "lucide-react";
import { getChartTitle } from "@/components/charts/chartAccessibility";
import { resolveThemeId } from "@/lib/themes";
import { useColorScales } from "@/hooks/useColorScales";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { ChartSettings } from "@/types/ChartTypes";
import {
  type CSSProperties,
  useId,
  useMemo,
  useRef,
  useState,
  useEffect,
} from "react";
import { StandaloneProvider, type StandaloneProps } from "./StandaloneProvider";

export interface ChartProps extends StandaloneProps {
  /**
   * The heading above the plot. By default it is `config.title`, or a name
   * built from the chart's fields. `false` hides it.
   */
  title?: string | false;
  /** Width in pixels. Without it, the chart fills its parent's width. */
  width?: number;
  /** Height in pixels. Without it, the chart fills its parent's height. */
  height?: number;
  /**
   * Shows the settings button when editing is on. Pass false to edit only
   * through a `ChartSettings` the host places.
   */
  settingsButton?: boolean;
  className?: string;
  style?: CSSProperties;
}

/** Charts whose marks carry their own category labels; no legend line. */
const CATEGORY_LABELED = new Set(["row", "boxplot", "donut"]);
const LEGEND_HEIGHT = 36;
/** Height when neither the prop nor the parent gives one. */
const FALLBACK_HEIGHT = 300;

/** The element's content size, kept current. */
function useSize() {
  // A callback ref: the element mounts after the chart's first settings
  // arrive, which can be after this hook's first effect.
  const [element, ref] = useState<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    if (!element || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      const box = entry?.contentRect;
      if (!box) return;
      setSize({ width: Math.floor(box.width), height: Math.floor(box.height) });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);
  return [ref, size] as const;
}

/**
 * One explorEDA chart from rows and a config, with no workspace around it.
 * Each chart keeps its own data layer, so charts on one page never filter
 * each other. Hover readouts work; clicks and brushes select nothing.
 */
export function Chart({
  data,
  config,
  onConfigChange,
  fields,
  settingsButton = true,
  ...props
}: ChartProps) {
  const id = useId();
  return (
    <StandaloneProvider
      data={data}
      config={config}
      onConfigChange={onConfigChange}
      fields={fields}
      chartId={id}
    >
      <ChartBody
        chartId={id}
        gear={Boolean(onConfigChange) && settingsButton}
        {...props}
      />
    </StandaloneProvider>
  );
}

function ChartBody({
  chartId,
  title,
  width,
  height,
  className,
  style,
  gear,
}: Pick<ChartProps, "title" | "width" | "height" | "className" | "style"> & {
  chartId: string;
  gear: boolean;
}) {
  const settings = useDataLayer((state) =>
    state.charts.find((chart) => chart.id === chartId)
  );
  const theme = useDataLayer((state) => state.theme);
  const getFieldLabel = useDataLayer((state) => state.getFieldLabel);
  const [plotRef, measured] = useSize();
  const rootRef = useRef<HTMLDivElement>(null);
  const themeId = resolveThemeId(theme);
  const { typography, fonts } = useThemeTypography(rootRef, themeId);
  const axisTypography = useMemo(
    () => toAxisTypography(typography, fonts),
    [typography, fonts]
  );
  const [readout, setReadout] = useState<HTMLDivElement | null>(null);
  const [facetSlot, setFacetSlot] = useState<HTMLDivElement | null>(null);
  const [layer, setLayer] = useState<HTMLDivElement | null>(null);
  useColorScale(settings);

  if (!settings) return null;

  const heading =
    title === false
      ? undefined
      : (title ?? getChartTitle(settings, getFieldLabel));
  const legend = legendHeight(settings);
  const faceted = Boolean(settings.facet?.enabled);
  const plotWidth = width ?? measured.width;
  const plotHeight =
    height !== undefined
      ? Math.max(1, height - (heading ? 28 : 0) - legend)
      : measured.height || FALLBACK_HEIGHT;

  return (
    <div
      ref={rootRef}
      className={["eda-workspace eda-standalone", className]
        .filter(Boolean)
        .join(" ")}
      data-eda-theme={themeId}
      data-chart-id={chartId}
      style={{
        display: "flex",
        flexDirection: "column",
        width: width ?? "100%",
        height: height ?? "100%",
        minHeight: 0,
        ...style,
      }}
    >
      <PortalContainerContext.Provider value={layer ?? undefined}>
        {(heading || gear) && (
          <div
            className="eda-standalone-heading"
            data-floating={heading ? undefined : ""}
          >
            {heading && <span className="eda-standalone-title">{heading}</span>}
            <div ref={setReadout} className="eda-standalone-readout" />
            {gear && <SettingsButton settings={settings} name={heading} />}
          </div>
        )}
        <AxisTypographyProvider value={axisTypography}>
          <ChartReadoutProvider value={readout}>
            {faceted ? (
              <div className="eda-facet-bar">
                {legend > 0 && (
                  <ChartColorLegend
                    settings={settings}
                    width={Math.max(1, plotWidth - 150)}
                  />
                )}
                <div ref={setFacetSlot} className="eda-facet-bar-slot" />
              </div>
            ) : (
              legend > 0 &&
              plotWidth > 0 && (
                <ChartColorLegend settings={settings} width={plotWidth} />
              )
            )}
            <div
              ref={plotRef}
              style={{ flex: "1 1 auto", minWidth: 0, minHeight: 0 }}
            >
              {plotWidth > 0 &&
                (faceted ? (
                  <FacetBarSlotContext.Provider value={facetSlot}>
                    <FacetContainer
                      settings={settings}
                      width={plotWidth}
                      height={plotHeight}
                    />
                  </FacetBarSlotContext.Provider>
                ) : (
                  <ChartRenderer
                    settings={settings}
                    width={plotWidth}
                    height={plotHeight}
                  />
                ))}
            </div>
          </ChartReadoutProvider>
        </AxisTypographyProvider>
      </PortalContainerContext.Provider>
      {/* Tooltips and menus mount here, inside the scoped stylesheet. */}
      <div ref={setLayer} className="eda-standalone-layer" />
    </div>
  );
}

/** The gear that opens the chart's settings, as in a workspace panel. */
function SettingsButton({
  settings,
  name,
}: {
  settings: ChartSettings;
  name: string | undefined;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="eda-standalone-gear"
          aria-label={name ? `Configure ${name}` : "Configure chart"}
        >
          <Settings2 className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        aria-label={name ? `Settings for ${name}` : "Chart settings"}
        className="eda-settings-popover w-[min(21.5rem,calc(100vw-1rem))]"
        style={{ overflow: "hidden" }}
        side="bottom"
        align="end"
        collisionPadding={12}
      >
        <SettingsPopoverContext.Provider value={true}>
          <ChartSettingsContent settings={settings} />
        </SettingsPopoverContext.Provider>
      </PopoverContent>
    </Popover>
  );
}

/**
 * A color field needs a color scale, which the workspace picks when the
 * field is chosen. A config names only the field, so pick it here.
 */
function useColorScale(settings: ChartSettings | undefined) {
  const { colorScales, getOrCreateScaleForField } = useColorScales();
  const updateChart = useDataLayer((state) => state.updateChart);
  const field = settings?.colorField;
  const scaleId = settings?.colorScaleId;
  const missing =
    Boolean(field) && !colorScales.some((scale) => scale.id === scaleId);
  useEffect(() => {
    if (!settings || !field || !missing) return;
    updateChart(settings.id, { colorScaleId: getOrCreateScaleForField(field) });
  }, [settings, field, missing, updateChart, getOrCreateScaleForField]);
}

/** The legend line the workspace panel shows for this chart, if any. */
function legendHeight(settings: ChartSettings) {
  return settings.colorField &&
    settings.colorScaleId &&
    !(settings.type === "scatter" && settings.display === "density") &&
    !CATEGORY_LABELED.has(settings.type)
    ? LEGEND_HEIGHT
    : 0;
}
