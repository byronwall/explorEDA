import { Button } from "@/components/ui/button";
import { ExampleData, examples, FEATURED_EXAMPLE_ID } from "@/demos/examples";
import {
  parseSavedAnalysis,
  type SavedDataStructure,
  validateSavedAnalysisForData,
} from "exploreda";

import { parseCsvData } from "./csvParser";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Code2, Lightbulb, RotateCcw } from "lucide-react";
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "react-router-dom";
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

const ExplorEda = lazy(() =>
  import("exploreda").then(({ ExplorEda: Workspace }) => ({
    default: Workspace,
  }))
);

export type DatumObject = {
  [key: string]: string | number | boolean | null | undefined;
};

export function LandingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [csvData, setCsvData] = useState<DatumObject[]>([]);
  const [exampleData, setExampleData] = useState<DatumObject[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const exampleId = searchParams.get("example");
  const showCoverage =
    CoverageMatrix !== null && searchParams.get("view") === "coverage";
  const showDocs = searchParams.get("view") === "docs";

  const [example, setExample] = useState<ExampleData | null>(null);
  const [isCsvMode, setIsCsvMode] = useState(false);
  const [capturedState, setCapturedState] = useState<
    SavedDataStructure | undefined
  >();
  const [csvSavedData, setCsvSavedData] = useState<
    SavedDataStructure | undefined
  >();
  const [analysisJson, setAnalysisJson] = useState("");
  const [analysisJsonError, setAnalysisJsonError] = useState<string | null>(
    null
  );
  const [workspaceKey, setWorkspaceKey] = useState(0);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const motionY = shouldReduceMotion ? 0 : 20;

  const hasData = example !== null || isCsvMode;

  useEffect(() => {
    if (!hasData || !workspaceRef.current) {
      return;
    }

    workspaceRef.current.focus({ preventScroll: true });
    workspaceRef.current.scrollIntoView?.({ block: "start" });
  }, [exampleId, hasData]);

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

  const handleClearData = () => {
    setSearchParams({});
    setExample(null);
    setIsCsvMode(false);
    setCsvData([]);
    setCapturedState(undefined);
    setCsvSavedData(undefined);
    setAnalysisJson("");
    setAnalysisJsonError(null);
    setLoadError(null);
  };

  const handleStateChange = useCallback((state: SavedDataStructure) => {
    setCapturedState(state);
  }, []);

  const handleResetWorkspace = () => {
    if (!capturedState) {
      return;
    }

    // Re-mount with the original loaded props instead of the latest emitted state.
    setCapturedState(undefined);
    setWorkspaceKey((key) => key + 1);
  };

  const handleExampleSelect = useCallback(
    (id: string) => {
      setSearchParams({ example: id });
    },
    [setSearchParams]
  );

  useEffect(() => {
    setCapturedState(undefined);
  }, [exampleId]);

  useEffect(() => {
    if (!exampleId) {
      setIsLoading(false);
      setExample(null);
      setExampleData([]);
      setLoadError(null);
      return;
    }

    const selectedExample = examples.find((item) => item.id === exampleId);
    if (!selectedExample) {
      setIsLoading(false);
      setLoadError("That example does not exist. Choose another example.");
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setLoadError(null);
    setExample(null);
    setExampleData([]);

    fetchExampleData(selectedExample.data, controller.signal)
      .then((data) => {
        setExampleData(data);
        setExample(selectedExample);
        setIsCsvMode(false);
        setCsvData([]);
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
  }, [exampleId, fetchExampleData, retryCount]);

  const handleCsvImport = (data: DatumObject[]) => {
    setIsCsvMode(true);
    setSearchParams({});
    setExample(null);
    setCsvData(data);
    setCapturedState(undefined);
    setCsvSavedData(undefined);
    setLoadError(null);
  };

  const handleAnalysisJson = () => {
    try {
      const analysis = parseSavedAnalysis(analysisJson);
      if (!validateSavedAnalysisForData(analysis)) {
        throw new Error("Analysis formulas do not match the saved source rows");
      }
      setCsvData(analysis.data as DatumObject[]);
      setCsvSavedData(analysis.settings);
      setIsCsvMode(true);
      setSearchParams({});
      setExample(null);
      setCapturedState(undefined);
      setAnalysisJsonError(null);
    } catch (error) {
      setAnalysisJsonError(
        error instanceof Error ? error.message : "Invalid analysis JSON"
      );
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground ">
      <div className="flex flex-col items-center gap-6 px-3 py-3 sm:px-5">
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
                  <PageFileDrop onImport={handleCsvImport} />
                  {featuredExample && (
                    <Hero
                      onOpenFeatured={() =>
                        handleExampleSelect(featuredExample.id)
                      }
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
                          <CsvUpload onImport={handleCsvImport} />
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
                  onClick={handleClearData}
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
                <a
                  className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-border bg-background px-2.5 text-xs font-medium text-foreground shadow-xs transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  href="/#integration"
                  aria-label="React integration guide"
                >
                  <Code2
                    className="h-3.5 w-3.5 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span className="sm:hidden">Guide</span>
                  <span className="hidden sm:inline">
                    React integration guide
                  </span>
                </a>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={!capturedState}
                  onClick={handleResetWorkspace}
                  aria-label="Reset workspace"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
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
                {isCsvMode ? (
                  <ExplorEda
                    key={workspaceKey}
                    data={csvData}
                    savedData={csvSavedData}
                    onStateChange={handleStateChange}
                  />
                ) : (
                  <ExplorEda
                    key={workspaceKey}
                    data={exampleData}
                    savedData={example?.savedData}
                    onStateChange={handleStateChange}
                  />
                )}
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
