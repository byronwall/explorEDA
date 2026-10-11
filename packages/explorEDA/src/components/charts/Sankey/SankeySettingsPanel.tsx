import { FieldSelector } from "@/components/FieldSelector";
import { NumericInputEnter } from "@/components/NumericInputEnter";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ActionTooltip } from "@/components/ui/tooltip";
import { finiteNumber } from "@/lib/valueParsing";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { ChartSettingsPanelProps } from "@/types/ChartTypes";
import { ArrowDown, ArrowUp, X } from "lucide-react";
import { useMemo } from "react";
import {
  MAX_SANKEY_STAGES,
  MIN_SANKEY_STAGES,
  type SankeySettings,
} from "./definition";

function Choice<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly (readonly [T, string, string])[];
  onChange: (value: T) => void;
}) {
  return (
    <>
      <Label>{label}</Label>
      <ToggleGroup
        type="single"
        size="sm"
        variant="outline"
        value={value}
        onValueChange={(next) => next && onChange(next as T)}
        aria-label={label}
        className="justify-start"
      >
        {options.map(([option, text, help]) => (
          <ActionTooltip key={option} content={help}>
            <span className="inline-flex">
              <ToggleGroupItem value={option} className="px-2">
                {text}
              </ToggleGroupItem>
            </span>
          </ActionTooltip>
        ))}
      </ToggleGroup>
    </>
  );
}

