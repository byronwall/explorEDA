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
  const setFields = (fields: string[]) =>
    onSettingsChange({
      ...settings,
      fields,
      filters: settings.filters.filter(
        (filter) => filter.type !== "missingness-pattern"
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
      <p className="text-xs text-muted-foreground">
        Each pattern names the fields that are missing; every other field here
        is present. Changing the fields clears the selection.
      </p>
    </section>
  );
}
