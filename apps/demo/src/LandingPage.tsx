import { Button } from "@/components/ui/button";
import { ExampleData, examples } from "@/demos/examples";

import { parseCsvData } from "./csvParser";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
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
import { ExampleSelector } from "./ExampleSelector";

const ExplorEda = lazy(() =>
  import("exploreda").then(({ ExplorEda: Workspace }) => ({
    default: Workspace,
  }))
);

export type DatumObject = {
  [key: string]: string | number | boolean | undefined;
};

export function LandingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [csvData, setCsvData] = useState<DatumObject[]>([]);
  const [exampleData, setExampleData] = useState<DatumObject[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const exampleId = searchParams.get("example");

  const [example, setExample] = useState<ExampleData | null>(null);
  const [isCsvMode, setIsCsvMode] = useState(false);
  const workspaceRef = useRef<HTMLDivElement>(null);

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
    setLoadError(null);
  };

  const handleExampleSelect = useCallback(
    (id: string) => {
      setSearchParams({ example: id });
    },
    [setSearchParams]
  );

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
    setLoadError(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground ">
      <div className="flex flex-col items-center p-8 gap-8">
        {hasData && (
          <Button
            variant="ghost"
            className="self-start"
            onClick={handleClearData}
          >
            <X className="h-4 w-4" />
            Return to Examples
          </Button>
        )}
        <AnimatePresence mode="wait">
          {!hasData ? (
            <motion.div
              key="selector"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-3xl mx-auto"
            >
              <h1 className="text-3xl font-bold mb-3 text-center">
                Explore data by connecting charts and filters
              </h1>
              <p className="text-center text-muted-foreground mb-8">
                Start with an example or import your own CSV or JSON data.
              </p>
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    Import CSV or JSON data
                  </h2>
                  <CsvUpload onImport={handleCsvImport} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    Try Example Data
                  </h2>
                  <ExampleSelector onSelect={handleExampleSelect} />
                </div>
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
            </motion.div>
          ) : (
            <motion.div
              key="plot"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-[1200px] mx-auto"
              ref={workspaceRef}
              tabIndex={-1}
            >
              <Suspense
                fallback={
                  <div role="status" aria-live="polite">
                    Loading workspace…
                  </div>
                }
              >
                {isCsvMode ? (
                  <ExplorEda data={csvData} savedData={undefined} />
                ) : (
                  <ExplorEda
                    data={exampleData}
                    savedData={example?.savedData}
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
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary" />
              <span>Loading example data…</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
