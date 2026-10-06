import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  ArrowRight,
  Filter,
  LayoutGrid,
  Minus,
  Move,
  Pencil,
  Plus,
  Rows3,
  Share2,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  buildTimeline,
  describeEntry,
  formatClock,
  LABEL_NAMES,
  summarizeTabs,
  type ChangeKind,
  type DescribedEntry,
  type HistoryChange,
  type RailMerge,
  type RailSegment,
  type TimelineRow,
  type TimelineState,
} from "./savedViewsHistory";
import {
  HISTORY_LIMIT,
  type ChangeLabel,
  type SavedViewsSession,
} from "./savedViewsSession";

const LANE_WIDTH = 14;
const RAIL_PAD = 12;
/** The station's center, measured from the row's top edge. */
const STATION_Y = 19;

const LABEL_COLORS: Record<ChangeLabel, string> = {
  View: "var(--chart-2)",
  Filter: "var(--chart-5)",
  Both: "var(--chart-1)",
  Shared: "var(--chart-3)",
};

const KIND_ICONS: Record<ChangeKind, LucideIcon> = {
  view: LayoutGrid,
  "chart-add": Plus,
  "chart-remove": Minus,
  "chart-edit": Pencil,
  layout: Move,
  filter: Filter,
  rows: Rows3,
  shared: Share2,
};

const STATE_NOTES: Record<TimelineState, string | undefined> = {
  past: undefined,
  current: "Current",
  future: "Undone",
  branch: "Replaced",
};

const laneX = (lane: number) => RAIL_PAD + lane * LANE_WIDTH;

function lineColor(state: TimelineState) {
  return state === "branch"
    ? "color-mix(in oklab, var(--muted-foreground) 45%, transparent)"
    : "var(--primary)";
}

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

function formatWhen(at: string, now: number) {
  const date = new Date(at);
  if (isSameDay(date, new Date(now))) {
    return formatClock(at);
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function formatRelative(at: string, now: number) {
  const seconds = Math.max(0, Math.round((now - Date.parse(at)) / 1000));
  if (seconds < 45) {
    return "just now";
  }
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min ago`;
  }
  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${hours} h ago`;
  }
  const days = Math.round(hours / 24);
  return days === 1 ? "yesterday" : `${days} days ago`;
}

function formatFull(at: string) {
  const date = new Date(at);
  return `${date.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  })}, ${formatClock(at, true)}`;
}

function Rail({
  row,
  laneCount,
  label,
  previewing,
}: {
  row: TimelineRow;
  laneCount: number;
  label: ChangeLabel;
  previewing: boolean;
}) {
  const width = laneX(laneCount - 1) + RAIL_PAD;
  const x = laneX(row.lane);
  const current = row.state === "current";
  const size = current ? 15 : 11;
  return (
    <div aria-hidden="true" className="relative shrink-0" style={{ width }}>
      {row.segments.map((segment: RailSegment) => (
        <span
          key={`${segment.lane}-${segment.state}`}
          className="absolute w-0"
          style={{
            left: laneX(segment.lane) - 1,
            top: segment.above ? 0 : STATION_Y,
            bottom: segment.below ? 0 : undefined,
            height: segment.below ? undefined : STATION_Y,
            borderLeft: `2px ${segment.state === "future" ? "dashed" : "solid"} ${lineColor(segment.state)}`,
          }}
        />
      ))}
      {row.merges.length > 0 && (
        <svg
          className="absolute left-0 top-0 overflow-visible"
          width={width}
          height={STATION_Y}
          fill="none"
        >
          {row.merges.map((merge: RailMerge) => {
            const from = laneX(merge.fromLane);
            return (
              <path
                key={`${merge.fromLane}-${merge.state}`}
                d={`M ${from} 0 C ${from} ${STATION_Y * 0.75}, ${x} ${STATION_Y * 0.25}, ${x} ${STATION_Y}`}
                stroke={lineColor(merge.state)}
                strokeWidth={2}
                strokeDasharray={merge.state === "future" ? "4 3" : undefined}
              />
            );
          })}
        </svg>
      )}
      <span
        className={cn(
          "absolute rounded-full border-2 bg-background transition-shadow",
          current &&
            "shadow-[0_0_0_4px_color-mix(in_oklab,var(--primary)_18%,transparent)]",
          previewing &&
            "shadow-[0_0_0_3px_var(--background),0_0_0_5px_var(--foreground)]",
          row.state === "future" && "border-dashed"
        )}
        style={{
          left: x - size / 2,
          top: STATION_Y - size / 2,
          width: size,
          height: size,
          borderColor:
            row.state === "branch"
              ? lineColor("branch")
              : current
                ? "var(--primary)"
                : LABEL_COLORS[label],
          background: current ? "var(--primary)" : undefined,
        }}
      />
    </div>
  );
}

function CategoryChip({ label }: { label: ChangeLabel }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: LABEL_COLORS[label] }}
      />
      {LABEL_NAMES[label]}
    </span>
  );
}

