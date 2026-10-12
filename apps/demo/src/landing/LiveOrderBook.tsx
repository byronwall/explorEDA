import { Button } from "@/components/ui/button";
import { shopDashboard } from "@/demos/dashboardSettings";
import { Maximize2, MousePointerClick, RotateCcw } from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";
import { parseCsvData } from "../csvParser";
import type { DatumObject } from "../LandingPage";

const ExplorEda = lazy(() =>
  import("exploreda").then(({ ExplorEda: Workspace }) => ({
    default: Workspace,
  }))
);

const DATA_URL = "/datasets/shop-operations.csv";

function Placeholder({ children }: { children: string }) {
  return (
    <div
      role="status"
      className="flex h-full items-center justify-center text-sm text-muted-foreground"
    >
      {children}
    </div>
  );
}

const tries = [
  ["Click", "Web in Sales channels"],
  ["Drag", "across the scatter"],
  ["Alt-click", "a bar to trace it"],
] as const;

function TryHints({ edited }: { edited: boolean }) {
  return (
    <p
      aria-live="polite"
      className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground"
    >
      <MousePointerClick
        aria-hidden="true"
        className="size-4 shrink-0 text-site-accent"
      />
      {edited ? (
        <span>
          <span className="font-semibold text-foreground">
            Every view followed.
          </span>{" "}
          Keep going, or reset to the saved layout.
        </span>
      ) : (
        <>
          <span className="font-semibold text-foreground">Try it:</span>
          {tries.map(([gesture, target]) => (
            <span key={gesture} className="inline-flex items-center gap-1.5">
              <kbd className="rounded border border-border border-b-2 bg-background px-1.5 py-px font-mono text-[10.5px] font-medium text-foreground">
                {gesture}
              </kbd>
              {target}
            </span>
          ))}
        </>
      )}
    </p>
  );
}

/** The featured order book, running live inside a bounded frame. */
export function LiveOrderBook({ onOpenFull }: { onOpenFull: () => void }) {
  const [rows, setRows] = useState<DatumObject[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [edited, setEdited] = useState(false);
  const [mount, setMount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetch(DATA_URL, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        return response.text();
      })
      .then(parseCsvData)
      .then(setRows)
      .catch((error: unknown) => {
        if (!(error instanceof Error && error.name === "AbortError")) {
          setFailed(true);
        }
      });
    return () => controller.abort();
  }, []);

  return (
    <div className="landing-stage overflow-hidden rounded-xl bg-card text-left">
      <div className="flex items-center gap-3 border-b border-border bg-muted/50 px-3 py-2">
        <span aria-hidden="true" className="hidden gap-1.5 md:flex">
          <span className="size-2.5 rounded-full bg-foreground/15" />
          <span className="size-2.5 rounded-full bg-foreground/15" />
          <span className="size-2.5 rounded-full bg-foreground/15" />
        </span>
        <div className="hidden min-w-0 sm:block">
          <TryHints edited={edited} />
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-1">
          <Button
            variant={edited ? "outline" : "ghost"}
            size="sm"
            disabled={!edited}
            onClick={() => {
              setEdited(false);
              setMount((key) => key + 1);
            }}
          >
            <RotateCcw aria-hidden="true" />
            Reset
          </Button>
          <Button variant="ghost" size="sm" onClick={onOpenFull}>
            <Maximize2 aria-hidden="true" />
            Full page
          </Button>
        </div>
      </div>
      <div
        role="region"
        aria-label="Live order book example"
        className="landing-frame h-[560px] overflow-auto bg-background sm:h-[640px]"
      >
        <div className="h-full min-w-[1024px] p-3">
          {failed ? (
            <Placeholder>Could not load the order book.</Placeholder>
          ) : rows ? (
            <Suspense fallback={<Placeholder>Loading workspace…</Placeholder>}>
              <ExplorEda
                key={mount}
                data={rows}
                savedData={shopDashboard}
                onStateChange={() => setEdited(true)}
              />
            </Suspense>
          ) : (
            <Placeholder>Loading orders…</Placeholder>
          )}
        </div>
      </div>
    </div>
  );
}
