import { useEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { ColumnFilter } from "@/components/charts/DataTable/components/ColumnFilter";
import { FieldMetadata, resolveFieldProfile } from "@/components/FieldMetadata";
import { useFilteredFieldProfiles } from "@/hooks/useFilteredFieldProfiles";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { datum } from "@/types/FilterTypes";
import { Button } from "./ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";

/**
 * The body of the workspace filter popover: pick a field, then set its
 * filter with the control the column filters and the Filters tab use.
 * Every change applies at once.
 */
export function WorkspaceFilterEditor({
  field,
  onFieldChange,
}: {
  /** The field being filtered. Undefined shows the field list. */
  field: string | undefined;
  onFieldChange: (field: string | undefined) => void;
}) {
  return field ? (
    <FieldFilter field={field} onBack={() => onFieldChange(undefined)} />
  ) : (
    <FieldList onPick={onFieldChange} />
  );
}

function FieldList({ onPick }: { onPick: (field: string) => void }) {
  const getColumnNames = useDataLayer((state) => state.getColumnNames);
  const getFieldLabel = useDataLayer((state) => state.getFieldLabel);
  const fieldProfiles = useDataLayer((state) => state.fieldProfiles);
  const getColumnData = useDataLayer((state) => state.getColumnData);
  return (
    <Command
      className="eda-workspace-filter-fields"
      // Picking a field with Enter must not reach the workspace's own keys.
      onKeyDown={(event) => event.key === "Enter" && event.stopPropagation()}
    >
      <CommandInput placeholder="Filter by field" />
      <CommandList className="max-h-72 overflow-y-auto">
        <CommandEmpty>No fields match.</CommandEmpty>
        {getColumnNames().map((name) => (
          <CommandItem
            key={name}
            value={`${getFieldLabel(name)} ${name}`}
            onSelect={() => onPick(name)}
          >
            <FieldMetadata
              profile={resolveFieldProfile(name, fieldProfiles, getColumnData)}
              label={getFieldLabel(name)}
              compact
              showTooltip={false}
            />
          </CommandItem>
        ))}
      </CommandList>
    </Command>
  );
}

function FieldFilter({ field, onBack }: { field: string; onBack: () => void }) {
  const filter = useDataLayer((state) =>
    state.workspaceFilters.find((item) => item.field === field)
  );
  const setWorkspaceFilter = useDataLayer((state) => state.setWorkspaceFilter);
  const fieldProfiles = useDataLayer((state) => state.fieldProfiles);
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const getFieldLabel = useDataLayer((state) => state.getFieldLabel);
  const formatFieldValue = useDataLayer((state) => state.formatFieldValue);
  const [distribution] = useFilteredFieldProfiles(undefined, true, [field]);
  const profile = resolveFieldProfile(field, fieldProfiles, getColumnData);
  const label = getFieldLabel(field);
  const ref = useRef<HTMLDivElement>(null);
  // The field list goes away on a pick, so focus moves to the control.
  useEffect(() => {
    ref.current
      ?.querySelector<HTMLElement>(
        "input:not([disabled]), select, [role='slider'], [role='checkbox']"
      )
      ?.focus();
  }, [field]);

  return (
    <div ref={ref} className="eda-workspace-filter-field grid gap-2">
      {!filter && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 justify-self-start px-1.5 text-xs text-muted-foreground"
          tooltip="Go back to the field list"
          onClick={onBack}
        >
          <ArrowLeft aria-hidden="true" />
          Fields
        </Button>
      )}
      {profile ? (
        <ColumnFilter
          columnId={field}
          columnLabel={label}
          profile={profile}
          distribution={distribution}
          format={(value) => formatFieldValue(field, value as datum)}
          filter={filter}
          onChange={(_id, next) => setWorkspaceFilter(field, next)}
          onClear={() => setWorkspaceFilter(field)}
        />
      ) : (
        <p className="text-xs text-muted-foreground">
          This field is no longer in the data.
        </p>
      )}
    </div>
  );
}
