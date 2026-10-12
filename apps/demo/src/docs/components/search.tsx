import { cn } from "@/lib/utils";
import {
  CornerDownLeft,
  FileText,
  Hash,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import {
  createContext,
  Fragment,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { findPage } from "../catalogue";
import { docsPath } from "../paths";
import { searchDocs, type SearchEntry, type SearchHit } from "../search";
import { loadSearchEntries } from "../searchIndex";

const SearchContext = createContext<() => void>(() => undefined);

/** Opens the docs search from anywhere inside the docs frame. */
export function useOpenSearch() {
  return useContext(SearchContext);
}

/** "⌘" on Apple platforms, "Ctrl" elsewhere. */
export const searchModifier =
  typeof navigator !== "undefined" &&
  /Mac|iP(hone|ad|od)/.test(navigator.platform)
    ? "⌘"
    : "Ctrl";

/** Where to go when nothing is typed yet. */
const SUGGESTIONS: readonly SearchEntry[] = [
  {
    kind: "section",
    topic: "developers",
    anchor: "quick-start",
    title: "Quick start",
    context: "Developers",
    text: "",
  },
  ...["workspace", "filters", "scatter", "bar", "dashboard-text"].map(
    (topic): SearchEntry => ({
      kind: "page",
      topic,
      title: findPage(topic)?.title ?? topic,
      context: findPage(topic)?.summary ?? "",
      text: "",
    })
  ),
];

const GROUPS: readonly { kind: SearchEntry["kind"]; label: string }[] = [
  { kind: "page", label: "Pages" },
  { kind: "section", label: "Sections" },
  { kind: "setting", label: "Settings" },
];

/** `text` with every query word marked. */
function Highlight({ text, query }: { text: string; query: string }) {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (terms.length === 0) {
    return <>{text}</>;
  }
  const pattern = new RegExp(`(${terms.join("|")})`, "gi");
  return (
    <>
      {text.split(pattern).map((part, index) =>
        index % 2 === 1 ? (
          <mark
            key={index}
            className="rounded-sm bg-docs-accent/12 px-px text-foreground"
          >
            {part}
          </mark>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        )
      )}
    </>
  );
}

function EntryIcon({ entry }: { entry: SearchEntry }) {
  if (entry.kind === "setting") {
    return <SlidersHorizontal aria-hidden="true" className="size-4" />;
  }
  if (entry.kind === "section") {
    return <Hash aria-hidden="true" className="size-4" />;
  }
  const Icon = findPage(entry.topic)?.icon ?? FileText;
  return <Icon aria-hidden="true" className="size-4" />;
}

function SearchPalette({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<SearchEntry[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listId = useId();
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);

  useEffect(() => {
    input.current?.focus();
    let live = true;
    loadSearchEntries()
      .then((loaded) => live && setEntries(loaded))
      .catch(() => live && setFailed(true));
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      live = false;
      document.body.style.overflow = overflow;
    };
  }, []);

  const hits: SearchHit[] = useMemo(() => {
    if (!query.trim()) {
      return SUGGESTIONS.map((entry) => ({ entry, score: 0 }));
    }
    return entries ? searchDocs(entries, query) : [];
  }, [entries, query]);

  // Grouped by kind, the group with the best hit first; keys walk this order.
  const groups = useMemo(() => {
    if (!query.trim()) {
      return [{ kind: null, label: "Jump to", hits }];
    }
    return GROUPS.map(({ kind, label }) => ({
      kind,
      label,
      hits: hits.filter((hit) => hit.entry.kind === kind).slice(0, 12),
    }))
      .filter((group) => group.hits.length > 0)
      .sort((a, b) => b.hits[0]!.score - a.hits[0]!.score);
  }, [hits, query]);
  const ordered = useMemo(
    () => groups.flatMap((group) => group.hits),
    [groups]
  );

  useEffect(() => setActive(0), [query]);
  useEffect(() => {
    list.current
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const go = (hit: SearchHit | undefined) => {
    if (!hit) {
      return;
    }
    const { topic, anchor } = hit.entry;
    onClose();
    navigate(`${docsPath(topic)}${anchor ? `#${anchor}` : ""}`);
  };

  const optionId = (index: number) => `${listId}-${index}`;
  const searching = query.trim().length > 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[10vh]">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-foreground/25 backdrop-blur-[3px] dark:bg-black/60"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search the docs"
        className="relative flex max-h-[min(36rem,80vh)] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-2xl"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            onClose();
          } else if (event.key === "ArrowDown") {
            event.preventDefault();
            setActive((index) => Math.min(index + 1, ordered.length - 1));
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActive((index) => Math.max(index - 1, 0));
          } else if (event.key === "Enter") {
            event.preventDefault();
            go(ordered[active]);
          } else if (event.key === "Tab") {
            // The input is the only stop; keys move through the results.
            event.preventDefault();
          }
        }}
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search
            aria-hidden="true"
            className="size-5 shrink-0 text-muted-foreground"
          />
          <input
            ref={input}
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={
              ordered.length > 0 ? optionId(active) : undefined
            }
            aria-label="Search pages, sections, and settings"
            autoComplete="off"
            spellCheck={false}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search pages, sections, and settings"
            className="h-14 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden rounded border border-border bg-muted px-1.5 font-mono text-[0.7rem] text-muted-foreground sm:block">
            Esc
          </kbd>
        </div>
        <div
          ref={list}
          id={listId}
          role="listbox"
          aria-label="Results"
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2 [scrollbar-width:thin]"
        >
          {failed ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              Search could not load. Pick a page from the list instead.
            </p>
          ) : searching && !entries ? (
            <p
              role="status"
              className="px-3 py-8 text-center text-sm text-muted-foreground"
            >
              Building the index…
            </p>
          ) : searching && ordered.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              Nothing matches “{query}”. Try a chart name, a gesture such as
              “drag”, or a setting such as “binCount”.
            </p>
          ) : (
            groups.map(({ label, hits: groupHits }) => {
              const rows = groupHits.map((hit) => ({
                hit,
                index: ordered.indexOf(hit),
              }));
              return (
                <div key={label} role="group" aria-label={label}>
                  <p className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground first:pt-1">
                    {label}
                  </p>
                  {rows.map(({ hit, index }) => {
                    const selected = index === active;
                    const { entry } = hit;
                    return (
                      <div
                        key={`${entry.topic}#${entry.anchor ?? ""}-${entry.title}`}
                        id={optionId(index)}
                        role="option"
                        aria-selected={selected}
                        data-index={index}
                        onMouseMove={() => setActive(index)}
                        onClick={() => go(hit)}
                        className={cn(
                          "flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2.5",
                          selected && "bg-docs-accent/12"
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground",
                            selected && "text-docs-accent"
                          )}
                        >
                          <EntryIcon entry={entry} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-baseline gap-x-2">
                            <span
                              className={cn(
                                "font-medium text-foreground",
                                entry.kind === "setting" &&
                                  "font-mono text-[0.85rem]"
                              )}
                            >
                              <Highlight text={entry.title} query={query} />
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {entry.context}
                            </span>
                          </span>
                          {(hit.snippet ??
                            (entry.kind === "setting" ? entry.text : "")) && (
                            <span className="mt-0.5 line-clamp-2 block text-sm leading-snug text-muted-foreground">
                              <Highlight
                                text={
                                  hit.snippet ??
                                  (entry.kind === "setting" ? entry.text : "")
                                }
                                query={query}
                              />
                            </span>
                          )}
                        </span>
                        {selected && (
                          <CornerDownLeft
                            aria-hidden="true"
                            className="mt-1.5 size-4 shrink-0 text-muted-foreground"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
        <div className="hidden items-center gap-4 border-t border-border bg-muted/40 px-4 py-2 text-xs text-muted-foreground sm:flex">
          <span className="flex items-center gap-1.5">
            <kbd className="rounded border border-border bg-background px-1 font-mono">
              ↑
            </kbd>
            <kbd className="rounded border border-border bg-background px-1 font-mono">
              ↓
            </kbd>
            to move
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="rounded border border-border bg-background px-1 font-mono">
              Enter
            </kbd>
            to open
          </span>
          <span className="ml-auto">
            {entries
              ? `${entries.length.toLocaleString()} pages, sections, and settings`
              : ""}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Holds the search palette for the docs frame and opens it with ⌘K, Ctrl+K,
 * or "/" when no field has focus.
 */
export function SearchProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const typing = target?.closest(
        "input, textarea, select, [contenteditable=true]"
      );
      const commandK =
        (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (commandK || (event.key === "/" && !typing && !event.metaKey)) {
        // A live example's workspace keeps its own keys while it has focus.
        if (!commandK && target?.closest("[data-docs-live]")) {
          return;
        }
        event.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  return (
    <SearchContext.Provider value={() => setOpen(true)}>
      {children}
      {open && <SearchPalette onClose={() => setOpen(false)} />}
    </SearchContext.Provider>
  );
}

/** The button that opens search: a wide field, or an icon on narrow screens. */
export function SearchButton({ className }: { className?: string }) {
  const open = useOpenSearch();
  return (
    <button
      type="button"
      onClick={open}
      aria-label="Search the docs"
      aria-keyshortcuts="Meta+K Control+K /"
      className={cn(
        "group flex h-9 items-center gap-2 rounded-lg border border-input bg-background px-3 text-sm text-muted-foreground transition-colors hover:border-docs-accent/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      <Search aria-hidden="true" className="size-4 shrink-0" />
      <span className="flex-1 text-left">Search the docs</span>
      <kbd className="hidden rounded border border-border bg-muted px-1.5 font-mono text-[0.7rem] sm:inline">
        {searchModifier} K
      </kbd>
    </button>
  );
}