function ChangeValues({ change }: { change: HistoryChange }) {
  if (!change.before && !change.after) {
    return null;
  }
  return (
    <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 font-mono text-[11px] text-muted-foreground">
      {change.before && (
        <span className="line-through decoration-muted-foreground/50">
          {change.before}
        </span>
      )}
      {change.before && change.after && (
        <ArrowRight aria-label="became" className="h-3 w-3" />
      )}
      {change.after && <span className="text-foreground">{change.after}</span>}
    </p>
  );
}

function ChangeList({ changes }: { changes: HistoryChange[] }) {
  const views = new Set(changes.map((change) => change.view ?? ""));
  const showView = views.size > 1;
  return (
    <ul className="grid gap-1.5 rounded-md border border-border bg-muted/30 p-2">
      {changes.map((change, index) => {
        const Icon = KIND_ICONS[change.kind];
        return (
          <li
            key={index}
            className="grid grid-cols-[16px_minmax(0,1fr)] gap-x-2 text-xs"
          >
            <Icon
              aria-hidden="true"
              className="mt-0.5 h-3.5 w-3.5 text-muted-foreground"
            />
            <div className="min-w-0">
              <p className="break-words">
                {change.text}
                {showView && (
                  <span className="text-muted-foreground">
                    {" "}
                    · {change.view ?? "All views"}
                  </span>
                )}
              </p>
              <ChangeValues change={change} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function Station({
  row,
  described,
  laneCount,
  wide,
  previewing,
  focusable,
  now,
  onSelect,
  onRestore,
}: {
  row: TimelineRow;
  described: DescribedEntry;
  laneCount: number;
  wide: boolean;
  previewing: boolean;
  focusable: boolean;
  now: number;
  onSelect: () => void;
  onRestore: () => void;
}) {
  const { entry, changes, headline, detail, more } = described;
  const note = STATE_NOTES[row.state];
  const viewNames = [
    ...new Set(
      changes.map((change) => change.view).filter((view) => view !== undefined)
    ),
  ];
  const stats = wide ? summarizeTabs(entry.tabs) : undefined;
  // The expanded card shows the headline's own values beside it, not twice.
  const headlineChange = changes[0]?.text === headline ? changes[0] : undefined;
  const listed = headlineChange ? changes.slice(1) : changes;
  const muted = row.state === "branch" || row.state === "future";
  return (
    <li
      className={cn(
        "group relative flex rounded-md",
        previewing && "bg-accent ring-1 ring-border",
        !previewing && "hover:bg-accent/40"
      )}
      data-state={row.state}
    >
      <Rail
        row={row}
        laneCount={laneCount}
        label={entry.label}
        previewing={previewing}
      />
      <div className="min-w-0 flex-1 pr-2">
        <button
          type="button"
          data-index={row.index}
          tabIndex={focusable ? 0 : -1}
          aria-pressed={previewing}
          aria-current={row.state === "current" ? "step" : undefined}
          className="block w-full rounded-md py-2 pl-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={onSelect}
        >
          <span className="flex items-baseline gap-2">
            <span
              className={cn(
                "min-w-0 truncate text-[13px] font-medium",
                muted && "text-muted-foreground",
                wide && "whitespace-normal"
              )}
            >
              {headline}
            </span>
            {note && (
              <span
                className={cn(
                  "shrink-0 rounded-full px-1.5 py-px text-[10px] font-medium uppercase tracking-wide",
                  row.state === "current"
                    ? "bg-primary text-primary-foreground"
                    : "border border-border text-muted-foreground"
                )}
              >
                {note}
              </span>
            )}
            <time
              dateTime={entry.at}
              className="ml-auto shrink-0 text-[11px] tabular-nums text-muted-foreground"
            >
              {wide
                ? `${formatFull(entry.at)} · ${formatRelative(entry.at, now)}`
                : formatWhen(entry.at, now)}
            </time>
          </span>
          {!wide && detail && (
            <span className="mt-0.5 block truncate font-mono text-[11px] text-muted-foreground">
              {detail}
            </span>
          )}
          {wide && headlineChange && <ChangeValues change={headlineChange} />}
          <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
            {entry.author && (
              <span className="inline-flex items-center gap-1 text-foreground">
                <span
                  aria-hidden="true"
                  className="grid h-4 w-4 place-items-center rounded-full bg-muted text-[9px] font-semibold"
                >
                  {entry.author.name.slice(0, 1).toUpperCase()}
                </span>
                {entry.author.name}
              </span>
            )}
            <CategoryChip label={entry.label} />
            {viewNames.length > 0 && (
              <span className="min-w-0 truncate">
                {viewNames.length === 1
                  ? viewNames[0]
                  : `${viewNames.length} views`}
              </span>
            )}
            {!wide && more > 0 && (
              <span>
                +{more} more change{more === 1 ? "" : "s"}
              </span>
            )}
            {stats && (
              <span className="ml-auto tabular-nums">
                {stats.views} view{stats.views === 1 ? "" : "s"} ·{" "}
                {stats.charts} chart{stats.charts === 1 ? "" : "s"} ·{" "}
                {stats.filters} filter{stats.filters === 1 ? "" : "s"}
              </span>
            )}
          </span>
        </button>
        {wide && listed.length > 0 && (
          <div className="pb-2 pl-1">
            {headlineChange && (
              <p className="mb-1 text-[11px] font-medium text-muted-foreground">
                Also changed
              </p>
            )}
            <ChangeList changes={listed} />
          </div>
        )}
        {previewing && row.state !== "current" && (
          <div className="flex flex-wrap gap-2 pb-2 pl-1">
            <Button size="sm" className="h-7 text-xs" onClick={onRestore}>
              Restore this version
            </Button>
          </div>
        )}
      </div>
    </li>
  );
}

export function HistoryTimeline({
  session,
  previewIndex,
  wide,
  focusIndex,
  onFocused,
  onPreview,
  onReturn,
  onRestore,
}: {
  session: SavedViewsSession;
  previewIndex: number | null;
  wide: boolean;
  /** Focuses this checkpoint, or the current one, after the panel mounts. */
  focusIndex?: number | "current";
  onFocused?: () => void;
  onPreview: (index: number) => void;
  onReturn: () => void;
  onRestore: (index: number) => void;
}) {
  const listRef = useRef<HTMLOListElement>(null);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const rows = useMemo(() => buildTimeline(session), [session]);
  const laneCount = Math.max(1, ...rows.map((row) => row.lane + 1));
  const currentIndex = session.path[session.cursor] ?? 0;
  const selectedIndex = previewIndex ?? currentIndex;

  useEffect(() => {
    const list = listRef.current;
    if (!list) {
      return;
    }
    const target =
      focusIndex === undefined || focusIndex === "current"
        ? selectedIndex
        : focusIndex;
    const button = list.querySelector<HTMLButtonElement>(
      `[data-index="${target}"]`
    );
    button?.scrollIntoView?.({ block: "nearest" });
    if (focusIndex !== undefined) {
      button?.focus({ preventScroll: true });
      onFocused?.();
    }
    // Runs once per mount: the workspace remounts the panel for each preview.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onKeyDown = (event: KeyboardEvent<HTMLOListElement>) => {
    const buttons = [
      ...(listRef.current?.querySelectorAll<HTMLButtonElement>(
        "button[data-index]"
      ) ?? []),
    ];
    const at = buttons.indexOf(event.target as HTMLButtonElement);
    if (at < 0) {
      return;
    }
    let next: number | undefined;
    if (event.key === "ArrowDown") {
      next = Math.min(buttons.length - 1, at + 1);
    } else if (event.key === "ArrowUp") {
      next = Math.max(0, at - 1);
    } else if (event.key === "Home") {
      next = 0;
    } else if (event.key === "End") {
      next = buttons.length - 1;
    }
    if (next === undefined) {
      return;
    }
    event.preventDefault();
    buttons[next]?.focus();
  };

  return (
    <div className="px-2 py-2">
      <ol
        ref={listRef}
        aria-label="Checkpoints, newest first"
        className="grid grid-cols-[minmax(0,1fr)]"
        onKeyDown={onKeyDown}
      >
        {rows.map((row) => (
          <Station
            key={row.index}
            row={row}
            described={describeEntry(session, row.index)}
            laneCount={laneCount}
            wide={wide}
            previewing={previewIndex === row.index}
            focusable={row.index === selectedIndex}
            now={now}
            onSelect={() =>
              row.index === currentIndex || row.index === previewIndex
                ? previewIndex === null
                  ? undefined
                  : onReturn()
                : onPreview(row.index)
            }
            onRestore={() => onRestore(row.index)}
          />
        ))}
      </ol>
      <p className="mt-3 px-2 text-[11px] leading-relaxed text-muted-foreground">
        {session.history.length === 1
          ? "Each change you make adds a step here. Select a step to preview it, then restore it or return to the present."
          : `Select a step to preview it without changing anything. This browser keeps the latest ${HISTORY_LIMIT} steps; ${session.history.length} are saved now.`}
      </p>
    </div>
  );
}
