import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFilteredFieldProfiles } from "@/hooks/useFilteredFieldProfiles";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { FieldDragProvider } from "./FieldDragContext";
import { FieldListRow } from "./FieldListRow";

/** Case-insensitive match on the display label or the source name. */
export function matchesField(query: string, name: string, label: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return (
    label.toLowerCase().includes(needle) || name.toLowerCase().includes(needle)
  );
}

/**
 * Keeps the panel inside the viewport below the sticky workspace controls,
 * so the list scrolls instead of the page.
 */
function useAvailableHeight(anchor: RefObject<HTMLElement | null>) {
  const [height, setHeight] = useState<number>();
  useEffect(() => {
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const box = anchor.current?.getBoundingClientRect();
        if (!box) return;
        setHeight(Math.max(240, window.innerHeight - box.bottom - 16));
      });
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [anchor]);
  return height;
}

/** Below this width the list is a bottom sheet over the charts. */
const SHEET_QUERY = "(max-width: 640px)";

function useSheetLayout() {
  const [sheet, setSheet] = useState(
    () =>
      typeof window !== "undefined" && window.matchMedia?.(SHEET_QUERY).matches
  );
  useEffect(() => {
    const query = window.matchMedia?.(SHEET_QUERY);
    if (!query) return;
    const update = () => setSheet(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return Boolean(sheet);
}

export function FieldList({
  id,
  onClose,
  controlsRef,
  workspaceRef,
}: {
  id: string;
  onClose: (reason: "button" | "escape") => void;
  /** The sticky controls the panel hangs from. */
  controlsRef: RefObject<HTMLElement | null>;
  /** The workspace whose charts "Used in" entries point at. */
  workspaceRef: RefObject<HTMLElement | null>;
}) {
  const profiles = useFilteredFieldProfiles();
  const getFieldLabel = useDataLayer((state) => state.getFieldLabel);
  const data = useDataLayer((state) => state.data);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string>();
  const searchRef = useRef<HTMLLabelElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const headingId = useId();
  const height = useAvailableHeight(controlsRef);
  const sheet = useSheetLayout();

  useEffect(() => {
    // Touch screens would raise the keyboard, so focus the panel instead.
    const coarse = window.matchMedia?.("(pointer: coarse)").matches;
    const target = coarse
      ? panelRef.current
      : searchRef.current?.querySelector("input");
    target?.focus({ preventScroll: true });
  }, []);

  const shown = useMemo(
    () =>
      profiles.filter((profile) =>
        matchesField(query, profile.name, getFieldLabel(profile.name))
      ),
    [profiles, query, getFieldLabel]
  );
  const scopeRows = profiles[0]?.totalCount ?? data.length;

  return (
    <aside
      id={id}
      ref={panelRef}
      tabIndex={-1}
      className="eda-field-list"
      aria-labelledby={headingId}
      style={
        height ? { ["--eda-field-list-height" as string]: `${height}px` } : {}
      }
      onKeyDown={(event) => {
        // Nested menus and the inspector handle their own Escape first.
        if (event.key !== "Escape" || event.defaultPrevented) return;
        if (event.target instanceof HTMLInputElement && query) {
          event.preventDefault();
          setQuery("");
          return;
        }
        event.preventDefault();
        onClose("escape");
      }}
    >
      <div className="eda-field-list-head">
        <div className="eda-field-list-title">
          <h2 id={headingId}>Fields</h2>
          <span className="eda-field-list-count" aria-live="polite">
            {shown.length === profiles.length
              ? `${profiles.length.toLocaleString()} fields`
              : `${shown.length.toLocaleString()} of ${profiles.length.toLocaleString()}`}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="eda-field-list-close"
            aria-label="Close field list"
            tooltip="Close field list (F)"
            onClick={() => onClose("button")}
          >
            <X />
          </Button>
        </div>
        <label ref={searchRef} className="eda-field-list-search">
          <Search aria-hidden="true" />
          <span className="sr-only">Search fields</span>
          <Input
            type="search"
            value={query}
            placeholder="Search fields"
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <p className="eda-field-list-scope">
          Values describe {scopeRows.toLocaleString()} of{" "}
          {data.length.toLocaleString()} rows after chart filters
        </p>
      </div>
      {shown.length === 0 ? (
        <p className="eda-field-list-empty">
          No fields match “{query.trim()}”.
        </p>
      ) : (
        <FieldDragProvider workspaceRef={workspaceRef}>
          <ul className="eda-field-list-rows" aria-label="Fields">
            {shown.map((profile) => (
              <FieldListRow
                key={profile.name}
                profile={profile}
                label={getFieldLabel(profile.name)}
                expanded={expanded === profile.name}
                onExpandedChange={(open) =>
                  setExpanded(open ? profile.name : undefined)
                }
                workspaceRef={workspaceRef}
                inspectorSide={sheet ? "top" : "left"}
              />
            ))}
          </ul>
        </FieldDragProvider>
      )}
    </aside>
  );
}
