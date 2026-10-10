// Multi-table projects: definitions, a pure query evaluator, and the project
// file format. No React; safe to use in workers, scripts, and servers.
export type * from "./types/AnalysisProject";
export { evaluateAnalysisQuery } from "./lib/analysis/evaluateProject";
export {
  parseAnalysisProject,
  selectAnalysisProjectView,
  stringifyAnalysisProject,
  type AnalysisProjectFile,
  type AnalysisProjectFileInput,
} from "./lib/analysis/projectFile";
export { createAnalysisWorker } from "./lib/analysis/createAnalysisWorker";
export {
  addSourceFromRows,
  renameSettingsFields,
  singleTableProject,
  sourceFromRows,
} from "./lib/analysis/sources";
