import { useEffect, useMemo, useState } from "react";
import { Eye, Hash, Shapes, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ActionTooltip } from "@/components/ui/tooltip";
import { useColorScales } from "@/hooks/useColorScales";
import { VISION_MODES, type VisionMode } from "@/lib/colorPalettes";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { ColorScaleType } from "@/types/ColorScaleTypes";
import {
  ColorScaleEditor,
  ScaleSwatch,
  paletteLabel,
} from "./colorScales/ColorScaleEditor";
import { VisionProvider } from "./colorScales/vision";

/** How many charts color by each scale. */
export function useScaleUsage() {
  const charts = useDataLayer((state) => state.charts);
  return useMemo(() => {
    const usage = new Map<string, number>();
    charts.forEach((chart) => {
      if (chart.colorScaleId) {
        usage.set(chart.colorScaleId, (usage.get(chart.colorScaleId) ?? 0) + 1);
      }
    });
    return usage;
  }, [charts]);
}

/** Lets the editor preview every color as a reader with other vision sees it. */
export function VisionSelect({
  value,
  onChange,
}: {
  value: VisionMode;
  onChange: (value: VisionMode) => void;
}) {
  return (
    <Select
      value={value}
      onValueChange={(next) => onChange(next as VisionMode)}
    >
      <ActionTooltip content="Preview this panel's colors as readers with color blindness see them. Charts keep their colors.">
        <span className="eda-vision-select-wrap">
          <SelectTrigger
            className="eda-vision-select"
            aria-label="Preview colors as"
            data-active={value !== "normal" || undefined}
          >
            <Eye aria-hidden="true" />
            <SelectValue>
              {VISION_MODES.find((mode) => mode.value === value)?.label}
            </SelectValue>
          </SelectTrigger>
        </span>
      </ActionTooltip>
      <SelectContent align="end">
        {VISION_MODES.map((mode) => (
          <SelectItem key={mode.value} value={mode.value}>
            <span className="eda-vision-option">
              <span>{mode.label}</span>
              <span className="eda-color-muted">{mode.description}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function ScaleListItem({
  scale,
  usage,
  isSelected,
  onSelect,
  onDelete,
}: {
  scale: ColorScaleType;
  usage: number;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const getFieldLabel = useDataLayer((state) => state.getFieldLabel);
  const Icon = scale.type === "numerical" ? Hash : Shapes;
  return (
    <li className="eda-scale-item" data-selected={isSelected || undefined}>
      <button
        type="button"
        className="eda-scale-item-main"
        aria-current={isSelected || undefined}
        onClick={onSelect}
      >
        <span className="eda-scale-item-title">
          <Icon aria-hidden="true" />
          <span className="truncate">{scale.name}</span>
        </span>
        <ScaleSwatch scale={scale} />
        <span className="eda-scale-item-meta">
          <span className="truncate">{paletteLabel(scale)}</span>
          <span>
            {usage === 0
              ? "Unused"
              : `${usage} ${usage === 1 ? "chart" : "charts"}`}
          </span>
        </span>
        {scale.sourceField && scale.sourceField !== scale.name && (
          <span className="eda-scale-item-field truncate">
            {getFieldLabel(scale.sourceField)}
          </span>
        )}
      </button>
      {usage === 0 && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="eda-scale-item-delete"
          aria-label={`Delete ${scale.name}`}
          tooltip="Delete this scale. No chart uses it."
          onClick={onDelete}
        >
          <Trash2 />
        </Button>
      )}
    </li>
  );
}

/** Lists the workspace color scales and edits the selected one. */
export function ColorScalePanel() {
  const { colorScales, removeColorScale } = useColorScales();
  const usage = useScaleUsage();
  const [searchQuery, setSearchQuery] = useState("");
  const [vision, setVision] = useState<VisionMode>("normal");
  const [selectedScaleId, setSelectedScaleId] = useState<string | null>(
    colorScales[0]?.id ?? null
  );

  useEffect(() => {
    setSelectedScaleId((current) =>
      colorScales.some((scale) => scale.id === current)
        ? current
        : (colorScales[0]?.id ?? null)
    );
  }, [colorScales]);

  const filteredScales = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return colorScales.filter(
      (scale) =>
        scale.name.toLowerCase().includes(query) ||
        scale.sourceField?.toLowerCase().includes(query)
    );
  }, [searchQuery, colorScales]);

  const selectedScale = colorScales.find(
    (scale) => scale.id === selectedScaleId
  );

  return (
    <VisionProvider value={vision}>
      <div className="eda-color-panel">
        <div className="eda-color-panel-head">
          <div className="min-w-0">
            <h2>Color scales</h2>
            <p className="eda-color-muted">
              Charts that color by the same field share its scale.
            </p>
          </div>
          <VisionSelect value={vision} onChange={setVision} />
        </div>

        {colorScales.length === 0 ? (
          <p className="eda-color-empty">
            Choose a color field in a chart's settings to create its scale.
          </p>
        ) : (
          <div className="eda-color-panel-body">
            <div className="eda-scale-list-wrap">
              {colorScales.length > 5 && (
                <Input
                  aria-label="Search color scales"
                  placeholder="Search scales"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              )}
              <ul className="eda-scale-list" aria-label="Color scales">
                {filteredScales.map((scale) => (
                  <ScaleListItem
                    key={scale.id}
                    scale={scale}
                    usage={usage.get(scale.id) ?? 0}
                    isSelected={scale.id === selectedScaleId}
                    onSelect={() => setSelectedScaleId(scale.id)}
                    onDelete={() => removeColorScale(scale.id)}
                  />
                ))}
                {filteredScales.length === 0 && (
                  <li className="eda-color-muted">No matching scales</li>
                )}
              </ul>
            </div>
            {selectedScale && (
              <ColorScaleEditor key={selectedScale.id} scale={selectedScale} />
            )}
          </div>
        )}
      </div>
    </VisionProvider>
  );
}
