import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  assetPath,
  dailyPath,
  formatDay,
  kindLabels,
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
 * or a quiet placeholder of the same size.
 */
export function DailyThumb({
  entry,
  className = "",
}: {
  entry: DailyEntry;
  className?: string;
}) {
  return (
    <div
      className={`aspect-[16/10] overflow-hidden rounded-md border border-border bg-card ${className}`}
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
        {kindLabels[entry.kind]} · {highlight(entry.industry, query)}
      </p>
      <h3 className="mt-0.5 text-[15px] font-semibold leading-snug text-brand-navy">
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
