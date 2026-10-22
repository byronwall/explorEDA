import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  assetPath,
  dailyPath,
  formatDay,
  kindLabel,
  type DailyEntry,
} from "./corpus";

/** Wraps each case-insensitive match of `query` in a mark. */
export function highlight(text: string, query: string): ReactNode {
  const needle = query.trim().toLowerCase();
  if (!needle) return text;
  const parts: ReactNode[] = [];
  let from = 0;
  const lower = text.toLowerCase();
  for (
    let at = lower.indexOf(needle);
    at !== -1;
    at = lower.indexOf(needle, from)
  ) {
    parts.push(text.slice(from, at));
    parts.push(
      <mark key={at} className="rounded-sm bg-site-accent/15 text-inherit">
        {text.slice(at, at + needle.length)}
      </mark>
    );
    from = at + needle.length;
  }
  parts.push(text.slice(from));
  return parts;
}

/**
 * A picture of the piece's lead graphic, whole and centered in a 16:10 frame,
 * or a quiet placeholder of the same size. The frame stays white in dark mode
 * because the pictures are light.
 */
export function DailyThumb({
  entry,
  className = "",
  aspect = "aspect-[16/10]",
}: {
  entry: DailyEntry;
  className?: string;
  aspect?: string;
}) {
  return (
    <div
      className={`${aspect} overflow-hidden rounded-md border border-border bg-white ${className}`}
    >
      {entry.thumb && (
        <img
          src={assetPath(entry.thumb)}
          alt=""
          loading="lazy"
          decoding="async"
          className="size-full object-contain"
        />
      )}
    </div>
  );
}

/** One piece as a card: picture, day and format, title, and its question. */
export function DailyCard({
  entry,
  query = "",
  showQuestion = true,
}: {
  entry: DailyEntry;
  query?: string;
  showQuestion?: boolean;
}) {
  return (
    <article className="group relative min-w-0">
      <DailyThumb
        entry={entry}
        className="transition-colors duration-150 group-hover:border-site-accent/60"
      />
      <p className="mt-2 text-xs tabular-nums text-muted-foreground">
        <time dateTime={entry.published}>{formatDay(entry.published)}</time> ·{" "}
        {kindLabel(entry)} · {highlight(entry.industry, query)}
      </p>
      <h3 className="mt-0.5 text-[15px] font-semibold leading-snug text-site-ink">
        <Link
          to={dailyPath(entry)}
          className="after:absolute after:inset-0 after:content-[''] group-hover:text-site-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {highlight(entry.title, query)}
        </Link>
      </h3>
      {showQuestion && (
        <p className="mt-1 text-sm leading-snug text-muted-foreground">
          {highlight(entry.question, query)}
        </p>
      )}
    </article>
  );
}

/** One piece as a dense row: small picture, title over its question, and when and what. */
export function DailyRow({
  entry,
  query = "",
}: {
  entry: DailyEntry;
  query?: string;
}) {
  return (
    <li className="group relative grid grid-cols-[4.5rem_minmax(0,1fr)] items-start gap-x-3 py-2.5 sm:grid-cols-[6rem_minmax(0,1fr)_11rem] sm:gap-x-4">
      <DailyThumb
        entry={entry}
        className="transition-colors duration-150 group-hover:border-site-accent/60"
      />
      <div className="min-w-0">
        <h3 className="text-[15px] font-semibold leading-snug text-site-ink">
          <Link
            to={dailyPath(entry)}
            className="after:absolute after:inset-0 after:content-[''] group-hover:text-site-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {highlight(entry.title, query)}
          </Link>
        </h3>
        <p className="mt-0.5 text-sm leading-snug text-muted-foreground">
          {highlight(entry.question, query)}
        </p>
        <p className="mt-0.5 text-xs tabular-nums text-muted-foreground sm:hidden">
          {formatDay(entry.published)} · {kindLabel(entry)} ·{" "}
          {highlight(entry.industry, query)}
        </p>
      </div>
      <p className="hidden text-xs leading-relaxed tabular-nums text-muted-foreground sm:block">
        <time dateTime={entry.published}>{formatDay(entry.published)}</time> ·{" "}
        {kindLabel(entry)}
        <br />
        {highlight(entry.industry, query)}
      </p>
    </li>
  );
}
