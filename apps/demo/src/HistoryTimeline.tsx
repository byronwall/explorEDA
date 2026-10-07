import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Filter,
  Layers,
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
  changeDetail,
  describeEntry,
  groupTimeline,
  formatClock,
  LABEL_NAMES,
  summarizeTabs,
  type ChangeKind,
  type DescribedEntry,
  type HistoryChange,
  type RailMerge,
  type RailSegment,
  type TimelineItem,
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
const STATION_Y = 15;

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

/**
 * The rail is neutral; only the current step carries the accent. Undone and
 * replaced steps fade instead of taking a hue of their own.
 */
function lineColor(state: TimelineState) {
  const share = state === "branch" ? 22 : state === "future" ? 35 : 45;
  return `color-mix(in oklab, var(--muted-foreground) ${share}%, transparent)`;
}

function stationTone(state: TimelineState) {
  if (state === "current") {
    return "var(--primary)";
  }
  const share = state === "branch" ? 35 : state === "future" ? 50 : 75;
  return `color-mix(in oklab, var(--muted-foreground) ${share}%, transparent)`;
}

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

function formatWhen(at: string, now: number, withSeconds = false) {
  const date = new Date(at);
  if (isSameDay(date, new Date(now))) {
    return formatClock(at, withSeconds);
  }
  const day = date.toLocaleDateString([], { month: "short", day: "numeric" });
  return withSeconds ? `${day}, ${formatClock(at)}` : day;
}

function Rail({
  row,
  laneCount,
  previewing,
  station = "step",
}: {
  row: TimelineRow;
  laneCount: number;
  previewing: boolean;
  /** A bundle draws a hollow station; a heading draws none. */
  station?: "step" | "bundle" | "none";
}) {
  const width = laneX(laneCount - 1) + RAIL_PAD;
  const x = laneX(row.lane);
  const current = row.state === "current";
  const size = current ? 11 : 9;
  // A step is a filled dot; a bundle of steps is a ring of the same size.
  const filled = current || (station === "step" && row.state === "past");
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
      {station !== "none" && (
        <span
          className={cn(
            "absolute rounded-full border-[1.5px] bg-background transition-shadow",
            current &&
              "shadow-[0_0_0_3px_color-mix(in_oklab,var(--primary)_16%,transparent)]",
            previewing &&
              "shadow-[0_0_0_2px_var(--background),0_0_0_3.5px_var(--foreground)]",
            row.state === "future" && "border-dashed"
          )}
          style={{
            left: x - size / 2,
            top: STATION_Y - size / 2,
            width: size,
            height: size,
            borderColor: stationTone(row.state),
            background: filled ? stationTone(row.state) : undefined,
          }}
        />
      )}
    </div>
  );
}

/** Joins the members' rail pieces so a bundle draws as one stretch of line. */
function bundleRail(rows: TimelineRow[]): TimelineRow {
  const segments = new Map<string, RailSegment>();
  for (const row of rows) {
    for (const segment of row.segments) {
      const key = `${segment.lane}-${segment.state}`;
      const joined = segments.get(key);
      segments.set(
        key,
        joined
          ? {
              ...joined,
              above: joined.above || segment.above,
              below: joined.below || segment.below,
            }
          : { ...segment }
      );
    }
  }
  return { ...rows[0]!, segments: [...segments.values()], merges: [] };
}

/** Lines that run straight through a heading above `next`. */
function passingRail(next: TimelineRow | undefined): TimelineRow {
  const segments: RailSegment[] = [];
  for (const segment of next?.segments ?? []) {
    if (segment.above) {
      segments.push({ ...segment, below: true });
    }
  }
  for (const merge of next?.merges ?? []) {
    segments.push({
      lane: merge.fromLane,
      above: true,
      below: true,
      state: merge.state,
    });
  }
  return {
    index: -1,
    lane: 0,
    state: next?.state ?? "past",
    segments,
    merges: [],
  };
}

