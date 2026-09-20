import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    (p) => p.name === palette
  )?.interpolator;
  if (!interpolator) {
    return null;
  }

  return (
    <div className="w-full h-8 rounded-md overflow-hidden">
      <div
        className="w-full h-full"
        style={{
          background: `linear-gradient(to right, ${Array.from(
            { length: 10 },
            (_, i) => interpolator(i / 9)
          ).join(", ")})`,
        }}
      />
    </div>
  );
}

function CategoricalScalePreview({ colors }: { colors: string[] }) {
  return (
    <div className="flex w-full h-8 rounded-md overflow-hidden">
      {colors.map((color, i) => (
        <div
          key={i}
          className="flex-1 h-full"
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
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="numerical-scale-name">Name</Label>
        <Input
          id="numerical-scale-name"
          value={scale.name}
          onChange={(e) => onUpdate({ ...scale, name: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="numerical-scale-min">Min</Label>
          <Input
            id="numerical-scale-min"
            type="number"
            value={scale.min}
            onChange={(e) =>
              onUpdate({
                ...scale,
                min: parseFloat(e.target.value),
              })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="numerical-scale-max">Max</Label>
          <Input
            id="numerical-scale-max"
            type="number"
            value={scale.max}
            onChange={(e) =>
              onUpdate({
                ...scale,
                max: parseFloat(e.target.value),
              })
            }
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Palette</Label>
        <div className="grid grid-cols-2 gap-2">
          {NUMERICAL_PALETTES.map((p) => (
            <Button
              key={p.name}
              variant={scale.palette === p.name ? "default" : "outline"}
              className="w-full h-auto p-2"
              onClick={() => onUpdate({ ...scale, palette: p.name })}
            >
              <div className="w-full space-y-2">
                <span>{p.name}</span>
                <NumericalScalePreview palette={p.name} />
              </div>
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
  const [editingColor, setEditingColor] = useState<{
    value: string;
    color: string;
  } | null>(null);

  const updateColor = useCallback(
    (value: string, newColor: string) => {
      const newMapping = new Map(scale.mapping);
      newMapping.set(value, newColor);
      const newPalette = Array.from(newMapping.values());
      onUpdate({ ...scale, mapping: newMapping, palette: newPalette });
    },
    [scale, onUpdate]
  );

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="categorical-scale-name">Name</Label>
        <Input
          id="categorical-scale-name"
          value={scale.name}
          onChange={(e) => onUpdate({ ...scale, name: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Preset Palettes</Label>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORICAL_PALETTES.map((p) => (
            <Button
              key={p.name}
              variant="outline"
              className="w-full h-auto p-2"
              onClick={() => {
                const newMapping = new Map();
                Array.from(scale.mapping.keys()).forEach((value, i) => {
                  newMapping.set(value, p.colors[i % p.colors.length]);
                });
                onUpdate({
                  ...scale,
                  mapping: newMapping,
                  palette: Array.from(newMapping.values()),
                });
              }}
            >
              <div className="w-full space-y-2">
                <span>{p.name}</span>
                <CategoricalScalePreview colors={p.colors} />
              </div>
            </Button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Category Colors</Label>
        <div className="grid grid-cols-2 gap-2">
          {Array.from(scale.mapping.entries()).map(([value, color]) => (
            <Button
              key={value}
              variant="outline"
              className="w-full"
              onClick={() => setEditingColor({ value, color })}
            >
              <div className="flex items-center gap-2 w-full">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: color }}
                />
                <span className="truncate">{value}</span>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {editingColor && (
        <Dialog open={true} onOpenChange={() => setEditingColor(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Color for {editingColor.value}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <HexColorPicker
                color={editingColor.color}
                onChange={(newColor) =>
                  updateColor(editingColor.value, newColor)
                }
              />
              <Input
                aria-label={`Color for ${editingColor.value}`}
                value={editingColor.color}
                onChange={(e) =>
                  updateColor(editingColor.value, e.target.value)
                }
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
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
      variant={isSelected ? "default" : "ghost"}
      className="w-full justify-start"
      onClick={onClick}
    >
      <div className="flex items-center gap-2 w-full">
        {scale.type === "numerical" ? (
          <Hash className="w-4 h-4" />
        ) : (
          <Shapes className="w-4 h-4" />
        )}
        <span className="truncate">{scale.name}</span>
      </div>
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
  }, [colorScales]);

  const filteredScales = useMemo(() => {
    return state.scales.filter((scale) =>
      scale.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [state.scales, searchQuery]);

  const selectedScale = useMemo(
    () => state.scales.find((s) => s.id === selectedScaleId),
    [state.scales, selectedScaleId]
  );

  const handleSave = () => {
    state.scales.forEach((scale) => {
      const { id, ...scaleWithoutId } = scale;
      updateColorScale(id, scaleWithoutId);
    });
    setState((prev) => ({ ...prev, isDirty: false }));
  };

  const handleScaleUpdate = (updatedScale: ColorScaleType) => {
    setState((prev) => ({
      scales: prev.scales.map((s) =>
        s.id === updatedScale.id ? updatedScale : s
      ),
      isDirty: true,
    }));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Palette className="w-4 h-4 mr-2" />
          Color Scales
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[80vw] max-h-[80vh] min-h-[50vh]">
        <DialogHeader>
          <DialogTitle>Color Scale Manager</DialogTitle>
          <DialogDescription>
            Manage color scales for your visualizations
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-6">
          {/* Left Sidebar */}
          <div className="w-64 border-r pr-4 space-y-4">
            <Input
              aria-label="Search color scales"
              placeholder="Search scales..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="space-y-1 overflow-y-auto">
              {filteredScales.map((scale) => (
                <ScaleListItem
                  key={scale.id}
                  scale={scale}
                  isSelected={scale.id === selectedScaleId}
                  onClick={() => setSelectedScaleId(scale.id)}
                />
              ))}
            </div>
          </div>

          {/* Right Content */}
          <div className="overflow-y-auto w-[400px]">
            {selectedScale && (
              <div className="space-y-4">
                {selectedScale.type === "numerical" ? (
                  <NumericalScaleEditor
                    scale={selectedScale}
                    onUpdate={handleScaleUpdate}
                  />
                ) : (
                  <CategoricalScaleEditor
                    scale={selectedScale}
                    onUpdate={handleScaleUpdate}
                  />
                )}
                {selectedScale.type === "numerical" ? (
                  <NumericalScalePreview palette={selectedScale.palette} />
                ) : (
                  <CategoricalScalePreview colors={selectedScale.palette} />
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setState({ scales: colorScales, isDirty: false })}
          >
            Reset
          </Button>
          <Button onClick={handleSave} disabled={!state.isDirty}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
