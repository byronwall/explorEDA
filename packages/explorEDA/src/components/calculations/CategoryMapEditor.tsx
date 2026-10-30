/*
 * Map categories: pick a field's values, merge them into new names, and see
 * every output category with its members and rows before applying. The
 * result is one recode() calculation; Cancel and the draft change nothing.
 */
import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ActionTooltip } from "@/components/ui/tooltip";
import { parseExpression } from "@/lib/calculations/parser/semantics";
import {
  categoryLiteral,
  categoryOf,
  readRecode,
  recodeLookup,
  recodeText,
  type CategoryValue,
  type Recode,
} from "@/lib/calculations/recode";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { cn } from "@/lib/utils";

/** What the editor opens on: a field, a saved calculation, or draft text. */
export interface CategoryMapTarget {
  field?: string;
  /** A saved calculation to edit. */
  name?: string;
  /** recode() text to start from, such as a formula draft. */
  text?: string;
}

const PAGE = 200;
const ROW_PAGE = 50;

/** A key that keeps 1, "1", true, and "true" apart. */
const keyOf = (value: CategoryValue) =>
  value === null ? "null" : `${typeof value}:${String(value)}`;

/** A value's name for screen readers: text quoted, so edge spaces show. */
const labelOf = (value: CategoryValue) =>
  value === null
    ? "missing"
    : typeof value === "string"
      ? `“${value}”`
      : String(value);

/** A value as the data holds it: text quoted, missing as null. */
export function CategoryChip({ value }: { value: CategoryValue }) {
  if (value === null) return <span className="eda-null">null</span>;
  if (typeof value === "string") {
    return (
      <span className="eda-catmap-value" data-type="text">
        “{value}”
      </span>
    );
  }
  return (
    <span className="eda-catmap-value" data-type={typeof value}>
      {String(value)}
    </span>
  );
}

interface ValueCount {
  value: CategoryValue;
  count: number;
}