/** The expanded view lays each step out as a table row with these columns. */
const WIDE_COLUMNS =
  "grid grid-cols-[minmax(0,2fr)_minmax(0,0.8fr)_minmax(0,1.6fr)_2.75rem_2.75rem_2.75rem_8.5rem] items-baseline gap-x-3";

const STATE_BADGE =
  "shrink-0 rounded px-1 text-[9.5px] font-semibold uppercase leading-4 tracking-wide";

function StateBadge({ state }: { state: TimelineState }) {
  const note = STATE_NOTES[state];
  if (!note) {
    return null;
  }
  return (
    <span
      className={cn(
        STATE_BADGE,
        state === "current"
          ? "bg-primary/10 text-primary"
          : "bg-muted text-muted-foreground"
      )}
    >
      {note}
    </span>
  );
}

function KindIcon({
  change,
  label,
}: {
  change: HistoryChange | undefined;
  label: ChangeLabel;
}) {
  const Icon = change ? KIND_ICONS[change.kind] : LayoutGrid;
  return (
    <>
      <Icon
        aria-hidden="true"
        className="size-3.5 shrink-0 self-center text-muted-foreground"
      />
      <span className="sr-only">{LABEL_NAMES[label]}: </span>
    </>
  );
}

function ChangeValues({ change }: { change: HistoryChange | undefined }) {
  if (!change || (!change.before && !change.after)) {
    return <span className="text-muted-foreground/60">—</span>;
  }
  return (
    <span className="flex min-w-0 items-center gap-x-1 whitespace-nowrap font-mono text-[11px]">
      {change.before && (
        <span className="min-w-0 shrink truncate text-muted-foreground line-through decoration-muted-foreground/50">
          {change.before}
        </span>
      )}
      {change.before && change.after && (
        <ArrowRight
          aria-label="became"
          className="size-3 shrink-0 text-muted-foreground"
        />
      )}
      {change.after && <span className="min-w-0 truncate">{change.after}</span>}
    </span>
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
  nested = false,
}: {
  row: TimelineRow;
  described: DescribedEntry;
  /** A member shown inside an open bundle. */
  nested?: boolean;
  laneCount: number;
  wide: boolean;
  previewing: boolean;
  focusable: boolean;
  now: number;
  onSelect: () => void;
  onRestore: () => void;
}) {
  const { entry, changes, headline, detail, more } = described;
  const viewNames = [
    ...new Set(
      changes.map((change) => change.view).filter((view) => view !== undefined)
    ),
  ];
  const viewText =
    viewNames.length === 0
      ? changes.some((change) => change.kind === "shared")
        ? "All views"
        : ""
      : viewNames.length === 1
        ? viewNames[0]!
        : `${viewNames.length} views`;
  const muted = row.state === "branch" || row.state === "future";
  // A headline that is itself the first change shows that change's values.
  const headlineChange = changes[0]?.text === headline ? changes[0] : undefined;
  const listed = wide ? (headlineChange ? changes.slice(1) : changes) : [];
  const stats = wide ? summarizeTabs(entry.tabs) : undefined;
  const buttonClass =
    "w-full rounded text-left outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <li
      className={cn(
        "relative flex rounded-md",
        previewing ? "bg-accent ring-1 ring-border" : "hover:bg-accent/40"
      )}
      data-state={row.state}
    >
      <Rail row={row} laneCount={laneCount} previewing={previewing} />
      <div className={cn("min-w-0 flex-1 pr-1.5", nested && "pl-3")}>
        <button
          type="button"
          data-nav=""
          data-index={row.index}
          tabIndex={focusable ? 0 : -1}
          aria-pressed={previewing}
          aria-current={row.state === "current" ? "step" : undefined}
          className={cn(
            buttonClass,
            wide ? cn(WIDE_COLUMNS, "py-1.5 pl-1 text-xs") : "py-1.5 pl-1"
          )}
          onClick={onSelect}
        >
          {wide ? (
            <>
              <span className="flex min-w-0 items-center gap-1.5">
                <KindIcon change={changes[0]} label={entry.label} />
                <span
                  className={cn(
                    "min-w-0 break-words font-medium",
                    muted && "text-muted-foreground"
                  )}
                >
                  {headline}
                </span>
                <StateBadge state={row.state} />
              </span>
              <span className="truncate text-muted-foreground">{viewText}</span>
              {headlineChange ? (
                <ChangeValues change={headlineChange} />
              ) : (
                <span className="truncate text-muted-foreground">
                  {detail ?? "—"}
                </span>
              )}
              <span className="text-right tabular-nums text-muted-foreground">
                {stats!.views}
              </span>
              <span className="text-right tabular-nums text-muted-foreground">
                {stats!.charts}
              </span>
              <span className="text-right tabular-nums text-muted-foreground">
                {stats!.filters}
              </span>
              <span className="truncate text-right tabular-nums text-muted-foreground">
                {entry.author && (
                  <span className="text-foreground">
                    {entry.author.name} ·{" "}
                  </span>
                )}
                <time dateTime={entry.at}>
                  {formatWhen(entry.at, now, true)}
                </time>
              </span>
            </>
          ) : (
            <>
              <span className="flex items-center gap-1.5">
                <KindIcon change={changes[0]} label={entry.label} />
                <span
                  className={cn(
                    "min-w-0 truncate text-[12.5px] font-medium leading-[18px]",
                    muted && "text-muted-foreground"
                  )}
                >
                  {headline}
                </span>
                <StateBadge state={row.state} />
                <time
                  dateTime={entry.at}
                  className="ml-auto shrink-0 pl-1 text-[11px] tabular-nums text-muted-foreground"
                >
                  {formatWhen(entry.at, now)}
                </time>
              </span>
              <span className="flex items-baseline gap-2 pl-5 text-[11px] leading-4 text-muted-foreground">
                <span className="min-w-0 flex-1 truncate font-mono">
                  {detail ?? LABEL_NAMES[entry.label]}
                </span>
                <span className="max-w-[45%] shrink-0 truncate">
                  {entry.author ? `${entry.author.name} · ` : ""}
                  {viewText}
                  {more > 0 && (
                    <span className="tabular-nums">
                      {viewText ? " · " : ""}+{more}
                      <span className="sr-only">
                        {" "}
                        more change{more === 1 ? "" : "s"}
                      </span>
                    </span>
                  )}
                </span>
              </span>
            </>
          )}
        </button>
        {listed.length > 0 && (
          <ul aria-label="Also changed" className="pb-1">
            {listed.map((change, index) => (
              <li
                key={index}
                className={cn(WIDE_COLUMNS, "py-0.5 pl-1 text-[11px]")}
              >
                <span className="flex min-w-0 items-center gap-1.5 pl-5 text-muted-foreground">
                  <KindIcon change={change} label={entry.label} />
                  <span className="min-w-0 truncate text-foreground/85">
                    {change.text}
                  </span>
                </span>
                <span className="truncate text-muted-foreground">
                  {change.view ?? "All views"}
                </span>
                <ChangeValues change={change} />
              </li>
            ))}
          </ul>
        )}
        {previewing && row.state !== "current" && (
          <div className="pb-1.5 pl-6">
            <Button
              size="sm"
              className="h-6 px-2 text-[11px]"
              onClick={onRestore}
            >
              Restore this version
            </Button>
          </div>
        )}
      </div>
    </li>
  );
}

