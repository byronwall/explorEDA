import { Button } from "@/components/ui/button";
import { ExampleData, examples, FEATURED_EXAMPLE_ID } from "@/demos/examples";
import {
  parseSavedAnalysis,
  validateSavedAnalysisForData,
  type SavedDataStructure,
} from "exploreda";
import {
  parseAnalysisProject,
  type AnalysisProjectFile,
} from "exploreda/analysis";

import { parseCsvData } from "./csvParser";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Lightbulb } from "lucide-react";
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Link,
  matchPath,
  Navigate,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { toast } from "sonner";
import { CsvUpload } from "./CsvUpload";
import { ChartDocs } from "./ChartDocs";
import { ExampleSelector } from "./ExampleSelector";
import { FeaturedExample } from "./landing/FeaturedExample";
import { IntegrationGuide } from "./landing/IntegrationGuide";
import { LearningLinks } from "./landing/LearningLinks";
import { WhyWorkspace } from "./landing/WhyWorkspace";
import { Hero } from "./landing/Hero";
import { LandingFooter } from "./landing/LandingFooter";
import { SampleDataButtons } from "./landing/SampleDataButtons";
import { PageFileDrop } from "./landing/PageFileDrop";
import { SectionHeading } from "./landing/SectionHeading";
import {
  readSavedViewsSessionResult,
  removeSavedSession,
  PROJECT_STORAGE_KEY,
  projectSession,
  STORAGE_KEY,
  type SavedViewsSession,
} from "./savedViewsSession";
import { examplePath, PROJECT_VIEWER_PATH, VIEWER_PATH } from "./routes";

const featuredExample = examples.find(
  (item) => item.id === FEATURED_EXAMPLE_ID
);

// Feature coverage is a development tool. Production builds drop it.
const CoverageMatrix = import.meta.env.DEV
  ? lazy(() =>
      import("./CoverageMatrix").then(({ CoverageMatrix: Matrix }) => ({
        default: Matrix,
      }))
    )
  : null;

const SavedViewsWorkspace = lazy(() =>
  import("./SavedViewsWorkspace").then(
    ({ SavedViewsWorkspace: Workspace }) => ({
      default: Workspace,
    })
  )
);

export type DatumObject = {
  [key: string]: string | number | boolean | null | undefined;
};

type Workspace =
  | {
      key: number;
      kind: "session";
      session: SavedViewsSession;
      /** The example the session started from, for its title and guide. */
      example?: ExampleData;
    }
  | {
      key: number;
      kind: "rows";
      rows: DatumObject[];
      savedData?: SavedDataStructure;
    }
  | { key: number; kind: "example"; example: ExampleData; rows: DatumObject[] };

type WorkspaceInput = Workspace extends infer W
  ? W extends Workspace
    ? Omit<W, "key">
    : never
  : never;

/** The example a workspace shows, if any. */
function workspaceExample(workspace: Workspace | null) {
  return workspace?.kind === "rows" ? undefined : workspace?.example;
}

function hasStoredSession() {
  try {
    return (
      localStorage.getItem(STORAGE_KEY) !== null ||
      localStorage.getItem(PROJECT_STORAGE_KEY) !== null
    );
  } catch {
    return false;
  }
}

function clearStoredSession(key = STORAGE_KEY) {
  try {
    removeSavedSession(key);
  } catch {
    // An unavailable storage area has no session to retain.
  }
}

/** Scrolls the home page to its hash target once the page has rendered. */
function ScrollToHash({ hash }: { hash: string }) {
  useEffect(() => {
    const target = hash ? document.getElementById(hash.slice(1)) : null;
    if (target) {
      target.scrollIntoView?.({ block: "start" });
    } else if (window.scrollY > 0) {
      window.scrollTo({ top: 0 });
    }
  }, [hash]);
  return null;
}

