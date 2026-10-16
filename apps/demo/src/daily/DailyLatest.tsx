import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { publishedEntries, type DailyEntry } from "./corpus";
import { DailyCard } from "./DailyCard";
import { useDailyCatalog } from "./useDailyCatalog";

type LatestProps = {
  count?: number;
  filter?: (entry: DailyEntry) => boolean;
};

/**
 * The newest pieces, for pages that point into the collection. The list
 * loads the collection only once it scrolls near the viewport.
 */
export function DailyLatest(props: LatestProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([item]) => {
        if (item?.isIntersecting) setNear(true);
      },
      { rootMargin: "400px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return (
    // Reserve the list's height so it doesn't push the page when it loads.
    <div ref={ref} className="min-h-72">
      {near && <LatestList {...props} />}
    </div>
  );
}

function LatestList({ count = 4, filter }: LatestProps) {
  const { data } = useDailyCatalog();
  if (!data) return null;
  const entries = publishedEntries(data.entries)
    .filter((entry) => !filter || filter(entry))
    .slice(0, count);
  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
      {entries.map((entry) => (
        <DailyCard key={entry.id} entry={entry} showQuestion={false} />
      ))}
    </div>
  );
}

export function DailyArchiveLink({ children }: { children: string }) {
  return (
    <Link
      to="/daily"
      className="mt-4 inline-flex items-center gap-1 rounded-sm text-sm font-medium text-site-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {children}
      <ArrowRight className="size-4" aria-hidden="true" />
    </Link>
  );
}
