import { useMemo } from "react";
import { Check } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { FieldOptionLabel } from "@/components/FieldSelector";
import {
  useDataLayer,
  useDataLayerSnapshot,
} from "@/providers/DataLayerProvider";
import { cn } from "@/lib/utils";
import type { ChartSettings } from "@/types/ChartTypes";
import { CHART_ROLES, type ChartRole } from "./chartRoles";

const NONE = "__eda-role-none";

/**
 * Matches the typed text inside a field's label or name. A match at the
 * start of a word ranks first; letters scattered across a name never match.
 */
export function matchField(value: string, search: string, keywords?: string[]) {
  const query = search.trim().toLowerCase();
  if (!query) return 1;
  const names =
    value === NONE ? (keywords ?? []) : [...(keywords ?? []), value];
  let best = 0;
  for (const name of names) {
    const text = name.toLowerCase();
    const at = text.indexOf(query);
    if (at === 0) return 1;
    if (at > 0)
      best = Math.max(best, /[\s_\-./(]/.test(text[at - 1]!) ? 0.8 : 0.5);
  }
  return best;
}

/**
 * Searches the fields for one chart role. Choosing a field is the change:
 * there is no Apply step. The current field starts highlighted.
 */
export function RoleFieldPicker({
  settings,
  role,
  onChoose,
}: {
  settings: ChartSettings;
  role: ChartRole;
  onChoose: (field: string | undefined) => void;
}) {
  const spec = CHART_ROLES[role];
  const current = spec.field(settings);
  const getColumnNames = useDataLayer((state) => state.getColumnNames);
  const getFieldLabel = useDataLayer((state) => state.getFieldLabel);
  const getState = useDataLayerSnapshot();
  // How many other charts color by each field, read once when the picker
  // opens. Choosing such a field joins their shared scale.
  const sharedBy = useMemo(() => {
    const counts = new Map<string, number>();
    for (const chart of getState().charts) {
      if (chart.id === settings.id || !chart.colorField) continue;
      counts.set(chart.colorField, (counts.get(chart.colorField) ?? 0) + 1);
    }
    return counts;
  }, [getState, settings.id]);
  const fields = getColumnNames();
  const currentShared = current ? (sharedBy.get(current) ?? 0) : 0;

  return (
    <Command
      className="eda-role-picker"
      defaultValue={current ?? NONE}
      filter={matchField}
      loop
    >
      <div className="eda-role-picker-scope">
        <span>{spec.scope(settings)}</span>
        {currentShared > 0 && current && (
          <span>
            Shared {getFieldLabel(current)} colors · also used by{" "}
            {currentShared} {currentShared === 1 ? "chart" : "charts"}
          </span>
        )}
      </div>
      <CommandInput
        placeholder={`${spec.label} by…`}
        aria-label={`Search fields for ${spec.label.toLowerCase()}`}
        autoFocus
      />
      <CommandList className="max-h-72 overflow-y-auto">
        <CommandEmpty>No fields match.</CommandEmpty>
        {spec.optional && (
          <CommandItem
            value={NONE}
            keywords={["None"]}
            onSelect={() => onChoose(undefined)}
          >
            <Check className={cn(current ? "opacity-0" : "opacity-100")} />
            <span className="text-muted-foreground">None</span>
          </CommandItem>
        )}
        {fields.map((field) => {
          const shared = sharedBy.get(field) ?? 0;
          return (
            <CommandItem
              key={field}
              value={field}
              keywords={[getFieldLabel(field)]}
              onSelect={() => onChoose(field)}
            >
              <Check
                className={cn(field === current ? "opacity-100" : "opacity-0")}
              />
              <span className="min-w-0 flex-1">
                <FieldOptionLabel field={field} />
              </span>
              {role === "color" && shared > 0 && field !== current && (
                <span className="eda-role-picker-shared">
                  {shared} {shared === 1 ? "chart" : "charts"}
                </span>
              )}
            </CommandItem>
          );
        })}
      </CommandList>
    </Command>
  );
}