/**
 * The demo site. `/` is always the home page. `/examples/<id>` opens an
 * example, and `/viewer` reopens the last analysis saved in this browser.
 */
export function LandingPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const isViewer = location.pathname === VIEWER_PATH;
  // Multi-table projects keep their own saved session.
  const isProjectViewer = isViewer && searchParams.get("project") === "1";
  const viewerKey = isProjectViewer ? PROJECT_STORAGE_KEY : STORAGE_KEY;
  const routeExampleId =
    matchPath("/examples/:exampleId", location.pathname)?.params.exampleId ??
    null;
  // Links from before examples had their own URLs.
  const legacyExampleId =
    location.pathname === "/" ? searchParams.get("example") : null;
  const isHome = !isViewer && routeExampleId === null;
  const showCoverage =
    CoverageMatrix !== null && searchParams.get("view") === "coverage";
  const showDocs = searchParams.get("view") === "docs";

  const [workspace, setWorkspaceState] = useState<Workspace | null>(null);
  const currentWorkspace = useRef(workspace);
  currentWorkspace.current = workspace;
  const nextKey = useRef(0);
  const setWorkspace = useCallback(
    (value: WorkspaceInput | null) =>
      setWorkspaceState(
        value && ({ ...value, key: ++nextKey.current } as Workspace)
      ),
    []
  );
  const [restoreFailed, setRestoreFailed] = useState(false);
  const [analysisJson, setAnalysisJson] = useState("");
  const [analysisJsonError, setAnalysisJsonError] = useState<string | null>(
    null
  );
  const workspaceRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const motionY = shouldReduceMotion ? 0 : 20;

  const example = workspaceExample(workspace);
  const hasData = workspace !== null;
  const canResume = isHome && !hasData && hasStoredSession();

  useEffect(() => {
    if (!hasData || !workspaceRef.current) {
      return;
    }

    workspaceRef.current.focus({ preventScroll: true });
    workspaceRef.current.scrollIntoView?.({ block: "start" });
  }, [workspace?.key, hasData]);

  const fetchExampleData = useCallback(
    async (url: string, signal: AbortSignal) => {
      const response = await fetch(url, { signal });
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }
      return parseCsvData(await response.text());
    },
    []
  );

  // Home is a reset: it shows the landing page and leaves the saved
  // analysis in place for /viewer.
  const handleBack = () => {
    setRestoreFailed(false);
    setAnalysisJson("");
    setAnalysisJsonError(null);
    setLoadError(null);
    navigate("/");
  };

  const handleExampleSelect = useCallback(
    (id: string) => {
      setRestoreFailed(false);
      navigate(examplePath(id));
    },
    [navigate]
  );

  const openSession = useCallback(
    (session: SavedViewsSession) =>
      setWorkspace({
        kind: "session",
        session,
        example: examples.find((item) => item.id === session.exampleId),
      }),
    [setWorkspace]
  );

  useEffect(() => {
    if (isViewer) {
      setIsLoading(false);
      setLoadError(null);
      // Data imported a moment ago is already showing.
      const current = currentWorkspace.current;
      if (current && current.kind !== "example") {
        return;
      }
      const result = readSavedViewsSessionResult(viewerKey);
      setRestoreFailed(result.failed);
      if (result.session) {
        openSession(result.session);
        return;
      }
      // With no single-table analysis, reopen the last project instead.
      const project = isProjectViewer
        ? undefined
        : readSavedViewsSessionResult(PROJECT_STORAGE_KEY).session;
      if (!result.failed && project) {
        navigate(PROJECT_VIEWER_PATH, { replace: true });
        return;
      }
      setWorkspace(null);
      if (!result.failed) {
        // Nothing saved yet: the home page is where analyses start.
        navigate("/", { replace: true });
      }
      return;
    }
    if (routeExampleId === null) {
      setIsLoading(false);
      setWorkspace(null);
      setLoadError(null);
      return;
    }

    const selectedExample = examples.find((item) => item.id === routeExampleId);
    if (!selectedExample) {
      setIsLoading(false);
      setWorkspace(null);
      setLoadError("That example does not exist. Choose another example.");
      return;
    }
    const current = currentWorkspace.current;
    if (workspaceExample(current)?.id === selectedExample.id) {
      return;
    }
    // The example's URL reopens the session saved from it.
    const saved = readSavedViewsSessionResult(
      selectedExample.project ? PROJECT_STORAGE_KEY : STORAGE_KEY
    ).session;
    if (saved?.exampleId === selectedExample.id) {
      setIsLoading(false);
      setLoadError(null);
      openSession(saved);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setLoadError(null);
    setWorkspace(null);

    (selectedExample.project
      ? Promise.resolve([])
      : fetchExampleData(selectedExample.data, controller.signal)
    )
      .then((rows) => {
        setWorkspace({ kind: "example", example: selectedExample, rows });
      })
      .catch((error) => {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        const message =
          error instanceof Error ? error.message : "Unknown error";
        setLoadError(`Could not load this example (${message}). Try again.`);
        toast.error("Failed to load example data");
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [
    isViewer,
    isProjectViewer,
    viewerKey,
    routeExampleId,
    retryCount,
    fetchExampleData,
    navigate,
    openSession,
    setWorkspace,
  ]);

  const openImported = (
    rows: DatumObject[],
    savedData?: SavedDataStructure
  ) => {
    setRestoreFailed(false);
    // A new source starts a new saved analysis.
    clearStoredSession();
    setWorkspace({ kind: "rows", rows, savedData });
    setLoadError(null);
    navigate(VIEWER_PATH);
  };

  const handleCsvImport = (data: DatumObject[]) => openImported(data);

  // A project file keeps its own saved session beside the single-table one.
  const handleProjectImport = (file: AnalysisProjectFile) => {
    setRestoreFailed(false);
    setAnalysisJsonError(null);
    setLoadError(null);
    openSession(projectSession(file));
    navigate(PROJECT_VIEWER_PATH);
  };

  const handleAnalysisJson = () => {
    try {
      if (JSON.parse(analysisJson).format === "exploreda-project") {
        const file = parseAnalysisProject(analysisJson);
        handleProjectImport(file);
        return;
      }
      const analysis = parseSavedAnalysis(analysisJson);
      if (!validateSavedAnalysisForData(analysis)) {
        throw new Error("Analysis formulas do not match the saved source rows");
      }
      setAnalysisJsonError(null);
      openImported(analysis.data as DatumObject[], analysis.settings);
    } catch (error) {
      setAnalysisJsonError(
        error instanceof Error ? error.message : "Invalid analysis JSON"
      );
    }
  };

  if (legacyExampleId) {
    return <Navigate replace to={examplePath(legacyExampleId)} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground ">
      <div className="flex flex-col items-center gap-6 px-3 py-3 sm:px-5">
        {restoreFailed && (
          <div
            role="alert"
            className="w-full max-w-6xl rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm"
          >
            <p>
              Saved data could not be restored. The stored value is still
              available.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const result = readSavedViewsSessionResult(viewerKey);
                  setRestoreFailed(result.failed);
                  if (!result.session) {
                    return;
                  }
                  openSession(result.session);
                  navigate(
                    result.session.project ? PROJECT_VIEWER_PATH : VIEWER_PATH
                  );
                }}
              >
                Retry restore
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // The user can still import a new source if storage is unavailable.
                  clearStoredSession(viewerKey);
                  setRestoreFailed(false);
                  setWorkspace(null);
                  navigate("/");
                }}
              >
                Clear saved data and start with new data
              </Button>
            </div>
          </div>
        )}
        <AnimatePresence mode="wait">
          {!hasData ? (
            <motion.div
              key="selector"
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -motionY }}
              transition={shouldReduceMotion ? { duration: 0 } : undefined}
              className={
                showCoverage
                  ? "mx-auto w-full min-w-0 px-1 pt-2 sm:px-0"
                  : showDocs
                    ? "mx-auto w-full max-w-[calc(100vw-3rem)]"
                    : "landing mx-auto w-full max-w-6xl"
              }
            >
              {showDocs ? (
                <ChartDocs />
              ) : showCoverage && CoverageMatrix ? (
                <Suspense fallback={null}>
                  <CoverageMatrix />
                </Suspense>
              ) : (
                <>
                  <ScrollToHash hash={location.hash} />
                  <PageFileDrop
                    onProjectImport={handleProjectImport}
                    onImport={handleCsvImport}
                  />
                  {featuredExample && (
                    <Hero
                      onOpenFeatured={() =>
                        handleExampleSelect(featuredExample.id)
                      }
                      canResume={canResume}
                    />
                  )}
                  <div className="mt-28 space-y-28 pb-10">
                    {featuredExample && (
                      <FeaturedExample
                        example={featuredExample}
                        onOpen={handleExampleSelect}
                      />
                    )}
                    {loadError && (
                      <div
                        role="alert"
                        className="rounded-md border border-destructive/50 p-4 text-sm"
                      >
                        <p>{loadError}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          onClick={() => setRetryCount((count) => count + 1)}
                        >
                          Try again
                        </Button>
                      </div>
                    )}
                    <IntegrationGuide />
                    <WhyWorkspace />
                    <section aria-labelledby="examples-heading">
                      <div className="mb-8">
                        <SectionHeading
                          id="examples-heading"
                          heading="Examples"
                        >
                          Each example pairs a dataset with the views that
                          answer its question. Start at the top for a quick
                          tour; lower examples go deeper into calculations,
                          tracing, scale, and 3D.
                        </SectionHeading>
                      </div>
                      <LearningLinks />
                      <ExampleSelector onSelect={handleExampleSelect} />
                    </section>
                    <section
                      aria-labelledby="your-data-heading"
                      id="your-data"
                      className="scroll-mt-8"
                    >
                      <SectionHeading
                        id="your-data-heading"
                        heading="Try your own data"
                      >
                        Import a file into this demo, or reopen an analysis you
                        exported earlier. In your app, rows arrive through{" "}
                        <code>data</code> instead.
                      </SectionHeading>
                      <div className="mt-10 grid gap-6 lg:grid-cols-2">
                        <section
                          aria-labelledby="import-heading"
                          className="rounded-xl border border-border bg-card p-6"
                        >
                          <h3
                            id="import-heading"
                            className="mb-4 font-semibold"
                          >
                            Import your data
                          </h3>
                          <CsvUpload
                            onProjectImport={handleProjectImport}
                            onImport={handleCsvImport}
                          />
                          <SampleDataButtons onImport={handleCsvImport} />
                        </section>
                        <section
                          aria-labelledby="json-heading"
                          className="rounded-xl border border-border bg-card p-6"
                        >
                          <h3 id="json-heading" className="mb-1 font-semibold">
                            Open a saved analysis
                          </h3>
                          <p className="mb-3 text-sm text-muted-foreground">
                            Paste full analysis JSON to restore its source rows
                            and settings.
                          </p>
                          <textarea
                            value={analysisJson}
                            onChange={(event) => {
                              setAnalysisJson(event.target.value);
                              setAnalysisJsonError(null);
                            }}
                            aria-label="Full analysis JSON"
                            aria-describedby={
                              analysisJsonError
                                ? "analysis-json-error"
                                : undefined
                            }
                            placeholder="Paste full analysis JSON here"
                            className="min-h-32 w-full rounded-md border border-input bg-background p-3 font-mono text-xs"
                          />
                          <Button
                            className="mt-3"
                            onClick={handleAnalysisJson}
                            disabled={!analysisJson.trim()}
                          >
                            Open analysis JSON
                          </Button>
                          {analysisJsonError && (
                            <p
                              id="analysis-json-error"
                              role="alert"
                              aria-live="assertive"
                              className="mt-2 rounded-md border border-destructive/50 bg-destructive/10 p-2 text-sm text-destructive"
                            >
                              {analysisJsonError}
                            </p>
                          )}
                        </section>
                      </div>
                    </section>
                  </div>
                  <LandingFooter />
                </>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="plot"
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -motionY }}
              transition={shouldReduceMotion ? { duration: 0 } : undefined}
              className="mx-auto w-full max-w-[1600px]"
              ref={workspaceRef}
              tabIndex={-1}
            >
              <header className="eda-page-header">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBack}
                  aria-label="Back to examples"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="min-w-0 flex-1">
                  <h1 className="truncate text-lg font-semibold">
                    {example?.title ?? "Explore your data"}
                  </h1>
                  <p className="truncate text-xs text-muted-foreground">
                    {example?.description}
                  </p>
                </div>
                <Link
                  className="inline-flex shrink-0 items-center gap-1 rounded-sm text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  to="/#integration"
                >
                  <span className="sm:hidden">Embed in React</span>
                  <span className="hidden sm:inline">
                    Embed this workspace in your React app
                  </span>
                  <ArrowRight className="size-3" aria-hidden="true" />
                </Link>
              </header>
              {example?.guide && (
                <div
                  role="note"
                  className="mb-3 flex gap-3 rounded-lg border border-border bg-card px-3 py-2.5 text-sm shadow-xs"
                >
                  <Lightbulb
                    className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <div className="grid min-w-0 gap-2">
                    <p className="leading-relaxed">{example.guide}</p>
                    {example.id === FEATURED_EXAMPLE_ID && (
                      <ol
                        aria-label="Inspect a chart's settings"
                        className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-muted-foreground"
                      >
                        {[
                          "Add a chart",
                          "Edit it in Chart details",
                          "Inspect it in Chart spec",
                        ].map((step, index) => (
                          <li key={step} className="flex items-center gap-1.5">
                            {index > 0 && (
                              <span
                                aria-hidden="true"
                                className="mr-0.5 h-px w-3 bg-border"
                              />
                            )}
                            <span
                              aria-hidden="true"
                              className="grid h-4 w-4 place-items-center rounded-full border border-border bg-background font-mono text-[10px] text-foreground"
                            >
                              {index + 1}
                            </span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                </div>
              )}
              <Suspense
                fallback={
                  <div role="status" aria-live="polite">
                    Loading workspace…
                  </div>
                }
              >
                {workspace?.kind === "session" ? (
                  <SavedViewsWorkspace
                    key={workspace.key}
                    data={[]}
                    initialSession={workspace.session}
                    viewName="Analysis"
                  />
                ) : workspace?.kind === "rows" ? (
                  <SavedViewsWorkspace
                    key={workspace.key}
                    data={workspace.rows}
                    initialSettings={workspace.savedData}
                    viewName="Analysis"
                  />
                ) : workspace?.kind === "example" ? (
                  <SavedViewsWorkspace
                    key={workspace.key}
                    data={workspace.rows}
                    initialSettings={workspace.example.savedData}
                    initialViews={workspace.example.views}
                    initialProject={workspace.example.project}
                    sourceTables={workspace.example.tables}
                    queryPresets={workspace.example.queryPresets}
                    viewName={
                      workspace.example.viewName ?? workspace.example.title
                    }
                    exampleId={workspace.example.id}
                  />
                ) : null}
              </Suspense>
            </motion.div>
          )}
        </AnimatePresence>
        {isLoading && (
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center"
            role="status"
            aria-live="polite"
            aria-busy="true"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="motion-safe:animate-spin rounded-full h-16 w-16 border-b-2 border-primary" />
              <span>Loading example data…</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