export function CategoryMapDialog({
  target,
  onClose,
  onEditFormula,
}: {
  target: CategoryMapTarget | undefined;
  onClose: () => void;
  onEditFormula: (
    name: string | undefined,
    draft: { name: string; expression: string }
  ) => void;
}) {
  return (
    <Dialog open={Boolean(target)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="eda-calc-editor eda-catmap">
        {target && (
          <CategoryMapForm
            target={target}
            onClose={onClose}
            onEditFormula={onEditFormula}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function CategoryMapForm({
  target,
  onClose,
  onEditFormula,
}: {
  target: CategoryMapTarget;
  onClose: () => void;
  onEditFormula: (
    name: string | undefined,
    draft: { name: string; expression: string }
  ) => void;
}) {
  const calculations = useDataLayer((state) => state.calculations);
  const data = useDataLayer((state) => state.data);
  const getColumnNames = useDataLayer((state) => state.getColumnNames);
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const getFieldLabel = useDataLayer((state) => state.getFieldLabel);
  const addCalculation = useDataLayer((state) => state.addCalculation);
  const updateCalculation = useDataLayer((state) => state.updateCalculation);

  const saved = calculations.find(
    (calc) => calc.resultColumnName === target.name
  );
  const initial = useMemo(
    () =>
      readRecode(target.text ?? saved?.expression.rawInput ?? "") ?? undefined,
    // The draft starts once, when the editor opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const fields = getColumnNames().filter((field) => field !== target.name);
  const [field, setField] = useState(
    initial?.field ?? target.field ?? fields[0] ?? ""
  );
  const [name, setName] = useState(() => {
    if (target.name) return target.name;
    const base = `${getFieldLabel(field)} group`;
    const taken = new Set(getColumnNames());
    let next = base;
    for (let index = 2; taken.has(next); index += 1) next = `${base} ${index}`;
    return next;
  });
  const [targets, setTargets] = useState(
    () =>
      new Map<string, { source: CategoryValue; target: string | null }>(
        (initial?.entries ?? []).map((entry) => [keyOf(entry.source), entry])
      )
  );
  const [fallback, setFallback] = useState<Recode["fallback"]>(
    initial?.fallback
  );
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(new Set<string>());
  const [merge, setMerge] = useState("");
  const [shown, setShown] = useState(PAGE);
  const [error, setError] = useState("");

  // Every row's value, read once per field.
  const column = useMemo(() => getColumnData(field), [getColumnData, field]);
  const rows = useMemo(
    () =>
      data.map((row) => ({
        id: row.__ID,
        value: categoryOf(column[row.__ID] ?? null),
      })),
    [data, column]
  );
  const inventory = useMemo(() => {
    const counts = new Map<string, ValueCount>();
    for (const row of rows) {
      if (row.value === undefined) continue;
      const key = keyOf(row.value);
      const item = counts.get(key);
      if (item) item.count += 1;
      else counts.set(key, { value: row.value, count: 1 });
    }
    // Saved entries stay listed when no row holds their value now.
    for (const [key, entry] of targets) {
      if (!counts.has(key)) counts.set(key, { value: entry.source, count: 0 });
    }
    return [...counts.values()].sort((a, b) => b.count - a.count);
    // Entries added in this draft come from listed values already.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);
  const unmappable = rows.filter((row) => row.value === undefined).length;

  const recode: Recode = {
    field,
    entries: inventory.flatMap((item) => {
      const entry = targets.get(keyOf(item.value));
      return entry ? [entry] : [];
    }),
    ...(fallback ? { fallback } : {}),
  };
  const map = recodeLookup(recode);
  const groups = useMemo(() => {
    const byOutput = new Map<
      string,
      { output: CategoryValue; count: number; members: ValueCount[] }
    >();
    for (const item of inventory) {
      if (!item.count) continue;
      const output = map(item.value);
      const key = keyOf(output);
      const group = byOutput.get(key) ?? { output, count: 0, members: [] };
      group.count += item.count;
      group.members.push(item);
      byOutput.set(key, group);
    }
    return [...byOutput.values()].sort((a, b) => b.count - a.count);
    // map is rebuilt from targets and fallback each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inventory, targets, fallback]);

  const query = search.trim().toLowerCase();
  const matches = query
    ? inventory.filter((item) =>
        String(item.value ?? "null")
          .toLowerCase()
          .includes(query)
      )
    : inventory;
  const visible = matches.slice(0, shown);
  const allShown =
    visible.length > 0 &&
    visible.every((item) => selected.has(keyOf(item.value)));

  const setTarget = (value: CategoryValue, next: string | null | undefined) =>
    setTargets((previous) => {
      const copy = new Map(previous);
      if (next === undefined) copy.delete(keyOf(value));
      else copy.set(keyOf(value), { source: value, target: next });
      return copy;
    });
  const toggle = (value: CategoryValue) =>
    setSelected((previous) => {
      const copy = new Set(previous);
      const key = keyOf(value);
      if (copy.has(key)) copy.delete(key);
      else copy.add(key);
      return copy;
    });
  const mergeSelected = () => {
    const into = merge;
    setTargets((previous) => {
      const copy = new Map(previous);
      for (const item of inventory) {
        const key = keyOf(item.value);
        if (selected.has(key)) {
          copy.set(key, { source: item.value, target: into });
        }
      }
      return copy;
    });
    setSelected(new Set());
    setMerge("");
  };

  const text = recodeText(recode);
  const unwritable = recode.entries.some(
    (entry) => categoryLiteral(entry.source) === undefined
  );
  const canApply =
    Boolean(field && name.trim()) &&
    recode.entries.length + (fallback ? 1 : 0) > 0 &&
    !unwritable &&
    text !== saved?.expression.rawInput.trim();
  const apply = async () => {
    if (!canApply) return;
    try {
      const calculation = {
        resultColumnName: name.trim(),
        expression: parseExpression(text),
      };
      if (saved) updateCalculation(saved.resultColumnName, calculation);
      else await addCalculation(calculation);
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    }
  };

  const mapped = recode.entries.length;
  const outputs = groups.length;
  const inputs = inventory.filter((item) => item.count > 0).length;

  return (
    <form
      className="eda-calc-form"
      onSubmit={(event) => {
        event.preventDefault();
        void apply();
      }}
    >
      <DialogHeader className="eda-calc-editor-header">
        <DialogTitle>Map categories</DialogTitle>
        <DialogDescription className="sr-only">
          Merge a field's categories into new names. Apply saves one calculated
          field; the original field keeps its values.
        </DialogDescription>
      </DialogHeader>
      <div className="eda-catmap-settings">
        <div className="eda-setting-grid">
          <Label htmlFor="catmap-field">Field</Label>
          <Select
            value={field}
            onValueChange={(next) => {
              setField(next);
              setTargets(new Map());
              setSelected(new Set());
              setShown(PAGE);
            }}
          >
            <SelectTrigger id="catmap-field" aria-label="Field to map">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fields.map((item) => (
                <SelectItem key={item} value={item}>
                  {getFieldLabel(item)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Label htmlFor="catmap-name">New field</Label>
          <Input
            id="catmap-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <span id="catmap-unmatched-label" className="eda-catmap-label">
            Unmatched
          </span>
          <div className="eda-catmap-unmatched">
            <div
              role="radiogroup"
              aria-labelledby="catmap-unmatched-label"
              className="eda-catmap-segment"
            >
              <ActionTooltip content="Values without a target keep their category.">
                <button
                  type="button"
                  role="radio"
                  aria-checked={!fallback}
                  onClick={() => setFallback(undefined)}
                >
                  Keep
                </button>
              </ActionTooltip>
              <ActionTooltip content="Every value without a target, missing too, becomes one category.">
                <button
                  type="button"
                  role="radio"
                  aria-checked={Boolean(fallback)}
                  onClick={() => setFallback(fallback ?? { value: "Other" })}
                >
                  Replace
                </button>
              </ActionTooltip>
            </div>
            {fallback && (
              <Input
                aria-label="Category for unmatched values"
                value={fallback.value ?? ""}
                onChange={(event) => setFallback({ value: event.target.value })}
              />
            )}
          </div>
        </div>
      </div>

      <div className="eda-catmap-grid">
        <section className="eda-catmap-values" aria-label="Values">
          <div className="eda-catmap-toolbar">
            <Input
              type="search"
              aria-label="Search values"
              placeholder={`Search ${inputs.toLocaleString()} values…`}
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setShown(PAGE);
              }}
            />
          </div>
          <div
            className="eda-catmap-merge"
            data-active={selected.size > 0 || undefined}
          >
            <span>
              {selected.size
                ? `${selected.size.toLocaleString()} selected`
                : "Select to merge"}
            </span>
            <Input
              aria-label="Merge selected into"
              placeholder="Merge into…"
              value={merge}
              onChange={(event) => setMerge(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  if (selected.size && merge.trim()) mergeSelected();
                }
              }}
            />
            <Button
              type="button"
              size="sm"
              disabled={!selected.size || !merge.trim()}
              onClick={mergeSelected}
            >
              Merge
            </Button>
          </div>
          <table className="eda-catmap-table">
            <thead>
              <tr>
                <th className="eda-catmap-check">
                  <input
                    type="checkbox"
                    aria-label="Select shown values"
                    checked={allShown}
                    onChange={() =>
                      setSelected((previous) => {
                        const copy = new Set(previous);
                        for (const item of visible) {
                          const key = keyOf(item.value);
                          if (allShown) copy.delete(key);
                          else copy.add(key);
                        }
                        return copy;
                      })
                    }
                  />
                </th>
                <th>Value</th>
                <th className="eda-catmap-count">Rows</th>
                <th>Becomes</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((item) => {
                const key = keyOf(item.value);
                const entry = targets.get(key);
                const label = labelOf(item.value);
                return (
                  <tr key={key} data-mapped={entry ? "" : undefined}>
                    <td className="eda-catmap-check">
                      <input
                        type="checkbox"
                        aria-label={`Select ${label}`}
                        checked={selected.has(key)}
                        onChange={() => toggle(item.value)}
                      />
                    </td>
                    <td>
                      <CategoryChip value={item.value} />
                    </td>
                    <td className="eda-catmap-count">
                      {item.count.toLocaleString()}
                    </td>
                    <td>
                      <TargetCell
                        label={label}
                        value={item.value}
                        entry={entry}
                        fallback={fallback}
                        onChange={(next) => setTarget(item.value, next)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!matches.length && (
            <p className="eda-calc-help eda-catmap-note">
              No values match “{search}”.
            </p>
          )}
          {matches.length > visible.length && (
            <div className="eda-catmap-note">
              <span className="eda-calc-help">
                First {visible.length.toLocaleString()} of{" "}
                {matches.length.toLocaleString()} shown.
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShown((count) => count + PAGE)}
              >
                Show {PAGE} more
              </Button>
            </div>
          )}
          {unmappable > 0 && (
            <p className="eda-calc-help eda-catmap-note">
              {unmappable.toLocaleString()} rows hold dates or other values that
              can't be mapped; they keep their value.
            </p>
          )}
        </section>

        <section
          className="eda-catmap-preview"
          aria-labelledby="catmap-preview"
        >
          <h3 id="catmap-preview" className="eda-catmap-heading">
            Result
            <span>
              {inputs.toLocaleString()} → {outputs.toLocaleString()} categories
            </span>
          </h3>
          <ul className="eda-catmap-groups">
            {groups.slice(0, PAGE).map((group) => (
              <OutputGroup
                key={keyOf(group.output)}
                group={group}
                rows={rows}
                map={map}
                field={getFieldLabel(field)}
              />
            ))}
          </ul>
          {groups.length > PAGE && (
            <p className="eda-calc-help eda-catmap-note">
              First {PAGE} of {groups.length.toLocaleString()} categories shown,
              largest first.
            </p>
          )}
        </section>
      </div>

      <footer className="eda-calc-editor-footer">
        <div className="min-w-0">
          <p>
            {mapped.toLocaleString()} {mapped === 1 ? "value" : "values"} mapped
            {fallback ? " · others replaced" : " · others kept"}
          </p>
          {error ? (
            <p role="alert" className="eda-calc-error">
              <CircleAlert aria-hidden="true" size={14} />
              <span>{error}</span>
            </p>
          ) : (
            <p className="eda-calc-help">
              Draft only. Apply adds {name.trim() || "the field"} as one
              calculation; {getFieldLabel(field)} keeps its values.
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() =>
              onEditFormula(saved?.resultColumnName, {
                name,
                expression: text,
              })
            }
          >
            Edit as formula
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!canApply}>
            Apply
          </Button>
        </div>
      </footer>
    </form>
  );
}

/** A value's target: empty keeps it, text renames it, missing clears it. */
function TargetCell({
  label,
  value,
  entry,
  fallback,
  onChange,
}: {
  label: string;
  value: CategoryValue;
  entry: { target: string | null } | undefined;
  fallback: Recode["fallback"];
  onChange: (next: string | null | undefined) => void;
}) {
  const missing = entry?.target === null;
  const placeholder = fallback
    ? fallback.value === null
      ? "missing"
      : fallback.value
    : value === null
      ? "missing"
      : String(value);
  return (
    <div className="eda-catmap-target">
      <Input
        aria-label={`New category for ${label}`}
        value={missing ? "" : (entry?.target ?? "")}
        placeholder={missing ? "missing" : placeholder}
        className={cn(missing && "eda-catmap-missing")}
        onChange={(event) =>
          onChange(event.target.value === "" ? undefined : event.target.value)
        }
      />
      <ActionTooltip
        content={
          missing ? "Keep a category instead" : "Make these rows missing"
        }
      >
        <button
          type="button"
          className="eda-catmap-null"
          aria-label={`Make ${label} missing`}
          aria-pressed={missing}
          onClick={() => onChange(missing ? undefined : null)}
        >
          null
        </button>
      </ActionTooltip>
    </div>
  );
}

function OutputGroup({
  group,
  rows,
  map,
  field,
}: {
  group: { output: CategoryValue; count: number; members: ValueCount[] };
  rows: { id: number; value: CategoryValue | undefined }[];
  map: (value: CategoryValue) => CategoryValue;
  field: string;
}) {
  const [open, setOpen] = useState(false);
  const [limit, setLimit] = useState(ROW_PAGE);
  const merged = group.members.length > 1;
  const changed = group.members.some(
    (member) => keyOf(member.value) !== keyOf(group.output)
  );
  const members = open
    ? rows.filter(
        (row) =>
          row.value !== undefined &&
          keyOf(map(row.value)) === keyOf(group.output)
      )
    : [];
  return (
    <li className="eda-catmap-group" data-changed={changed || undefined}>
      <button
        type="button"
        className="eda-catmap-group-head"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {open ? (
          <ChevronDown aria-hidden="true" className="eda-catmap-chevron" />
        ) : (
          <ChevronRight aria-hidden="true" className="eda-catmap-chevron" />
        )}
        <CategoryChip value={group.output} />
        <span className="eda-catmap-count">
          {group.count.toLocaleString()} rows
        </span>
      </button>
      {(merged || changed) && (
        <p className="eda-catmap-members">
          {group.members.map((member) => (
            <span key={keyOf(member.value)}>
              <CategoryChip value={member.value} />
              <span className="eda-catmap-member-count">
                {member.count.toLocaleString()}
              </span>
            </span>
          ))}
        </p>
      )}
      {open && (
        <div className="eda-catmap-rows">
          <table>
            <thead>
              <tr>
                <th className="eda-catmap-count">Row</th>
                <th>{field}</th>
              </tr>
            </thead>
            <tbody>
              {members.slice(0, limit).map((row) => (
                <tr key={row.id}>
                  <td className="eda-catmap-count">
                    {(row.id + 1).toLocaleString()}
                  </td>
                  <td>
                    <CategoryChip value={row.value as CategoryValue} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {members.length > limit && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setLimit((count) => count + ROW_PAGE)}
            >
              Show {Math.min(ROW_PAGE, members.length - limit)} more of{" "}
              {(members.length - limit).toLocaleString()}
            </Button>
          )}
        </div>
      )}
    </li>
  );
}