function timeRange(
  rows: TimelineRow[],
  session: SavedViewsSession,
  now: number,
  withSeconds = false
) {
  const newest = session.history[rows[0]!.index]!.at;
  const oldest = session.history[rows[rows.length - 1]!.index]!.at;
  const end = formatWhen(newest, now, withSeconds);
  const start = formatWhen(oldest, now, withSeconds);
  if (start === end) {
    return end;
  }
  // Drop a shared AM or PM from the start: 10:18:17–10:18:22 PM.
  const period = /\s(\S+)$/.exec(end)?.[1];
  const trimmed =
    period && start.endsWith(` ${period}`)
      ? start.slice(0, -period.length - 1)
      : start;
  return `${trimmed}–${end}`;
}

const BUNDLE_ICONS: Record<ChangeLabel, LucideIcon> = {
  View: LayoutGrid,
  Filter: Filter,
  Both: Layers,
  Shared: Share2,
};

function BundleHeader({
  item,
  session,
  laneCount,
  wide,
  open,
  focusable,
  now,
  onToggle,
}: {
  item: Extract<TimelineItem, { type: "bundle" }>;
  session: SavedViewsSession;
  laneCount: number;
  wide: boolean;
  open: boolean;
  focusable: boolean;
  now: number;
  onToggle: () => void;
}) {
  const newest = item.rows[0]!;
  const muted = newest.state === "future";
  const first = item.net[0];
  const netDetail = first
    ? (changeDetail(first) ?? first.text)
    : "No net change";
  const netMore = Math.max(0, item.net.length - 1);
  const viewText =
    item.views.length === 1 ? item.views[0]! : `${item.views.length} views`;
  const stats = wide
    ? summarizeTabs(session.history[newest.index]!.tabs)
    : undefined;
  const Icon = BUNDLE_ICONS[item.label];
  const Chevron = open ? ChevronDown : ChevronRight;
  const range = timeRange(item.rows, session, now, wide);
  const title = (
    <span className="flex min-w-0 items-center gap-1.5">
      <Icon
        aria-hidden="true"
        className="size-3.5 shrink-0 self-center text-muted-foreground"
      />
      <span
        className={cn(
          "min-w-0 font-medium",
          wide ? "break-words" : "truncate text-[12.5px] leading-[18px]",
          muted && "text-muted-foreground"
        )}
      >
        {item.headline}
      </span>
      <Chevron
        aria-hidden="true"
        className="size-3.5 shrink-0 self-center text-muted-foreground"
      />
      {muted && <StateBadge state="future" />}
    </span>
  );
  return (
    <li className="relative flex rounded-md hover:bg-accent/40">
      <Rail
        row={open ? passingRail(newest) : bundleRail(item.rows)}
        laneCount={laneCount}
        previewing={false}
        station={open ? "none" : "bundle"}
      />
      <div className="min-w-0 flex-1 pr-1.5">
        <button
          type="button"
          data-nav=""
          data-bundle={item.key}
          tabIndex={focusable ? 0 : -1}
          aria-expanded={open}
          className={cn(
            "w-full rounded py-1.5 pl-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring",
            wide && cn(WIDE_COLUMNS, "text-xs")
          )}
          onClick={onToggle}
        >
          {wide ? (
            <>
              {title}
              <span className="truncate text-muted-foreground">{viewText}</span>
              <span className="flex min-w-0 items-baseline gap-1.5">
                <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Net
                </span>
                {first ? (
                  <ChangeValues change={first} />
                ) : (
                  <span className="text-muted-foreground">No net change</span>
                )}
                {netMore > 0 && (
                  <span className="shrink-0 text-muted-foreground">
                    +{netMore}
                  </span>
                )}
              </span>
              <span className="text-right tabular-nums text-muted-foreground">
                {stats!.views}
              </span>
              <span className="text-right tabular-nums text-muted-foreground">
                {stats!.charts}
              </span>
              <span className="text-right tabular-nums text-muted-foreground">
                {stats!.filters}
              </span>
              <span className="truncate text-right tabular-nums text-muted-foreground">
                {range}
              </span>
            </>
          ) : (
            <>
              <span className="flex items-center gap-1.5">
                {title}
                <span className="ml-auto shrink-0 pl-1 text-[11px] tabular-nums text-muted-foreground">
                  {range}
                </span>
              </span>
              <span className="flex items-baseline gap-2 pl-5 text-[11px] leading-4 text-muted-foreground">
                <span className="min-w-0 flex-1 truncate">
                  <span className="mr-1 text-[10px] font-semibold uppercase tracking-wide">
                    Net
                  </span>
                  <span className="font-mono">{netDetail}</span>
                </span>
                <span className="max-w-[45%] shrink-0 truncate">
                  {viewText}
                  {netMore > 0 && (
                    <span className="tabular-nums">
                      {" "}
                      · +{netMore}
                      <span className="sr-only"> more net changes</span>
                    </span>
                  )}
                </span>
              </span>
            </>
          )}
        </button>
      </div>
    </li>
  );
}

