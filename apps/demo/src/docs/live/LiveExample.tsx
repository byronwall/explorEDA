import { Button } from "@/components/ui/button";
import { ActionTooltip } from "@/components/ui/tooltip";
import { examplePath } from "@/routes";
import type { DatumObject } from "@/LandingPage";
import { readTableText } from "exploreda/readers";
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
import { findLiveExample, liveExampleHeight } from "./examples";

const ExplorEda = lazy(() =>
  import("exploreda").then(({ ExplorEda: Workspace }) => ({
    default: Workspace,
  }))
);

const NotebookFindingsExample = lazy(() => import("./NotebookFindingsExample"));

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
 *
 * The frame shows the charts and little else: the workspace toolbar and
 * status bar stay hidden unless the example is about them (`chrome`), and
 * Full example opens the whole workspace.
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
      .then((text) => setRows(readTableText(text).rows as DatumObject[]))
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

  // A loaded workspace or notebook takes its own height. A settings surface,
  // and the placeholder before anything loads, take the example's height.
  const fixedHeight = !rows || (spec.notebook === undefined && spec.surface);

  return (
    <figure
      ref={root}
      className="my-6"
      data-docs-example={id}
      data-docs-shot={`example-${id}`}
    >
      <div className="overflow-hidden rounded-lg border border-border bg-background">
        {wide ? (
          <div
            role="region"
            aria-label={spec.label}
            // The workspace's drawers stay fixed to the viewport, as in any
            // host. Containing them here would misplace anchored menus.
            className="docs-live"
            style={
              fixedHeight ? { height: liveExampleHeight(spec) } : undefined
            }
            data-docs-live={id}
            data-docs-chrome={
              spec.notebook === undefined && spec.chrome ? "" : undefined
            }
          >
            {failed ? (
              <Status>Could not load the example data.</Status>
            ) : rows ? (
              <Suspense fallback={<Status>Loading workspace…</Status>}>
                {spec.notebook !== undefined ? (
                  <NotebookFindingsExample
                    key={mount}
                    text={spec.notebook}
                    rows={rows}
                    onEdit={() => setEdited(true)}
                  />
                ) : spec.surface ? (
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
          <div className="p-4 text-sm text-muted-foreground">
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
      <figcaption className="mt-1.5 flex items-start gap-3 text-sm leading-6 text-muted-foreground">
        <span className="min-w-0 flex-1">{caption}</span>
        <span className="flex shrink-0 items-center gap-0.5">
          {wide && edited && (
            <ActionTooltip content="Reset the example">
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                aria-label="Reset the example"
                onClick={() => {
                  setEdited(false);
                  setMount((key) => key + 1);
                }}
              >
                <RotateCcw aria-hidden="true" />
              </Button>
            </ActionTooltip>
          )}
          <Button asChild variant="ghost" size="sm" className="h-7 px-2">
            <Link
              to={
                spec.notebook !== undefined
                  ? spec.fullPath
                  : examplePath(spec.exampleId)
              }
            >
              <Maximize2 aria-hidden="true" />
              {spec.notebook !== undefined ? "Daily example" : "Full example"}
            </Link>
          </Button>
        </span>
      </figcaption>
    </figure>
  );
}
