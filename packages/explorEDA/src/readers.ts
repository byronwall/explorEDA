// Local file readers: CSV, TSV, and JSON files into rows and declared field
// types. No React; safe to use in workers, scripts, and servers.
export { readTableFile, readTableText } from "./lib/readers/readTable";
export {
  TABLE_FORMATS,
  tableFileAccept,
  tableFileTypes,
  tableFormatList,
  tableFormatOf,
  type TableFormatInfo,
} from "./lib/readers/formats";
export {
  TableReadError,
  type ReadTableOptions,
  type TableFile,
  type TableFormat,
} from "./lib/readers/types";
export type { DeclaredFieldType } from "./lib/declaredFieldTypes";