function DayHeading({
  label,
  next,
  laneCount,
}: {
  label: string;
  next: TimelineRow | undefined;
  laneCount: number;
}) {
  return (
    <li className="flex" aria-label={label}>
      <Rail
        row={passingRail(next)}
        laneCount={laneCount}
        previewing={false}
        station="none"
      />
      <span className="py-1 pl-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
    </li>
  );
}

function WideHeader({ laneCount }: { laneCount: number }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        WIDE_COLUMNS,
        "sticky top-0 z-[1] border-b border-border bg-popover py-1.5 pr-3 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
      )}
      style={{ paddingLeft: laneX(laneCount - 1) + RAIL_PAD + 4 }}
    >
      <span className="pl-5">Change</span>
      <span>View</span>
      <span>Values</span>
      <span className="text-right">Views</span>
      <span className="text-right">Charts</span>
      <span className="text-right">Filters</span>
      <span className="text-right">When</span>
    </div>
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
  const items = useMemo(
    () => groupTimeline(session, rows, now),
    [session, rows, now]
  );
  const [openBundles, setOpenBundles] = useState<Set<string>>(() => new Set());
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

  // A bundle that holds the selected step stays open so the step is visible.
  const holds = (item: TimelineItem, index: number | undefined) =>
    item.type === "bundle" && item.rows.some((row) => row.index === index);
  const firstRow = (item: TimelineItem | undefined) =>
    item?.type === "step"
      ? item.row
      : item?.type === "bundle"
        ? item.rows[0]
        : undefined;
  const renderStation = (row: TimelineRow, nested = false) => (
    <Station
      key={row.index}
      row={row}
      nested={nested}
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
  );

  const onKeyDown = (event: KeyboardEvent<HTMLOListElement>) => {
    const buttons = [
      ...(listRef.current?.querySelectorAll<HTMLButtonElement>(
        "button[data-nav]"
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
    <div className={wide ? "pb-2" : "px-1.5 py-1.5"}>
      {wide && <WideHeader laneCount={laneCount} />}
      <ol
        ref={listRef}
        aria-label="Checkpoints, newest first"
        className={cn("grid grid-cols-[minmax(0,1fr)]", wide && "px-1.5 pt-1")}
        onKeyDown={onKeyDown}
      >
        {items.map((item, at) => {
          if (item.type === "day") {
            return (
              <DayHeading
                key={item.key}
                label={item.label}
                next={firstRow(items[at + 1])}
                laneCount={laneCount}
              />
            );
          }
          if (item.type === "step") {
            return renderStation(item.row);
          }
          const open = openBundles.has(item.key) || holds(item, selectedIndex);
          return [
            <BundleHeader
              key={item.key}
              item={item}
              session={session}
              laneCount={laneCount}
              wide={wide}
              open={open}
              focusable={false}
              now={now}
              onToggle={() =>
                setOpenBundles((current) => {
                  const next = new Set(current);
                  if (open) {
                    next.delete(item.key);
                  } else {
                    next.add(item.key);
                  }
                  return next;
                })
              }
            />,
            ...(open ? item.rows.map((row) => renderStation(row, true)) : []),
          ];
        })}
      </ol>
      <p className="mt-2 px-2 text-[11px] leading-relaxed text-muted-foreground">
        {session.history.length === 1
          ? "Each change you make adds a step here. Select a step to preview it, then restore it or return to the present."
          : `Select a step to preview it without changing anything. This browser keeps the latest ${HISTORY_LIMIT} steps; ${session.history.length} are saved now.`}
      </p>
    </div>
  );
}
