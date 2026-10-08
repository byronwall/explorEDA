import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ChartSettingsPanelProps } from "@/types/ChartTypes";
import { useDataLayer } from "@/providers/DataLayerProvider";
import {
  ArrowDown,
  ArrowUp,
  Heading1,
  Heading2,
  Rows3,
  StickyNote,
  Trash2,
  Type,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  removeElement,
  reorderElement,
  updateElement,
} from "./compositionEdits";
import {
  useCompositionEditor,
  useCompositionEditorStore,
} from "./compositionEditorStore";
import {
  createTextElement,
  createUnitElement,
  normalizeComposition,
  type CompositionDefinition,
  type CompositionElement,
  type TextElement,
  type TextRole,
  type UnitElement,
} from "./compositionTypes";
import { ScalesSection } from "./ScaleInspector";
import { UnitProperties } from "./UnitInspector";
import type { CompositionSettings } from "./definition";
import {
  ColorSetting,
  NumberSetting,
  PairSetting,
  Segmented,
} from "./inspectorControls";

const MODE_OPTIONS = [
  {
    value: "edit" as const,
    label: "Edit",
    tooltip:
      "Click an element on the artboard to select it, then drag or use the arrow keys to move it",
  },
  {
    value: "view" as const,
    label: "View",
    tooltip: "Use the graphic as readers will, without selection or movement",
  },
];

const TEXT_ADDERS: {
  role: TextRole;
  label: string;
  tooltip: string;
  icon: typeof Type;
}[] = [
  {
    role: "title",
    label: "Title",
    tooltip: "Add a large bold heading for the graphic",
    icon: Heading1,
  },
  {
    role: "subtitle",
    label: "Subtitle",
    tooltip: "Add a muted line that explains what the graphic shows",
    icon: Heading2,
  },
  {
    role: "note",
    label: "Note",
    tooltip: "Add small text, such as a source line, at the foot of the page",
    icon: StickyNote,
  },
];

const KIND_ICONS: Record<CompositionElement["kind"], typeof Type> = {
  text: Type,
  unit: Rows3,
};

