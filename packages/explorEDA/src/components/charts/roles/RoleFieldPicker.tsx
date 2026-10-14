import { useEffect, useMemo, useRef, useState } from "react";
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
/** How long the highlight rests on a field before the chart previews it. */
const PREVIEW_DELAY = 120;

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
  onPreview,
}: {
  settings: ChartSettings;
  role: ChartRole;
  onChoose: (field: string | undefined) => void;
  /** Shows the highlighted field on the chart before it is chosen. */
  onPreview?: (field: string | undefined) => void;
}) {
  const spec = CHART_ROLES[role];
  // The field the picker opened on. A preview changes the chart's field,
  // but the list keeps marking where the chart started.
  const [current] = useState(() => spec.field(settings));
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
  const timer = useRef<number>(undefined);
  const previewed = useRef(false);
  const [value, setValue] = useState(current ?? NONE);
  // Hovering highlights a field without previewing it, so moving the
  // pointer to a field never flashes the others on the chart.
  const fromPointer = useRef(false);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const highlight = (value: string) => {
    setValue(value);
    window.clearTimeout(timer.current);
    if (!onPreview || fromPointer.current) return;
    const field =
      value === NONE
        ? undefined
        : fields.find((item) => item.toLowerCase() === value.toLowerCase());
    if (value !== NONE && !field) return;
    timer.current = window.setTimeout(() => {
      if (field === current && !previewed.current) return;
      previewed.current = true;
      onPreview(field);
    }, PREVIEW_DELAY);
  };
  const pick = (field: string | undefined) => {
    window.clearTimeout(timer.current);
    onChoose(field);
  };

  return (
    <Command
      className="eda-role-picker"
      value={value}
      filter={matchField}
      onValueChange={highlight}
      onKeyDown={() => (fromPointer.current = false)}
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
        onValueChange={() => (fromPointer.current = false)}
      />
      <CommandList
        className="max-h-72 overflow-y-auto"
        onPointerMove={() => (fromPointer.current = true)}
      >
        <CommandEmpty>No fields match.</CommandEmpty>
        {spec.optional && (
          <CommandItem
            value={NONE}
            keywords={["None"]}
            onSelect={() => pick(undefined)}
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
              onSelect={() => pick(field)}
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
