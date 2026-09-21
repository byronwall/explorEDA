import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ActionTooltip } from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useColorScales } from "@/hooks/useColorScales";
import {
  CategoricalColorScale,
  ColorScaleType,
  NumericalColorScale,
} from "@/types/ColorScaleTypes";
import {
  interpolateCool,
  interpolateInferno,
  interpolateMagma,
  interpolatePlasma,
  interpolateViridis,
  interpolateWarm,
  schemeCategory10,
  schemeSet3,
} from "d3-scale-chromatic";
import { Hash, Palette, Shapes } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { HexColorPicker } from "react-colorful";

const NUMERICAL_PALETTES = [
  { name: "Viridis", interpolator: interpolateViridis },
  { name: "Inferno", interpolator: interpolateInferno },
  { name: "Magma", interpolator: interpolateMagma },
  { name: "Plasma", interpolator: interpolatePlasma },
  { name: "Warm", interpolator: interpolateWarm },
  { name: "Cool", interpolator: interpolateCool },
];

const CATEGORICAL_PALETTES = [
  { name: "Category10", colors: [...schemeCategory10] },
  { name: "Set3", colors: [...schemeSet3] },
];

interface ColorScaleEditorState {
  scales: ColorScaleType[];
  isDirty: boolean;
}

function NumericalScalePreview({ palette }: { palette: string }) {
  const interpolator = NUMERICAL_PALETTES.find(
    (item) => item.name === palette
  )?.interpolator;
  if (!interpolator) {
    return null;
  }

  return (
    <div className="h-5 w-full overflow-hidden rounded-sm">
      <div
        className="h-full w-full"
        style={{
          background: `linear-gradient(to right, ${Array.from(
            { length: 10 },
            (_, index) => interpolator(index / 9)
          ).join(", ")})`,
        }}
      />
    </div>
  );
}

