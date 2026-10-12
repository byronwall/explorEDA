import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

export type TocEntry = { id: string; title: string; level: 2 | 3 };

/** How far below the header a heading counts as the one being read. */
const READING_LINE = 120;

/** Reads the page's section headings once its content is on screen. */
export function ContentsReader({
  onRead,
}: {
  onRead: (entries: TocEntry[]) => void;
}) {
  const { hash } = useLocation();
  const marker = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const article = marker.current?.closest("article");
    const headings = article?.querySelectorAll("h2[id], h3[id]") ?? [];
    onRead(
      [...headings].map((heading) => ({
        id: heading.id,
        // The anchor link inside each heading adds no visible text.
        title: heading.textContent ?? "",
        level: heading.tagName === "H3" ? 3 : 2,
      }))
    );
    if (hash) {
      document
        .getElementById(decodeURIComponent(hash.slice(1)))
        ?.scrollIntoView();
    }
  }, [hash, onRead]);
  return <span ref={marker} hidden />;
}

/** The id of the last heading above the reading line. */
function useActiveHeading(entries: readonly TocEntry[]) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    if (entries.length === 0) {
      return;
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      let current: string | null = entries[0]?.id ?? null;
      for (const entry of entries) {
        const element = document.getElementById(entry.id);
        if (element && element.getBoundingClientRect().top <= READING_LINE) {
          current = entry.id;
        }
      }
      // At the very bottom, the last short section can never reach the line.
      const atEnd =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4;
      setActive(atEnd ? (entries.at(-1)?.id ?? current) : current);
    };
    const schedule = () => {
      if (!frame) {
        frame = requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [entries]);
  return active;
}

function TocList({
  entries,
  active,
  onPick,
}: {
  entries: readonly TocEntry[];
  active: string | null;
  onPick?: () => void;
}) {
  return (
    <ul className="space-y-0.5 border-l border-border text-sm">
      {entries.map((entry) => {
        const current = entry.id === active;
        return (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              onClick={onPick}
              aria-current={current ? "location" : undefined}
              className={cn(
                "-ml-px block border-l-2 py-1 leading-snug transition-colors focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                entry.level === 3 ? "pl-6 text-[0.8125rem]" : "pl-3",
                current
                  ? "border-primary font-medium text-foreground"
                  : "border-transparent text-muted-foreground hover:border-foreground/30 hover:text-foreground"
              )}
            >
              {entry.title}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

/** The right rail's list of sections, marking the one being read. */
export function OnThisPage({ entries }: { entries: readonly TocEntry[] }) {
  const active = useActiveHeading(entries);
  if (entries.length === 0) {
    return null;
  }
  return (
    <nav aria-label="On this page">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-foreground/70">
        On this page
      </p>
      <TocList entries={entries} active={active} />
    </nav>
  );
}

/** The same list folded into the page, for screens without the right rail. */
export function InlineContents({ entries }: { entries: readonly TocEntry[] }) {
  const [open, setOpen] = useState(false);
  if (entries.length < 2) {
    return null;
  }
  return (
    <nav
      aria-label="Page sections"
      className="mt-8 rounded-lg border border-border bg-card xl:hidden"
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 rounded-lg px-4 py-2.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        On this page
        <span className="flex items-center gap-2 text-xs font-normal text-muted-foreground">
          {entries.length} sections
          <ChevronDown
            aria-hidden="true"
            className={cn(
              "size-4 transition-transform motion-reduce:transition-none",
              open && "rotate-180"
            )}
          />
        </span>
      </button>
      {open && (
        <div className="border-t border-border px-4 py-3">
          <TocList
            entries={entries}
            active={null}
            onPick={() => setOpen(false)}
          />
        </div>
      )}
    </nav>
  );
}
