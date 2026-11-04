import { useMemo } from "react";
import { X } from "lucide-react";
import { FieldSelector } from "@/components/FieldSelector";
import { Button } from "@/components/ui/button";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { ChartSettingsPanelProps } from "@/types/ChartTypes";
import type { JointMissingnessSettings } from "./definition";
import {
  MAX_MISSINGNESS_FIELDS,
  MIN_MISSINGNESS_FIELDS,
} from "./jointMissingnessPlan";

export function JointMissingnessSettingsPanel({
  settings,
  onSettingsChange,
}: ChartSettingsPanelProps<JointMissingnessSettings>) {
  const getColumnNames = useDataLayer((s) => s.getColumnNames);
  const getFieldLabel = useDataLayer((s) => s.getFieldLabel);
  const calculations = useDataLayer((s) => s.calculations);
  const allFields = useMemo(() => {
    void calculations;
    return getColumnNames();
  }, [calculations, getColumnNames]);
  const used = new Set(settings.fields);

  // A changed field set changes what every pattern means, so the selection
  // clears with it.
  // The input rule stays while its fields are all still chosen.
  const setFields = (fields: string[]) => {
    const keepsRule = settings.eligibility?.fields.every((field) =>
      fields.includes(field)
    );
    onSettingsChange({
      ...settings,
      fields,
      eligibility: keepsRule ? settings.eligibility : undefined,
      filters: settings.filters.filter(
        (filter) =>
          filter.type !== "missingness-pattern" &&
          (keepsRule || filter.type !== "missingness-inputs")
      ),
    });
  };
  const rule = settings.eligibility ?? {
    fields: [],
    requirement: "present" as const,
  };
  const setRule = (next: typeof rule) =>
    onSettingsChange({
      ...settings,
      eligibility: next.fields.length ? next : undefined,
      filters: next.fields.length
        ? settings.filters
        : settings.filters.filter(
            (filter) => filter.type !== "missingness-inputs"
          ),
    });

  return (
    <section className="space-y-2" aria-labelledby="missingness-fields-heading">
      <div className="flex items-baseline justify-between">
        <h5 id="missingness-fields-heading" className="text-sm font-medium">
          Fields
        </h5>
        <span className="text-xs text-muted-foreground">
          {settings.fields.length} of {MAX_MISSINGNESS_FIELDS}
        </span>
      </div>
      <ol className="space-y-1.5">
        {settings.fields.map((field, index) => (
          <li
            key={`${field}-${index}`}
            className="flex min-w-0 items-center gap-1"
          >
            <div className="min-w-0 flex-1">
              <FieldSelector
                label=""
                placeholder={`Field ${index + 1}`}
                value={field}
                fields={allFields.filter(
                  (item) => item === field || !used.has(item)
                )}
                onChange={(next) =>
                  setFields(
                    settings.fields.map((item, position) =>
                      position === index ? next : item
                    )
                  )
                }
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              aria-label={`Remove ${getFieldLabel(field)}`}
              tooltip="Remove this field. The pattern selection clears."
              disabled={settings.fields.length <= MIN_MISSINGNESS_FIELDS}
              onClick={() =>
                setFields(
                  settings.fields.filter((_, position) => position !== index)
                )
              }
            >
              <X />
            </Button>
          </li>
        ))}
      </ol>
      {settings.fields.length < MAX_MISSINGNESS_FIELDS && (
        <FieldSelector
          label=""
          placeholder="Add a field"
          value=""
          fields={allFields.filter((field) => !used.has(field))}
          onChange={(field) => field && setFields([...settings.fields, field])}
        />
      )}
      <div className="space-y-1 pt-1">
        <h5 className="text-sm font-medium">Inputs a later step needs</h5>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {settings.fields.map((field) => (
            <label key={field} className="flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                checked={rule.fields.includes(field)}
                onChange={(event) =>
                  setRule({
                    ...rule,
                    fields: event.target.checked
                      ? settings.fields.filter(
                          (item) => item === field || rule.fields.includes(item)
                        )
                      : rule.fields.filter((item) => item !== field),
                  })
                }
              />
              {getFieldLabel(field)}
            </label>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm">
          Usable rows
          <select
            className="h-8 min-w-0 rounded-md border border-input bg-background px-2 text-sm"
            value={rule.requirement}
            disabled={!rule.fields.length}
            onChange={(event) =>
              setRule({
                ...rule,
                requirement: event.target.value as "present" | "finite",
              })
            }
          >
            <option value="present">Have values</option>
            <option value="finite">Have finite numbers</option>
          </select>
        </label>
        <p className="text-xs text-muted-foreground">
          The chart counts the rows that have every checked input, and lets you
          select them or the rows they leave out.
        </p>
      </div>
      <div className="space-y-1 pt-1">
        <h5 className="text-sm font-medium">Compare groups</h5>
        <div className="flex min-w-0 items-center gap-1">
          <div className="min-w-0 flex-1">
            <FieldSelector
              label=""
              placeholder="No groups"
              value={settings.groupField ?? ""}
              fields={allFields}
              onChange={(groupField) =>
                onSettingsChange({
                  ...settings,
                  groupField: groupField || undefined,
                })
              }
            />
          </div>
          {settings.groupField && (
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              aria-label="Stop comparing groups"
              tooltip="Remove the group columns."
              onClick={() =>
                onSettingsChange({ ...settings, groupField: undefined })
              }
            >
              <X />
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Each group gets a column with every pattern&apos;s share of that
          group&apos;s rows. The eight largest groups get their own column; the
          rest share one.
        </p>
      </div>
      <p className="text-xs text-muted-foreground">
        Each pattern names the fields that are missing; every other field here
        is present. Changing the fields clears the selection.
      </p>
    </section>
  );
}
