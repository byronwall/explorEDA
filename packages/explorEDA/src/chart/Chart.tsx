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
import { ChartEditableContext } from "@/components/charts/chartEditable";
import { PortalContainerContext } from "@/components/ui/portalContainer";
import { getChartTitle } from "@/components/charts/chartAccessibility";
import { resolveThemeId } from "@/lib/themes";
import { useColorScales } from "@/hooks/useColorScales";
import {
  DataLayerProvider,
  type DatumObject,
  useDataLayer,
} from "@/providers/DataLayerProvider";
import type { ChartSettings } from "@/types/ChartTypes";
import {
  type CSSProperties,
  useId,
  useMemo,
  useRef,
  useState,
  useEffect,
} from "react";
import { toSavedData, type ChartConfig } from "./config";

export interface ChartProps {
  /** The rows to draw, one object per row. */
  data: DatumObject[];
  /** The chart type and any settings that differ from its defaults. */
  config: ChartConfig;
  /**
   * The heading above the plot. By default it is `config.title`, or a name
   * built from the chart's fields. `false` hides it.
   */
  title?: string | false;
  /** Width in pixels. Without it, the chart fills its parent's width. */
  width?: number;
  /** Height in pixels. Without it, the chart fills its parent's height. */
  height?: number;
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
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      const box = entry?.contentRect;
      if (!box) return;
      setSize({ width: Math.floor(box.width), height: Math.floor(box.height) });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return [ref, size] as const;
}

/**
 * One explorEDA chart from rows and a config, with no workspace around it.
 * Each chart keeps its own data layer, so charts on one page never filter
 * each other. Hover readouts work; clicks and brushes select nothing.
 */
export function Chart({ data, config, ...props }: ChartProps) {
  const id = useId();
  const savedData = useMemo(() => toSavedData(config, id), [config, id]);
  return (
    <DataLayerProvider data={data} savedData={savedData} selections={false}>
      <ChartEditableContext.Provider value={false}>
        <ChartBody chartId={id} {...props} />
      </ChartEditableContext.Provider>
    </DataLayerProvider>
  );
}

function ChartBody({
  chartId,
  title,
  width,
  height,
  className,
  style,
}: Omit<ChartProps, "data" | "config"> & { chartId: string }) {
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
      {heading && (
        <div className="eda-standalone-heading">
          <span className="eda-standalone-title">{heading}</span>
          <div ref={setReadout} className="eda-standalone-readout" />
        </div>
      )}
      <PortalContainerContext.Provider value={layer ?? undefined}>
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
