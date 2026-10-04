import { useMemo, useState, type KeyboardEvent } from "react";
import { Eye } from "lucide-react";
import { ActionTooltip } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import {
  CATEGORICAL_PALETTES,
  RAMP_PALETTES,
  type Palette,
} from "@/lib/colorPalettes";
import { hardStops, paletteColors, rampGradient } from "@/lib/colorScaleMath";
import { useSimulate } from "./vision";

export type GallerySection = {
  id: string;
  label: string;
  tooltip: string;
  palettes: readonly Palette[];
};

/** Palette sections offered for a numerical scale. */
export const NUMERICAL_SECTIONS: readonly GallerySection[] = [
  {
    id: "sequential",
    label: "Sequential",
    tooltip: "Low to high. Darker or brighter means more.",
    palettes: RAMP_PALETTES.filter((palette) => palette.kind === "sequential"),
  },
  {
    id: "diverging",
    label: "Diverging",
    tooltip:
      "Two hues that meet at a neutral midpoint. Shows which side of a value, such as zero or a target, each row falls on.",
    palettes: RAMP_PALETTES.filter((palette) => palette.kind === "diverging"),
  },
];

/** Palette sections offered for a categorical scale. */
export const CATEGORICAL_SECTIONS: readonly GallerySection[] = [
  {
    id: "categorical",
    label: "Distinct",
    tooltip:
      "Separate hues for categories with no order, such as species or regions.",
    palettes: CATEGORICAL_PALETTES,
  },
  {
    id: "ordered",
    label: "Ordered",
    tooltip:
      "Steps along one ramp for categories with an order, such as sizes, ratings, or age bands.",
    palettes: RAMP_PALETTES,
  },
];

export function palettePreview(
  palette: Palette,
  { reverse = false, steps = 0 }: { reverse?: boolean; steps?: number } = {}
) {
  if (palette.kind === "categorical") {
    return hardStops(paletteColors(palette.id, 0, reverse));
  }
  return rampGradient(palette.id, { reverse, steps });
}

/**
 * A searchable grid of palettes, grouped into sections. Hovering or focusing a
 * palette previews it through `onPreview`; a click applies it.
 */
export function PaletteGallery({
  sections,
  value,
  reverse,
  steps,
  onSelect,
  onPreview,
  label,
}: {
  sections: readonly GallerySection[];
  value: string | undefined;
  reverse?: boolean;
  steps?: number;
  onSelect: (palette: Palette, sectionId: string) => void;
  onPreview?: (palette: Palette | undefined) => void;
  label: string;
}) {
  const simulate = useSimulate();
  const initialSection =
    sections.find((section) =>
      section.palettes.some((palette) => palette.id === value)
    )?.id ?? sections[0]!.id;
  const [sectionId, setSectionId] = useState(initialSection);
  const [safeOnly, setSafeOnly] = useState(false);
  const section =
    sections.find((item) => item.id === sectionId) ?? sections[0]!;
  const palettes = useMemo(
    () =>
      section.palettes.filter((palette) => !safeOnly || palette.colorblindSafe),
    [safeOnly, section.palettes]
  );
  const groups = useMemo(() => {
    const result = new Map<string, Palette[]>();
    palettes.forEach((palette) => {
      const group =
        section.id === "ordered" ? orderedGroup(palette) : palette.group;
      result.set(group, [...(result.get(group) ?? []), palette]);
    });
    return [...result];
  }, [palettes, section.id]);

  const moveFocus = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"];
    if (!keys.includes(event.key)) {
      return;
    }
    const options = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>("[role=radio]")
    );
    const index = options.indexOf(document.activeElement as HTMLButtonElement);
    if (index < 0) {
      return;
    }
    event.preventDefault();
    const delta =
      event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
    options[(index + delta + options.length) % options.length]?.focus();
  };

  return (
    <div className="eda-palette-gallery">
      <div className="eda-palette-gallery-bar">
        <div
          className="eda-segmented"
          role="tablist"
          aria-label={`${label} type`}
        >
          {sections.map((item) => (
            <ActionTooltip key={item.id} content={item.tooltip}>
              <button
                type="button"
                role="tab"
                aria-selected={item.id === section.id}
                className="eda-segmented-item"
                onClick={() => setSectionId(item.id)}
              >
                {item.label}
              </button>
            </ActionTooltip>
          ))}
        </div>
        <ActionTooltip content="Show only palettes whose colors stay distinct for readers with red-green color blindness">
          <label className="eda-palette-safe-toggle">
            <Switch
              checked={safeOnly}
              onCheckedChange={setSafeOnly}
              aria-label="Show only color-blind safe palettes"
            />
            <span>Color-blind safe</span>
          </label>
        </ActionTooltip>
      </div>
      <div
        className="eda-palette-groups"
        role="radiogroup"
        aria-label={label}
        onKeyDown={moveFocus}
        onPointerLeave={() => onPreview?.(undefined)}
      >
        {groups.map(([group, items]) => (
          <div key={group} className="eda-palette-group" role="presentation">
            {groups.length > 1 && (
              <div className="eda-palette-group-label" aria-hidden="true">
                {group}
              </div>
            )}
            <div className="eda-palette-grid" role="presentation">
              {items.map((palette) => {
                const selected = palette.id === value;
                return (
                  <ActionTooltip key={palette.id} content={palette.description}>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      tabIndex={
                        selected ||
                        (!items.some((item) => item.id === value) &&
                          palette === palettes[0])
                          ? 0
                          : -1
                      }
                      aria-label={`${palette.name}${palette.colorblindSafe ? ", color-blind safe" : ""}`}
                      className="eda-palette-option"
                      onClick={() => onSelect(palette, section.id)}
                      onPointerEnter={() => onPreview?.(palette)}
                      onFocus={() => onPreview?.(palette)}
                      onBlur={() => onPreview?.(undefined)}
                    >
                      <span
                        className="eda-palette-swatch"
                        style={{
                          background: simulate(
                            palettePreview(palette, {
                              reverse: selected ? reverse : false,
                              steps:
                                section.id === "ordered"
                                  ? 7
                                  : selected
                                    ? steps
                                    : 0,
                            })
                          ),
                        }}
                        aria-hidden="true"
                      />
                      <span className="eda-palette-name">
                        <span className="truncate">{palette.name}</span>
                        {palette.colorblindSafe && (
                          <Eye
                            className="eda-palette-safe"
                            aria-hidden="true"
                          />
                        )}
                      </span>
                    </button>
                  </ActionTooltip>
                );
              })}
            </div>
          </div>
        ))}
        {palettes.length === 0 && (
          <p className="eda-color-muted">No palettes match.</p>
        )}
      </div>
    </div>
  );
}

function orderedGroup(palette: Palette) {
  return palette.kind === "diverging" ? "Diverging" : "Sequential";
}
