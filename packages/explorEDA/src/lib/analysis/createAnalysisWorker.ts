/** Create the packaged worker used for interactive multi-source evaluation. */
export function createAnalysisWorker(): Worker {
  return new Worker(new URL("./analysis-worker.js", import.meta.url), {
    type: "module",
    name: "exploreda-analysis",
  });
}
