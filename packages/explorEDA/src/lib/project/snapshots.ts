/**
 * A database source's snapshot: every row a read returned, with each
 * field's type and when the read happened. The server writes one file per
 * source under `.exploreda/snapshots/`; the folder reader reads it as that
 * source's data, so opening a project never queries the database.
 */
import type { DeclaredFieldType } from "@/lib/declaredFieldTypes";
import type { AnalysisSourceRow } from "@/types/AnalysisProject";
import type { datum } from "@/types/ChartTypes";
import { timestampOf } from "@/lib/valueParsing";

export const SNAPSHOT_FOLDER = ".exploreda/snapshots";
export const SNAPSHOT_FORMAT = "exploreda-snapshot";

/** Rows a database source may hold unless its `limit=` says otherwise. */
export const DEFAULT_ROW_LIMIT = 100_000;
/** The most bytes a snapshot may take, whatever its row limit. */
export const DEFAULT_BYTE_LIMIT = 100 * 1024 * 1024;

export interface SnapshotField {
  id: string;
  type: DeclaredFieldType;
  /** The database's own name for the column's type, such as `numeric(12,2)`. */
  databaseType?: string;
}

/** What a snapshot says about its read, without its rows. */
export interface SnapshotInfo {
  sourceId: string;
  connection: string;
  driver: string;
  /** When the read finished, as an ISO time. */
  readAt: string;
  rowCount: number;
  fields: SnapshotField[];
  /** Changes made while reading, such as a large number kept as text. */
  notes: string[];
}

export interface SnapshotFile extends SnapshotInfo {
  format: typeof SNAPSHOT_FORMAT;
  version: 1;
  /** One array per row, in field order. */
  rows: datum[][];
}

/** The snapshot file for a source. */
export function snapshotPath(sourceId: string) {
  return `${SNAPSHOT_FOLDER}/${encodeURIComponent(sourceId)}.json`;
}

export function isSnapshotPath(path: string) {
  return path.startsWith(`${SNAPSHOT_FOLDER}/`) && path.endsWith(".json");
}

/** Reads a snapshot file into rows keyed by field. */
export function parseSnapshot(text: string): {
  info: SnapshotInfo;
  rows: AnalysisSourceRow[];
} {
  const file = JSON.parse(text) as Partial<SnapshotFile>;
  if (
    file.format !== SNAPSHOT_FORMAT ||
    file.version !== 1 ||
    !Array.isArray(file.fields) ||
    !Array.isArray(file.rows)
  ) {
    throw new Error("This isn't a snapshot explorEDA can read.");
  }
  const ids = file.fields.map((field) => field.id);
  const rows = file.rows.map((values) => {
    const row: AnalysisSourceRow = {};
    ids.forEach((id, index) => {
      row[id] = values[index] ?? null;
    });
    return row;
  });
  return { info: snapshotInfo(file as SnapshotFile), rows };
}

/** What a snapshot says about its read, without its rows. */
export function snapshotInfo(file: SnapshotFile): SnapshotInfo {
  return {
    sourceId: file.sourceId,
    connection: file.connection,
    driver: file.driver,
    readAt: file.readAt,
    rowCount: file.rowCount,
    fields: file.fields,
    notes: file.notes ?? [],
  };
}

/** How long ago a time was, in words: "just now", "5 minutes ago". */
export function readAgo(readAt: string, now = Date.now()) {
  const then = timestampOf(readAt);
  const seconds = then === undefined ? NaN : Math.max(0, (now - then) / 1000);
  if (!Number.isFinite(seconds)) {
    return "at an unknown time";
  }
  const units: [number, string][] = [
    [86400, "day"],
    [3600, "hour"],
    [60, "minute"],
  ];
  for (const [size, unit] of units) {
    if (seconds >= size) {
      const count = Math.floor(seconds / size);
      return `${count} ${unit}${count === 1 ? "" : "s"} ago`;
    }
  }
  return "just now";
}
