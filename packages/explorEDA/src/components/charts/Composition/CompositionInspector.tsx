import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ChartSettingsPanelProps } from "@/types/ChartTypes";
import {
  SettingsPopoverContext,
  useChartDetailsStore,
} from "@/components/chartDetailsStore";
import { useDataLayer } from "@/providers/DataLayerProvider";
import {
  ArrowDown,
  ArrowUp,
  ClipboardCopy,
  Heading1,
  Heading2,
  ListOrdered,
  Maximize2,
  MessageSquareText,
  Rows3,
  SeparatorVertical,
  Spline,
  StickyNote,
  Trash2,
  Type,
} from "lucide-react";
import { useContext, useEffect, useMemo, useState } from "react";
import {
  removeElement,
  reorderElement,
  resetOverride,
  updateElement,
  updateOverride,
} from "./compositionEdits";
import {
  useCompositionEditor,
  useCompositionEditorStore,
} from "./compositionEditorStore";
import {
  AnnotationProperties,
  CalculationsSection,
  GuideProperties,
} from "./AnnotationInspector";
import { measureCompositionText } from "./measureText";
import { resolveComposition } from "./resolveComposition";
import { repeatSubsets } from "./resolveUnit";
import { useCompositionData } from "./useCompositionData";
import {
  createAnnotationElement,
  createGuideElement,
  createLegendElement,
  createTextElement,
  createUnitElement,
  createXyUnitElement,
  findOverride,
  normalizeComposition,
  type CompositionDefinition,
  type AnnotationElement,
  type CompositionElement,
  type GuideElement,
  type LegendElement,
  type TextElement,
  type TextRole,
  type UnitElement,
  markHasCategories,
} from "./compositionTypes";
import { ScalesSection } from "./ScaleInspector";
import { copyArtboardPng } from "./compositionOutput";
import { OverrideProperties, UnitProperties } from "./UnitInspector";
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
  guide: SeparatorVertical,
  annotation: MessageSquareText,
  legend: ListOrdered,
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
  const [openCalcId, setOpenCalcId] = useState<string>();
  const [copy, setCopy] = useState<
    { state: "copying" } | { state: "done" | "failed"; message: string }
  >();
  const data = useCompositionData(settings);
  const profiles = useDataLayer((state) => state.fieldProfiles);
  const setMode = useCompositionEditorStore((state) => state.setMode);
  const select = useCompositionEditorStore((state) => state.select);
  const close = useCompositionEditorStore((state) => state.close);
  const inPopover = useContext(SettingsPopoverContext);
  const openDetails = useChartDetailsStore((state) => state.open);

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
  const firstUnit = definition.elements.find(
    (element): element is UnitElement => element.kind === "unit"
  );
  // An annotation switching to a page anchor keeps its drawn position.
  const anchorPoint = useMemo(
    () =>
      selected?.kind === "annotation"
        ? resolveComposition(
            definition,
            measureCompositionText,
            data
          ).elements.find((element) => element.id === selected.id)?.anchor
            ?.point
        : undefined,
    [selected, definition, data]
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
        {inPopover && (
          <Button
            variant="outline"
            size="sm"
            className="h-7"
            tooltip="Edit in the details view: the artboard at full size beside these controls"
            onClick={() => openDetails(settings.id)}
          >
            <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
            Full editor
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          className="h-7"
          disabled={copy?.state === "copying" || !definition.elements.length}
          tooltip="Copy the finished graphic as a PNG at twice its artboard size, for reports and slides. Selection boxes are left out."
          onClick={() => {
            setCopy({ state: "copying" });
            copyArtboardPng(settings.id)
              .then(({ width, height }) =>
                setCopy({
                  state: "done",
                  message: `Copied a ${width} × ${height} PNG.`,
                })
              )
              .catch((error: unknown) =>
                setCopy({
                  state: "failed",
                  message: `Copy failed: ${
                    error instanceof Error ? error.message : String(error)
                  } Your composition is unchanged; try again.`,
                })
              );
          }}
        >
          <ClipboardCopy className="h-3.5 w-3.5" aria-hidden="true" />
          {copy?.state === "copying" ? "Copying…" : "Copy PNG"}
        </Button>
      </div>
      {copy && copy.state !== "copying" && (
        <p
          className="eda-composition-copy-status"
          data-state={copy.state}
          role={copy.state === "failed" ? "alert" : "status"}
        >
          {copy.message}
        </p>
      )}

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
          <Button
            variant="outline"
            size="sm"
            disabled={
              profiles.filter((profile) => profile.dataType === "numeric")
                .length < 2
            }
            tooltip="Add a frame with numeric x and y scales: a path through the rows in the order of a field, with a point on each row. Needs two numeric fields."
            onClick={() => {
              const created = createXyUnitElement(definition, profiles);
              if (created) add(created.element, created.definition);
            }}
          >
            <Spline className="h-3.5 w-3.5" aria-hidden="true" />
            X–Y unit
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!firstUnit}
            tooltip="Add a rule across a chart unit at a fixed or calculated position, such as a date"
            onClick={() =>
              firstUnit && add(createGuideElement(definition, firstUnit))
            }
          >
            <SeparatorVertical className="h-3.5 w-3.5" aria-hidden="true" />
            Guide
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!firstUnit}
            tooltip="Add a key for a mark's categories: the colors of a point mark's color field or a stack's categories"
            onClick={() =>
              firstUnit && add(createLegendElement(definition, firstUnit))
            }
          >
            <ListOrdered className="h-3.5 w-3.5" aria-hidden="true" />
            Legend
          </Button>
          <Button
            variant="outline"
            size="sm"
            tooltip="Add a callout. With a chart unit, it follows the busiest glyph of the first repeat; otherwise it sits on the page."
            onClick={() =>
              add(
                createAnnotationElement(
                  definition,
                  firstUnit,
                  firstUnit &&
                    repeatSubsets(firstUnit, data, definition)[0]?.key
                )
              )
            }
          >
            <MessageSquareText className="h-3.5 w-3.5" aria-hidden="true" />
            Annotation
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
                    {element.kind === "unit" && (
                      <OverrideCount
                        count={
                          definition.overrides.filter(
                            (item) => item.unitId === element.id
                          ).length
                        }
                      />
                    )}
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

      {selected?.kind === "unit" && selection?.instanceKey !== undefined && (
        <OverrideProperties
          label={
            selection.instanceKey === "all"
              ? "the one unit"
              : selection.instanceKey
          }
          override={findOverride(
            definition,
            selected.id,
            selection.instanceKey
          )}
          onChange={(patch) =>
            change(
              updateOverride(
                definition,
                selected.id,
                selection.instanceKey!,
                patch
              )
            )
          }
          onReset={() =>
            change(
              resetOverride(definition, selected.id, selection.instanceKey!)
            )
          }
          onEditTemplate={() => select(settings.id, { elementId: selected.id })}
        />
      )}

      {selected?.kind === "unit" && (
        <UnitProperties
          unit={selected}
          definition={definition}
          repeatCount={countRepeats(selected, profiles)}
          onChange={(patch) =>
            change(updateElement<UnitElement>(definition, selected.id, patch))
          }
          onChangeDefinition={change}
          calculations={definition.calculations}
          onEditScale={setOpenScaleId}
        />
      )}

      {selected?.kind === "guide" && (
        <GuideProperties
          guide={selected}
          definition={definition}
          onChange={(patch) =>
            change(updateElement<GuideElement>(definition, selected.id, patch))
          }
        />
      )}

      {selected?.kind === "legend" && (
        <LegendProperties
          legend={selected}
          definition={definition}
          onChange={(patch) =>
            change(updateElement<LegendElement>(definition, selected.id, patch))
          }
        />
      )}

      {selected?.kind === "annotation" && (
        <AnnotationProperties
          note={selected}
          definition={definition}
          data={data}
          anchorPoint={anchorPoint}
          onChange={(patch) =>
            change(
              updateElement<AnnotationElement>(definition, selected.id, patch)
            )
          }
        />
      )}

      <CalculationsSection
        definition={definition}
        data={data}
        openId={openCalcId}
        onOpen={setOpenCalcId}
        onChange={change}
      />

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

function LegendProperties({
  legend,
  definition,
  onChange,
}: {
  legend: LegendElement;
  definition: CompositionDefinition;
  onChange: (patch: Partial<LegendElement>) => void;
}) {
  const units = definition.elements.filter(
    (element): element is UnitElement => element.kind === "unit"
  );
  const unit = units.find((item) => item.id === legend.unitId);
  return (
    <section
      className="eda-setting-section"
      aria-label={`${legend.name} legend`}
    >
      <h5>{legend.name}</h5>
      <div className="eda-setting-grid">
        <label htmlFor={`${legend.id}-unit`}>Unit</label>
        <select
          id={`${legend.id}-unit`}
          className="eda-composition-select"
          value={legend.unitId}
          onChange={(event) => {
            const next = units.find((item) => item.id === event.target.value);
            onChange({
              unitId: event.target.value,
              markId: next?.marks[0]?.id ?? "",
            });
          }}
        >
          {units.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <label htmlFor={`${legend.id}-scale`}>Key for</label>
        <select
          id={`${legend.id}-scale`}
          className="eda-composition-select"
          value={legend.scaleId ?? ""}
          onChange={(event) =>
            onChange({ scaleId: event.target.value || undefined })
          }
        >
          <option value="">A mark's categories</option>
          {definition.scales
            .filter((scale) => scale.kind === "value")
            .map((scale) => (
              <option key={scale.id} value={scale.id}>
                {scale.name} ramp
              </option>
            ))}
        </select>
        <label htmlFor={`${legend.id}-mark`}>Mark</label>
        <select
          id={`${legend.id}-mark`}
          className="eda-composition-select"
          value={legend.markId}
          disabled={Boolean(legend.scaleId)}
          onChange={(event) => onChange({ markId: event.target.value })}
        >
          {(unit?.marks ?? []).map((mark) => (
            <option key={mark.id} value={mark.id}>
              {mark.name}
              {markHasCategories(mark) ? "" : " (no categories)"}
            </option>
          ))}
        </select>
        <span className="eda-setting-label">Layout</span>
        <Segmented
          label="Legend direction"
          value={legend.direction}
          options={[
            {
              value: "row" as const,
              label: "Row",
              tooltip: "Entries side by side",
            },
            {
              value: "column" as const,
              label: "Column",
              tooltip: "Entries one under another",
            },
          ]}
          onChange={(direction) => onChange({ direction })}
        />
        <NumberSetting
          label="Size"
          min={6}
          max={40}
          value={legend.fontSize}
          onChange={(fontSize) => onChange({ fontSize })}
        />
        {legend.direction === "row" && (
          <NumberSetting
            label="Wrap at"
            min={40}
            max={4000}
            value={legend.width ?? definition.artboard.width - legend.x - 16}
            onChange={(width) => onChange({ width })}
          />
        )}
        <ColorSetting
          label="Color"
          value={legend.color}
          onChange={(color) => onChange({ color })}
        />
        <PairSetting
          label="Position"
          names={["X", "Y"]}
          values={[legend.x, legend.y]}
          onChange={([x, y]) => onChange({ x, y })}
        />
      </div>
    </section>
  );
}

function OverrideCount({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span className="eda-composition-layer-meta">
      {count} {count === 1 ? "override" : "overrides"}
    </span>
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
    <section
      className="eda-setting-section"
      aria-label={`${element.name} text`}
    >
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
