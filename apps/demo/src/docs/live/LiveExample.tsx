import { Button } from "@/components/ui/button";
import { examplePath } from "@/routes";
import type { DatumObject } from "@/LandingPage";
import { parseCsvData } from "@/csvParser";
import { Maximize2, RotateCcw } from "lucide-react";
import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Link } from "react-router-dom";
import { LIVE_MIN_WIDTH, liveShotPath } from "../paths";
import { describeStep, findLiveExample, liveExampleHeight } from "./examples";

const ExplorEda = lazy(() =>
  import("exploreda").then(({ ExplorEda: Workspace }) => ({
    default: Workspace,
  }))
);

const ChartSettingsSurface = lazy(() =>
  import("exploreda/docs-kit").then(({ ChartSettingsSurface: Surface }) => ({
    default: Surface,
  }))
);

function useWideViewport() {
  const query = `(min-width: ${LIVE_MIN_WIDTH}px)`;
  const [wide, setWide] = useState(
    () => typeof window !== "undefined" && window.matchMedia?.(query).matches
  );
  useEffect(() => {
    const media = window.matchMedia?.(query);
    if (!media) {
      return;
    }
    const update = () => setWide(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);
  return wide;
}

/** True once the element has come near the viewport. */
function useSeen(ref: React.RefObject<HTMLElement | null>, eager: boolean) {
  const [seen, setSeen] = useState(eager);
  useEffect(() => {
    if (seen || !ref.current || typeof IntersectionObserver === "undefined") {
      if (typeof IntersectionObserver === "undefined") {
        setSeen(true);
      }
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, seen]);
  return seen;
}

function Status({ children }: { children: ReactNode }) {
  return (
    <div
      role="status"
      className="flex h-full items-center justify-center text-sm text-muted-foreground"
    >
      {children}
    </div>
  );
}

/**
 * A real explorEDA workspace on a docs page, loaded with a fixture and a
 * focused layout. It never reads or writes a saved session, so trying it
 * leaves the reader's own analyses alone. Narrow screens see a screenshot
 * of the same layout instead.
 */
export function LiveExample({
  id,
  caption,
  capture = false,
}: {
  id: string;
  caption?: ReactNode;
  /** Renders wide and at once, for the screenshot route. */
  capture?: boolean;
}) {
  const spec = findLiveExample(id);
  const root = useRef<HTMLElement>(null);
  const wideViewport = useWideViewport();
  const wide = capture || wideViewport;
  const seen = useSeen(root, capture);
  const [rows, setRows] = useState<DatumObject[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [edited, setEdited] = useState(false);
  const [mount, setMount] = useState(0);
  const [shotMissing, setShotMissing] = useState(false);

  useEffect(() => {
    if (!spec || !wide || !seen || rows) {
      return;
    }
    const controller = new AbortController();
    fetch(spec.data, { signal: controller.signal })
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
  }, [spec, wide, seen, rows]);

  if (!spec) {
    return null;
  }

  return (
    <figure
      ref={root}
      className="my-8"
      data-docs-example={id}
      data-docs-steps={JSON.stringify(spec.steps)}
      data-docs-shot={`example-${id}`}
    >
      <div className="landing-shot overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border bg-muted/40 py-1 pl-3.5 pr-1.5">
          <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            {wide && (
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-[var(--eda-dsl-string)] shadow-[0_0_0_3px_color-mix(in_oklab,var(--eda-dsl-string)_20%,transparent)]"
              />
            )}
            {wide ? "Live example · edits stay on this page" : "Screenshot"}
          </span>
          <div className="ml-auto flex items-center gap-1">
            {wide && (
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
                Start over
              </Button>
            )}
            <Button asChild variant="ghost" size="sm">
              <Link to={examplePath(spec.exampleId)}>
                <Maximize2 aria-hidden="true" />
                Full example
              </Link>
            </Button>
          </div>
        </div>
        {wide ? (
          <div
            role="region"
            aria-label={spec.label}
            // The workspace's drawers stay fixed to the viewport, as in any
            // host. Containing them here would misplace anchored menus.
            className="bg-background p-3"
            style={
              rows ? { minHeight: 420 } : { height: liveExampleHeight(spec) }
            }
            data-docs-live={id}
          >
            {failed ? (
              <Status>Could not load the example data.</Status>
            ) : rows ? (
              <Suspense fallback={<Status>Loading workspace…</Status>}>
                {spec.surface ? (
                  <div
                    key={mount}
                    className="h-full overflow-auto"
                    onInput={() => setEdited(true)}
                    onChange={() => setEdited(true)}
                  >
                    <ChartSettingsSurface
                      data={rows}
                      savedData={spec.savedData}
                      chartId={spec.surface.chart}
                    />
                  </div>
                ) : (
                  <ExplorEda
                    key={mount}
                    data={rows}
                    savedData={spec.savedData}
                    onStateChange={() => setEdited(true)}
                  />
                )}
              </Suspense>
            ) : (
              <Status>Loading example…</Status>
            )}
          </div>
        ) : shotMissing ? (
          <div className="p-6 text-sm text-muted-foreground">
            Open the full example on a wider screen to try this view.
          </div>
        ) : (
          <img
            className="block w-full"
            src={liveShotPath(id)}
            alt={spec.shotAlt}
            onError={() => setShotMissing(true)}
          />
        )}
      </div>
      {caption && (
        <figcaption className="mt-3 text-sm leading-6 text-muted-foreground">
          {caption}
        </figcaption>
      )}
      {wide && spec.steps.length > 0 && (
        <div className="mt-4 rounded-lg border border-border bg-card px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-foreground/70">
            Try this
          </p>
          <ol
            aria-label="Try this"
            className="mt-2 space-y-1.5 text-sm leading-6 text-foreground/80"
          >
            {spec.steps.map((step, index) => (
              <li key={index} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[0.7rem] font-semibold text-primary"
                >
                  {index + 1}
                </span>
                {describeStep(spec, step)}
              </li>
            ))}
          </ol>
        </div>
      )}
    </figure>
  );
}