export function CompositionInspector({
  settings,
  onSettingsChange,
}: ChartSettingsPanelProps<CompositionSettings>) {
  const definition = useMemo(
    () => normalizeComposition(settings.composition),
    [settings.composition]
  );
  const { mode, selection } = useCompositionEditor(settings.id);
  const [openScaleId, setOpenScaleId] = useState<string>();
  const profiles = useDataLayer((state) => state.fieldProfiles);
  const setMode = useCompositionEditorStore((state) => state.setMode);
  const select = useCompositionEditorStore((state) => state.select);
  const close = useCompositionEditorStore((state) => state.close);

  // Opening the inspector starts editing; closing it returns to viewing.
  useEffect(() => {
    setMode(settings.id, "edit");
    return () => close(settings.id);
  }, [settings.id, setMode, close]);

  const change = (composition: CompositionDefinition) =>
    onSettingsChange({ ...settings, composition });

  const selected = definition.elements.find(
    (element) => element.id === selection?.elementId
  );

  const add = (
    element: CompositionElement,
    base: CompositionDefinition = definition
  ) => {
    change({ ...base, elements: [...base.elements, element] });
    setMode(settings.id, "edit");
    select(settings.id, { elementId: element.id });
  };

  return (
    <div className="eda-composition-inspector">
      <div className="eda-composition-toolbar">
        <Segmented
          label="Composition mode"
          value={mode}
          options={MODE_OPTIONS}
          onChange={(next) => setMode(settings.id, next)}
        />
      </div>

      <section className="eda-setting-section" aria-label="Add elements">
        <h5>Add</h5>
        <div className="eda-composition-adders">
          {TEXT_ADDERS.map(({ role, label, tooltip, icon: Icon }) => (
            <Button
              key={role}
              variant="outline"
              size="sm"
              tooltip={tooltip}
              onClick={() => add(createTextElement(definition, role))}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              {label}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            disabled={!profiles.length}
            tooltip="Add a chart template: a frame of marks drawn from the data, which you can repeat for each value of a field"
            onClick={() => {
              const created = createUnitElement(definition, profiles);
              if (created) add(created.element, created.definition);
            }}
          >
            <Rows3 className="h-3.5 w-3.5" aria-hidden="true" />
            Chart unit
          </Button>
        </div>
      </section>

      <section className="eda-setting-section" aria-label="Layers">
        <h5>Layers</h5>
        {definition.elements.length === 0 ? (
          <p className="eda-setting-note">
            The artboard is blank. Add a title to start.
          </p>
        ) : (
          <ul className="eda-composition-layers">
            {[...definition.elements].reverse().map((element) => {
              const Icon = KIND_ICONS[element.kind];
              const isSelected = element.id === selected?.id;
              return (
                <li key={element.id} data-selected={isSelected || undefined}>
                  <button
                    type="button"
                    className="eda-composition-layer"
                    aria-pressed={isSelected}
                    onClick={() => {
                      setMode(settings.id, "edit");
                      select(settings.id, { elementId: element.id });
                    }}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className="truncate">{element.name}</span>
                  </button>
                  {isSelected && (
                    <span className="eda-composition-layer-actions">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        aria-label={`Bring ${element.name} forward`}
                        tooltip="Draw this element above the one in front of it"
                        onClick={() =>
                          change(reorderElement(definition, element.id, 1))
                        }
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        aria-label={`Send ${element.name} backward`}
                        tooltip="Draw this element below the one behind it"
                        onClick={() =>
                          change(reorderElement(definition, element.id, -1))
                        }
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        aria-label={`Delete ${element.name}`}
                        tooltip="Remove this element from the composition"
                        onClick={() => {
                          select(settings.id, undefined);
                          change(removeElement(definition, element.id));
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {selected?.kind === "text" && (
        <TextProperties
          element={selected}
          onChange={(patch) =>
            change(updateElement<TextElement>(definition, selected.id, patch))
          }
        />
      )}

      {selected?.kind === "unit" && (
        <UnitProperties
          unit={selected}
          scales={definition.scales}
          repeatCount={countRepeats(selected, profiles)}
          onChange={(patch) =>
            change(updateElement<UnitElement>(definition, selected.id, patch))
          }
          onEditScale={setOpenScaleId}
        />
      )}

      <ScalesSection
        definition={definition}
        openScaleId={openScaleId}
        onOpen={setOpenScaleId}
        onChange={change}
      />

      <section className="eda-setting-section" aria-label="Artboard">
        <h5>Artboard</h5>
        <div className="eda-setting-grid">
          <PairSetting
            label="Size"
            names={["W", "H"]}
            min={120}
            values={[definition.artboard.width, definition.artboard.height]}
            onChange={([width, height]) =>
              change({
                ...definition,
                artboard: { ...definition.artboard, width, height },
              })
            }
          />
          <ColorSetting
            label="Paper"
            value={definition.artboard.background}
            onChange={(background) =>
              change({
                ...definition,
                artboard: { ...definition.artboard, background },
              })
            }
          />
        </div>
      </section>
    </div>
  );
}

/** The repeats a unit draws: one per subset value, up to its limit. */
function countRepeats(
  unit: UnitElement,
  profiles: { name: string; uniqueCount: number; nullCount: number }[]
) {
  if (!unit.repeat.field) return 1;
  const profile = profiles.find((item) => item.name === unit.repeat.field);
  const subsets = profile
    ? profile.uniqueCount + (profile.nullCount > 0 ? 1 : 0)
    : 1;
  return Math.max(1, Math.min(unit.repeat.limit, subsets));
}

const WEIGHT_OPTIONS = [
  { value: 400 as const, label: "Regular", tooltip: "Normal text weight" },
  { value: 600 as const, label: "Medium", tooltip: "Semibold, for labels" },
  { value: 700 as const, label: "Bold", tooltip: "Bold, for headings" },
];

function TextProperties({
  element,
  onChange,
}: {
  element: TextElement;
  onChange: (patch: Partial<TextElement>) => void;
}) {
  return (
    <section className="eda-setting-section" aria-label={`${element.name} text`}>
      <h5>{element.name}</h5>
      <div className="eda-setting-grid">
        <label htmlFor={`${element.id}-name`}>Layer name</label>
        <Input
          id={`${element.id}-name`}
          value={element.name}
          onChange={(event) => onChange({ name: event.target.value })}
        />
        <label htmlFor={`${element.id}-text`}>Text</label>
        <textarea
          id={`${element.id}-text`}
          className="eda-composition-textarea"
          rows={Math.min(5, Math.max(2, element.text.split("\n").length))}
          value={element.text}
          onChange={(event) => onChange({ text: event.target.value })}
        />
        <NumberSetting
          label="Size"
          min={6}
          max={120}
          value={element.fontSize}
          onChange={(fontSize) => onChange({ fontSize })}
        />
        <span className="eda-setting-label">Weight</span>
        <Segmented
          label="Text weight"
          value={element.fontWeight}
          options={WEIGHT_OPTIONS}
          onChange={(fontWeight) => onChange({ fontWeight })}
        />
        <ColorSetting
          label="Color"
          value={element.color}
          onChange={(color) => onChange({ color })}
        />
        <PairSetting
          label="Position"
          names={["X", "Y"]}
          values={[element.x, element.y]}
          onChange={([x, y]) => onChange({ x, y })}
        />
        <NumberSetting
          label="Wrap width"
          min={20}
          value={element.width}
          onChange={(width) => onChange({ width })}
        />
      </div>
    </section>
  );
}
