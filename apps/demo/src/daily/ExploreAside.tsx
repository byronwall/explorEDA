import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import {
  ExplorEda,
  type ExplorEdaProps,
  type SavedDataStructure,
} from "exploreda";
import { Button } from "@/components/ui/button";

/**
 * A workspace docked beside a notebook, for exploring copies of its charts
 * and its rows. Edits stay here; the notebook never changes.
 */
export function ExploreAside({
  data,
  fieldTypes,
  settings,
  version,
  rowsOpen,
  onChange,
  onClose,
}: {
  data: ExplorEdaProps["data"];
  fieldTypes?: ExplorEdaProps["fieldTypes"];
  settings: SavedDataStructure;
  /** Changes when the host adds a chart, so the workspace takes it. */
  version: number;
  rowsOpen: boolean;
  onChange: (settings: SavedDataStructure) => void;
  onClose: () => void;
}) {
  const panel = useRef<HTMLElement>(null);
  // Focus the panel and show the chart just pulled in, the last one.
  useEffect(() => {
    panel.current?.focus({ preventScroll: true });
    const timer = setTimeout(() => {
      const items = panel.current?.querySelectorAll(".react-grid-item");
      items?.[items.length - 1]?.scrollIntoView({ block: "nearest" });
    }, 150);
    return () => clearTimeout(timer);
  }, [version]);
  const charts = settings.charts.length;
  return (
    <aside
      ref={panel}
      tabIndex={-1}
      aria-label="Explore"
      className="daily-aside fixed inset-y-0 right-0 z-40 flex flex-col border-l border-border bg-background shadow-xl outline-none"
    >
      <header className="flex items-center gap-3 border-b border-border px-4 py-2.5">
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-site-ink">Explore</h2>
          <p className="truncate text-xs text-muted-foreground">
            {charts
              ? `${charts} ${charts === 1 ? "copy" : "copies"} of notebook charts. Changes stay here.`
              : "Every row behind the notebook. Add a chart to start."}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Close explore"
          title="Close explore"
          onClick={onClose}
        >
          <X />
        </Button>
      </header>
      <div className="daily-aside-body min-h-0 flex-1">
        <ExplorEda
          key={version}
          data={data}
          fieldTypes={fieldTypes}
          savedData={settings}
          defaultRowsOpen={rowsOpen}
          onStateChange={onChange}
        />
      </div>
    </aside>
  );
}
