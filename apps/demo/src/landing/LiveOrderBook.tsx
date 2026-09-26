import { Button } from "@/components/ui/button";
import { shopDashboard } from "@/demos/dashboardSettings";
import { Maximize2, RotateCcw } from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";
import { parseCsvData } from "../csvParser";
import type { DatumObject } from "../LandingPage";

const ExplorEda = lazy(() =>
  import("exploreda").then(({ ExplorEda: Workspace }) => ({
    default: Workspace,
  }))
);

const DATA_URL = "/explorEDA/datasets/shop-operations.csv";

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
    <div className="landing-shot overflow-hidden rounded-xl border border-border bg-card text-left">
      <div className="flex items-center gap-3 border-b border-border bg-muted/40 px-3 py-2">
        <span className="hidden truncate rounded-md bg-background px-3 py-0.5 font-mono text-[11px] text-muted-foreground sm:block">
          your-app.example/orders
        </span>
        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
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
        className="landing-frame h-[560px] overflow-auto bg-background sm:h-[680px]"
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