function CategoricalScalePreview({ colors }: { colors: string[] }) {
  return (
    <div className="flex h-5 w-full overflow-hidden rounded-sm">
      {Array.from(new Set(colors)).map((color, index) => (
        <div
          key={`${color}-${index}`}
          className="h-full min-w-0 flex-1"
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}

function NumericalScaleEditor({
  scale,
  onUpdate,
}: {
  scale: NumericalColorScale;
  onUpdate: (scale: NumericalColorScale) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor={`numerical-scale-name-${scale.id}`}>Name</Label>
        <Input
          id={`numerical-scale-name-${scale.id}`}
          value={scale.name}
          onChange={(event) => onUpdate({ ...scale, name: event.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label htmlFor={`numerical-scale-min-${scale.id}`}>Min</Label>
          <Input
            id={`numerical-scale-min-${scale.id}`}
            type="number"
            value={scale.min}
            onChange={(event) =>
              onUpdate({ ...scale, min: parseFloat(event.target.value) })
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`numerical-scale-max-${scale.id}`}>Max</Label>
          <Input
            id={`numerical-scale-max-${scale.id}`}
            type="number"
            value={scale.max}
            onChange={(event) =>
              onUpdate({ ...scale, max: parseFloat(event.target.value) })
            }
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Palette</Label>
        <div className="grid grid-cols-2 gap-2">
          {NUMERICAL_PALETTES.map((palette) => (
            <Button
              key={palette.name}
              type="button"
              variant={scale.palette === palette.name ? "default" : "outline"}
              className="h-auto min-w-0 justify-start p-2"
              onClick={() => onUpdate({ ...scale, palette: palette.name })}
            >
              <span className="min-w-0 flex-1 space-y-1 text-left">
                <span className="block truncate text-xs">{palette.name}</span>
                <NumericalScalePreview palette={palette.name} />
              </span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

function CategoricalScaleEditor({
  scale,
  onUpdate,
}: {
  scale: CategoricalColorScale;
  onUpdate: (scale: CategoricalColorScale) => void;
}) {
  const [query, setQuery] = useState("");
  const [editingColor, setEditingColor] = useState<{
    value: string;
    color: string;
  } | null>(null);
  const categories = Array.from(scale.mapping.entries()).filter(([value]) =>
    value.toLowerCase().includes(query.trim().toLowerCase())
  );

  const updateColor = useCallback(
    (value: string, color: string) => {
      const mapping = new Map(scale.mapping);
      mapping.set(value, color);
      onUpdate({ ...scale, mapping, palette: Array.from(mapping.values()) });
      setEditingColor({ value, color });
    },
    [onUpdate, scale]
  );

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor={`categorical-scale-name-${scale.id}`}>Name</Label>
        <Input
          id={`categorical-scale-name-${scale.id}`}
          value={scale.name}
          onChange={(event) => onUpdate({ ...scale, name: event.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Preset palettes</Label>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORICAL_PALETTES.map((palette) => (
            <Button
              key={palette.name}
              type="button"
              variant="outline"
              className="h-auto min-w-0 justify-start p-2"
              onClick={() => {
                const mapping = new Map<string, string>();
                Array.from(scale.mapping.keys()).forEach((value, index) => {
                  mapping.set(
                    value,
                    palette.colors[index % palette.colors.length] ?? "#000000"
                  );
                });
                onUpdate({
                  ...scale,
                  mapping,
                  palette: Array.from(mapping.values()),
                });
              }}
            >
              <span className="min-w-0 flex-1 space-y-1 text-left">
                <span className="block truncate text-xs">{palette.name}</span>
                <CategoricalScalePreview colors={palette.colors} />
              </span>
            </Button>
          ))}
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label>Category colors</Label>
          <span className="text-xs text-muted-foreground">
            {scale.mapping.size}{" "}
            {scale.mapping.size === 1 ? "category" : "categories"}
          </span>
        </div>
        {scale.mapping.size > 8 && (
          <Input
            aria-label="Find category colors"
            placeholder="Find a category"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        )}
        <div className="max-h-36 space-y-1 overflow-y-auto rounded-md border p-1">
          {categories.slice(0, 100).map(([value, color]) => (
            <Popover
              key={value}
              open={editingColor?.value === value}
              onOpenChange={(open) => !open && setEditingColor(null)}
            >
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-8 w-full justify-start px-2"
                  aria-label={`Edit color for ${value}`}
                  onClick={() => setEditingColor({ value, color })}
                >
                  <span
                    className="h-4 w-4 shrink-0 rounded-sm border"
                    style={{ backgroundColor: color }}
                  />
                  <span className="truncate">{value}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {color}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent
                side="left"
                align="start"
                className="w-[min(240px,calc(100vw-24px))] space-y-3 p-3"
              >
                <div className="text-sm font-medium">{value}</div>
                <HexColorPicker
                  color={editingColor?.color ?? color}
                  onChange={(newColor) => updateColor(value, newColor)}
                  className="!h-36 !w-full"
                />
                <Input
                  aria-label={`Color for ${value}`}
                  value={editingColor?.color ?? color}
                  onChange={(event) => updateColor(value, event.target.value)}
                />
              </PopoverContent>
            </Popover>
          ))}
          {categories.length === 0 && (
            <p className="p-2 text-xs text-muted-foreground">
              No matching categories
            </p>
          )}
        </div>
        {categories.length > 100 && (
          <p className="text-xs text-muted-foreground">
            First 100 of {categories.length.toLocaleString()} shown. Search to
            find a category.
          </p>
        )}
      </div>
    </div>
  );
}

function ScaleListItem({
  scale,
  isSelected,
  onClick,
}: {
  scale: ColorScaleType;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant={isSelected ? "secondary" : "ghost"}
      className="h-auto w-full justify-start px-2 py-1.5"
      onClick={onClick}
    >
      {scale.type === "numerical" ? (
        <Hash className="h-4 w-4 shrink-0" aria-hidden="true" />
      ) : (
        <Shapes className="h-4 w-4 shrink-0" aria-hidden="true" />
      )}
      <span className="min-w-0 flex-1 text-left">
        <span className="block truncate text-sm">{scale.name}</span>
        <span className="block text-xs text-muted-foreground">
          {scale.type === "numerical" ? "Numerical" : "Categorical"}
        </span>
      </span>
    </Button>
  );
}

export function ColorScaleManager() {
  const { colorScales, updateColorScale } = useColorScales();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedScaleId, setSelectedScaleId] = useState<string | null>(
    colorScales[0]?.id ?? null
  );
  const [state, setState] = useState<ColorScaleEditorState>({
    scales: colorScales,
    isDirty: false,
  });

  useEffect(() => {
    setState({ scales: colorScales, isDirty: false });
    setSelectedScaleId((current) =>
      colorScales.some((scale) => scale.id === current)
        ? current
        : (colorScales[0]?.id ?? null)
    );
  }, [colorScales]);

  const filteredScales = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return state.scales.filter((scale) =>
      scale.name.toLowerCase().includes(query)
    );
  }, [searchQuery, state.scales]);

  const selectedScale = state.scales.find(
    (scale) => scale.id === selectedScaleId
  );

  const invalidNumericalScale = state.scales.find(
    (scale): scale is NumericalColorScale =>
      scale.type === "numerical" &&
      (!Number.isFinite(scale.min) ||
        !Number.isFinite(scale.max) ||
        scale.min >= scale.max)
  );

  const selectedNumericalScaleError =
    selectedScale?.type === "numerical" &&
    (!Number.isFinite(selectedScale.min) ||
      !Number.isFinite(selectedScale.max) ||
      selectedScale.min >= selectedScale.max);

  const handleScaleUpdate = (updatedScale: ColorScaleType) => {
    setState((previous) => ({
      scales: previous.scales.map((scale) =>
        scale.id === updatedScale.id ? updatedScale : scale
      ),
      isDirty: true,
    }));
  };

  const handleSave = () => {
    if (invalidNumericalScale) {
      return;
    }
    state.scales.forEach(({ id, ...scale }) => updateColorScale(id, scale));
    setState((previous) => ({ ...previous, isDirty: false }));
  };

  return (
    <Popover>
      <ActionTooltip content="Manage color scales">
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Manage color scales"
          >
            <Palette aria-hidden="true" />
          </Button>
        </PopoverTrigger>
      </ActionTooltip>
      <PopoverContent
        align="end"
        aria-label="Color scale manager"
        className="max-h-[min(80vh,640px)] w-[min(360px,calc(100vw-24px))] space-y-3 overflow-y-auto p-3"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold">Color scales</h2>
            <p className="text-xs text-muted-foreground">
              Choose a scale, then adjust its palette.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Input
            aria-label="Search color scales"
            placeholder="Search scales"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
          <div className="max-h-32 space-y-0.5 overflow-y-auto rounded-md border p-1">
            {filteredScales.length > 0 ? (
              filteredScales.map((scale) => (
                <ScaleListItem
                  key={scale.id}
                  scale={scale}
                  isSelected={scale.id === selectedScaleId}
                  onClick={() => setSelectedScaleId(scale.id)}
                />
              ))
            ) : (
              <p className="px-2 py-3 text-center text-xs text-muted-foreground">
                No matching scales
              </p>
            )}
          </div>
        </div>

        {selectedScale ? (
          <div className="space-y-3 border-t pt-3">
            {selectedScale.type === "numerical" ? (
              <NumericalScaleEditor
                scale={selectedScale}
                onUpdate={handleScaleUpdate}
              />
            ) : (
              <CategoricalScaleEditor
                key={selectedScale.id}
                scale={selectedScale}
                onUpdate={handleScaleUpdate}
              />
            )}
            {selectedScale.type === "numerical" ? (
              <NumericalScalePreview palette={selectedScale.palette} />
            ) : (
              <CategoricalScalePreview colors={selectedScale.palette} />
            )}
            {selectedNumericalScaleError && (
              <p className="text-xs text-destructive" role="alert">
                Enter finite values with a minimum below the maximum.
              </p>
            )}
            <div className="sticky bottom-0 -mx-3 -mb-3 flex justify-end gap-2 border-t bg-popover px-3 py-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setState({ scales: colorScales, isDirty: false })
                }
                disabled={!state.isDirty}
              >
                Reset
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                disabled={!state.isDirty || Boolean(invalidNumericalScale)}
              >
                Save changes
              </Button>
            </div>
          </div>
        ) : (
          <p className="border-t pt-3 text-sm text-muted-foreground">
            Choose a color field in chart settings to create its color scale.
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
}
