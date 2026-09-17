import { Button } from "@/components/ui/button";
import { ExampleData, examples } from "@/demos/examples";
import type { SavedDataStructure } from "exploreda";

import { parseCsvData } from "./csvParser";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, RotateCcw } from "lucide-react";
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
import { CoverageMatrix } from "./CoverageMatrix";
import { ExampleSelector } from "./ExampleSelector";

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
  const showCoverage = searchParams.get("view") === "coverage";

  const [example, setExample] = useState<ExampleData | null>(null);
  const [isCsvMode, setIsCsvMode] = useState(false);
  const [capturedState, setCapturedState] = useState<
    SavedDataStructure | undefined
  >();
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
    setLoadError(null);
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
                  ? "mx-auto w-full max-w-[calc(100vw-3rem)]"
                  : "mx-auto w-full max-w-5xl"
              }
            >
              {showCoverage ? (
                <CoverageMatrix />
              ) : (
                <>
                  <h1 className="mb-2 text-center text-2xl font-bold sm:text-3xl">
                    Explore data by connecting charts and filters
                  </h1>
                  <p className="mb-8 text-center text-muted-foreground">
                    Bring your data in, or start with a focused question.
                  </p>
                  <div className="space-y-10">
                    <section aria-labelledby="import-heading">
                      <h2
                        id="import-heading"
                        className="mb-3 text-xl font-semibold"
                      >
                        Import your data
                      </h2>
                      <CsvUpload onImport={handleCsvImport} />
                    </section>
                    <section aria-labelledby="examples-heading">
                      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                        <div>
                          <h2
                            id="examples-heading"
                            className="text-xl font-semibold"
                          >
                            Start with a question
                          </h2>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Open a complete linked dashboard, or browse focused
                            component examples.
                          </p>
                        </div>
                        <Button
                          variant="link"
                          className="px-0"
                          onClick={() => setSearchParams({ view: "coverage" })}
                        >
                          Learn: feature coverage
                        </Button>
                      </div>
                      <ExampleSelector
                        examplesToShow={examples.filter(
                          (item) => item.dashboard
                        )}
                        onSelect={handleExampleSelect}
                      />
                      <details className="mt-6 rounded-lg border border-border/70 px-4">
                        <summary className="cursor-pointer py-3 font-medium">
                          Show all examples
                        </summary>
                        <div className="pb-4">
                          <ExampleSelector
                            examplesToShow={examples.filter(
                              (item) => !item.dashboard
                            )}
                            onSelect={handleExampleSelect}
                          />
                        </div>
                      </details>
                    </section>
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
                  </div>
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
                  title="Back to examples"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="min-w-0 flex-1">
                  <h1
                    title={example?.title}
                    className="truncate text-lg font-semibold"
                  >
                    {example?.title ?? "Explore your data"}
                  </h1>
                  <p
                    className="truncate text-xs text-muted-foreground"
                    title={example?.description}
                  >
                    {example?.description}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={!capturedState}
                  onClick={handleResetWorkspace}
                  aria-label="Reset workspace"
                  title="Reset workspace"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </header>
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
                    savedData={undefined}
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
