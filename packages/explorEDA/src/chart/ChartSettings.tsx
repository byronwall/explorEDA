import { ChartSettingsContent } from "@/components/ChartSettingsContent";
import { PortalContainerContext } from "@/components/ui/portalContainer";
import { resolveThemeId } from "@/lib/themes";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { type CSSProperties, useId, useState } from "react";
import { ChartErrorBoundary } from "./ChartErrorBoundary";
import { sortedText } from "./config";
import { StandaloneProvider, type StandaloneProps } from "./StandaloneProvider";

export interface ChartSettingsProps extends StandaloneProps {
  className?: string;
  style?: CSSProperties;
}

/**
 * The settings panel for one config, for the host to place, such as in a
 * sidebar beside a `Chart`. Give both the same `config`, and pass the
 * panel's `onConfigChange` result to both.
 */
export function ChartSettings({
  data,
  config,
  onConfigChange,
  fields,
  className,
  style,
}: ChartSettingsProps) {
  const id = useId();
  return (
    <ChartErrorBoundary
      resetKey={typeof config === "string" ? config : sortedText(config)}
    >
      <StandaloneProvider
        data={data}
        config={config}
        onConfigChange={onConfigChange}
        fields={fields}
        chartId={id}
      >
        <SettingsBody chartId={id} className={className} style={style} />
      </StandaloneProvider>
    </ChartErrorBoundary>
  );
}

function SettingsBody({
  chartId,
  className,
  style,
}: {
  chartId: string;
  className?: string;
  style?: CSSProperties;
}) {
  const settings = useDataLayer((state) =>
    state.charts.find((chart) => chart.id === chartId)
  );
  const theme = useDataLayer((state) => state.theme);
  const [layer, setLayer] = useState<HTMLDivElement | null>(null);
  if (!settings) return null;
  return (
    <div
      className={[
        "eda-workspace eda-standalone eda-standalone-settings",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      data-eda-theme={resolveThemeId(theme)}
      style={style}
    >
      <PortalContainerContext.Provider value={layer ?? undefined}>
        <ChartSettingsContent settings={settings} />
      </PortalContainerContext.Provider>
      <div ref={setLayer} className="eda-standalone-layer" />
    </div>
  );
}
