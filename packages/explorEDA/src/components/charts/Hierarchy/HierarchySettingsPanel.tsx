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
import { DEFAULT_MAX_CHILDREN, keepForLevels } from "./hierarchyPlan";
import {
  MAX_HIERARCHY_LEVELS,
  MIN_HIERARCHY_LEVELS,
  type HierarchySettings,
} from "./definition";

export function HierarchySettingsPanel({
  settings,
  onSettingsChange,
}: ChartSettingsPanelProps<HierarchySettings>) {
  const getColumnNames = useDataLayer((s) => s.getColumnNames);
  const getColumnData = useDataLayer((s) => s.getColumnData);
  const getFieldLabel = useDataLayer((s) => s.getFieldLabel);
  const profiles = useDataLayer((s) => s.fieldProfiles);
  const calculations = useDataLayer((s) => s.calculations);

  const { levelFields, measureFields } = useMemo(() => {
    void calculations;
    const names = getColumnNames();
    return {
      // Numbers with many values make unreadable levels; keep categories and small sets.
      levelFields: names.filter((name) => {
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
  const used = new Set(settings.levels);

  const change = (next: Partial<HierarchySettings>) =>
    onSettingsChange({ ...settings, ...next });
  const setLevels = (levels: string[]) =>
    change({ levels, ...keepForLevels(settings, levels) });
  const move = (from: number, to: number) => {
    const next = settings.levels.slice();
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item!);
    setLevels(next);
  };

  return (
    <div className="space-y-2.5">
      <section className="space-y-2" aria-labelledby="hierarchy-levels-heading">
        <div className="flex items-baseline justify-between">
          <h5 id="hierarchy-levels-heading" className="text-sm font-medium">
            Levels, outermost first
          </h5>
          <span className="text-xs text-muted-foreground">
            {settings.levels.length} of {MAX_HIERARCHY_LEVELS}
          </span>
        </div>
        <ol className="space-y-1.5">
          {settings.levels.map((field, index) => {
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
                    placeholder={`Level ${index + 1}`}
                    value={field}
                    fields={levelFields.filter(
                      (name) => name === field || !used.has(name)
                    )}
                    onChange={(value) =>
                      setLevels(
                        settings.levels.map((item, position) =>
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
                  aria-label={`Move ${label} out`}
                  tooltip="Move this level one step out, so its values hold the ones below."
                  disabled={index === 0}
                  onClick={() => move(index, index - 1)}
                >
                  <ArrowUp />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  aria-label={`Move ${label} in`}
                  tooltip="Move this level one step in, so it splits the level above it."
                  disabled={index === settings.levels.length - 1}
                  onClick={() => move(index, index + 1)}
                >
                  <ArrowDown />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  aria-label={`Remove ${label}`}
                  tooltip="Remove this level."
                  disabled={settings.levels.length <= MIN_HIERARCHY_LEVELS}
                  onClick={() =>
                    setLevels(
                      settings.levels.filter(
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
        {settings.levels.length < MAX_HIERARCHY_LEVELS && (
          <FieldSelector
            label=""
            placeholder="Add a level"
            value=""
            fields={levelFields.filter((name) => !used.has(name))}
            onChange={(field) =>
              field && setLevels([...settings.levels, field])
            }
          />
        )}
        <p className="text-xs text-muted-foreground">
          Each value of a level is split by the values of the level below it.
        </p>
      </section>

      <div className="eda-setting-grid">
        <Label htmlFor="hierarchy-metric">Size</Label>
        <select
          id="hierarchy-metric"
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
          value={settings.aggregation}
          onChange={(event) => {
            const aggregation = event.target
              .value as HierarchySettings["aggregation"];
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

        <Label>Missing level</Label>
        <ToggleGroup
          type="single"
          size="sm"
          variant="outline"
          value={settings.missingLevels}
          onValueChange={(next) =>
            next &&
            change({
              missingLevels: next as HierarchySettings["missingLevels"],
            })
          }
          aria-label="Missing level"
          className="justify-start"
        >
          {(
            [
              [
                "omit",
                "Omit",
                "Rows missing any level are not drawn and are counted below the chart.",
              ],
              [
                "show",
                "Show",
                "Missing values become a (missing) box, so incomplete rows still count.",
              ],
            ] as const
          ).map(([option, text, help]) => (
            <ActionTooltip key={option} content={help}>
              <span className="inline-flex">
                <ToggleGroupItem value={option} className="px-2">
                  {text}
                </ToggleGroupItem>
              </span>
            </ActionTooltip>
          ))}
        </ToggleGroup>

        <ActionTooltip content="Each parent shows at most this many boxes, its largest. The rest join one gray Other box that lists its members.">
          <Label htmlFor="hierarchy-limit">Boxes per parent</Label>
        </ActionTooltip>
        <NumericInputEnter
          id="hierarchy-limit"
          value={settings.maxChildren ?? DEFAULT_MAX_CHILDREN}
          onChange={(value) =>
            change({
              maxChildren: Math.max(2, Math.min(30, Math.round(value))),
            })
          }
          min={2}
          max={30}
          stepSmall={1}
          stepMedium={5}
          stepLarge={10}
        />

        <Label>Color</Label>
        <ToggleGroup
          type="single"
          size="sm"
          variant="outline"
          value={settings.colorBy ?? "branch"}
          onValueChange={(next) =>
            next && change({ colorBy: next as HierarchySettings["colorBy"] })
          }
          aria-label="Color"
          className="justify-start"
        >
          {(
            [
              [
                "branch",
                "Branch",
                "Give each first-level value a color that everything inside it shares.",
              ],
              [
                "level",
                "Level",
                "Give each level its own color, so depth reads at a glance.",
              ],
              [
                "none",
                "One",
                "Draw every box in one color. Selections still stand out.",
              ],
            ] as const
          ).map(([option, text, help]) => (
            <ActionTooltip key={option} content={help}>
              <span className="inline-flex">
                <ToggleGroupItem value={option} className="px-2">
                  {text}
                </ToggleGroupItem>
              </span>
            </ActionTooltip>
          ))}
        </ToggleGroup>
      </div>
    </div>
  );
}
