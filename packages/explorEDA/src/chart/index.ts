/**
 * Standalone charts: one explorEDA chart from rows and a config, without
 * the workspace. Each chart type's code loads the first time a chart of
 * that type draws, so a page carries only the types it uses. Import
 * `exploreda/chart-core` instead to register types up front yourself.
 */
import { loadTypesOnDemand } from "./loaders";

loadTypesOnDemand();

export * from "./core";