export function SankeySettingsPanel({
  settings,
  onSettingsChange,
}: ChartSettingsPanelProps<SankeySettings>) {
  const getColumnNames = useDataLayer((s) => s.getColumnNames);
  const getColumnData = useDataLayer((s) => s.getColumnData);
  const getFieldLabel = useDataLayer((s) => s.getFieldLabel);
  const profiles = useDataLayer((s) => s.fieldProfiles);
  const calculations = useDataLayer((s) => s.calculations);

  const { stageFields, measureFields } = useMemo(() => {
    void calculations;
    const names = getColumnNames();
    return {
      // Numbers with many values make unreadable stages; keep categories and small sets.
      stageFields: names.filter((name) => {
        const profile = profiles.find((item) => item.name === name);
        return (
          !profile ||
          profile.dataType !== "numeric" ||
          profile.uniqueCount <= 20
        );
      }),
      measureFields: names.filter((name) =>
        Object.values(getColumnData(name)).some(
          (value) =>
            typeof value !== "boolean" && finiteNumber(value) !== undefined
        )
      ),
    };
  }, [calculations, getColumnData, getColumnNames, profiles]);
  const used = new Set(settings.stages);

  const change = (next: Partial<SankeySettings>) =>
    onSettingsChange({ ...settings, ...next });
  const setStages = (stages: string[]) => {
    const kept = new Set(stages);
    // A removed stage takes its selection with it.
    change({
      stages,
      filters: settings.filters.filter((filter) => kept.has(filter.field)),
    });
  };
  const move = (from: number, to: number) => {
    const next = settings.stages.slice();
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item!);
    setStages(next);
  };

  return (
    <div className="space-y-2.5">
      <section className="space-y-2" aria-labelledby="sankey-stages-heading">
        <div className="flex items-baseline justify-between">
          <h5 id="sankey-stages-heading" className="text-sm font-medium">
            Stages, in flow order
          </h5>
          <span className="text-xs text-muted-foreground">
            {settings.stages.length} of {MAX_SANKEY_STAGES}
          </span>
        </div>
        <ol className="space-y-1.5">
          {settings.stages.map((field, index) => {
            const label = getFieldLabel(field);
            return (
              <li
                key={`${field}-${index}`}
                className="flex min-w-0 items-center gap-1"
              >
                <span className="w-4 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <FieldSelector
                    label=""
                    placeholder={`Stage ${index + 1}`}
                    value={field}
                    fields={stageFields.filter(
                      (name) => name === field || !used.has(name)
                    )}
                    onChange={(value) =>
                      setStages(
                        settings.stages.map((item, position) =>
                          position === index ? value : item
                        )
                      )
                    }
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  aria-label={`Move ${label} earlier`}
                  tooltip="Move this stage one step earlier in the flow."
                  disabled={index === 0}
                  onClick={() => move(index, index - 1)}
                >
                  <ArrowUp />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  aria-label={`Move ${label} later`}
                  tooltip="Move this stage one step later in the flow."
                  disabled={index === settings.stages.length - 1}
                  onClick={() => move(index, index + 1)}
                >
                  <ArrowDown />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  aria-label={`Remove ${label}`}
                  tooltip="Remove this stage and its selection."
                  disabled={settings.stages.length <= MIN_SANKEY_STAGES}
                  onClick={() =>
                    setStages(
                      settings.stages.filter(
                        (_, position) => position !== index
                      )
                    )
                  }
                >
                  <X />
                </Button>
              </li>
            );
          })}
        </ol>
        {settings.stages.length < MAX_SANKEY_STAGES && (
          <FieldSelector
            label=""
            placeholder="Add a stage"
            value=""
            fields={stageFields.filter((name) => !used.has(name))}
            onChange={(field) =>
              field && setStages([...settings.stages, field])
            }
          />
        )}
        <p className="text-xs text-muted-foreground">
          Each row is one path through the stages, so a flow can be followed
          from start to finish.
        </p>
      </section>

      <div className="eda-setting-grid">
        <Label htmlFor="sankey-metric">Width</Label>
        <select
          id="sankey-metric"
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
          value={settings.aggregation}
          onChange={(event) => {
            const aggregation = event.target
              .value as SankeySettings["aggregation"];
            change({
              aggregation,
              ...(aggregation === "sum" && !settings.measureField
                ? { measureField: measureFields[0] }
                : {}),
            });
          }}
        >
          <option value="count">Count rows</option>
          <option value="sum" disabled={!measureFields.length}>
            Sum of a field
          </option>
        </select>

        {settings.aggregation === "sum" && (
          <>
            <Label>Measure</Label>
            <FieldSelector
              label=""
              placeholder="Measure"
              value={settings.measureField ?? ""}
              fields={measureFields}
              onChange={(value) => change({ measureField: value })}
            />
          </>
        )}

        <Choice
          label="Missing stage"
          value={settings.missingStages}
          options={[
            [
              "omit",
              "Omit",
              "Rows missing any stage are not drawn and are counted below the chart.",
            ],
            [
              "show",
              "Show",
              "Missing values become a (missing) node, so incomplete rows still flow.",
            ],
          ]}
          onChange={(missingStages) => change({ missingStages })}
        />

        <ActionTooltip content="Each stage shows at most this many values, the ones with the most rows. The rest join one Other node that lists its members.">
          <Label htmlFor="sankey-limit">Values per stage</Label>
        </ActionTooltip>
        <NumericInputEnter
          id="sankey-limit"
          value={settings.maxNodesPerStage}
          onChange={(value) =>
            change({
              maxNodesPerStage: Math.max(2, Math.min(30, Math.round(value))),
            })
          }
          min={2}
          max={30}
          stepSmall={1}
          stepMedium={5}
          stepLarge={10}
        />

        <Choice
          label="Node order"
          value={settings.nodeOrder}
          options={[
            [
              "value",
              "Most rows",
              "Put the values with the most rows at the top of each stage.",
            ],
            [
              "label",
              "A to Z",
              "Sort each stage by its value labels, numbers in numeric order.",
            ],
          ]}
          onChange={(nodeOrder) => change({ nodeOrder })}
        />

        <Choice
          label="Flow color"
          value={settings.flowColor}
          options={[
            [
              "first",
              "First",
              "Color every flow by its first-stage value, so you can follow it to the end.",
            ],
            [
              "source",
              "Source",
              "Color each link by the node it leaves, so each stage shows where it splits.",
            ],
            [
              "none",
              "One",
              "Draw every flow in one color. Selections still stand out.",
            ],
          ]}
          onChange={(flowColor) => change({ flowColor })}
        />
      </div>
    </div>
  );
}
