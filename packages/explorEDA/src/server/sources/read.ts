/**
 * Reads one database source into a snapshot: every row or none. A read
 * stops as soon as it passes the row limit, the byte limit, or its time,
 * so a source too big to keep never fills the server's memory.
 */
import { fieldNamesFromHeader } from "../../lib/readers/columns";
import { convertColumn } from "../../lib/readers/typedColumns";
import {
  SNAPSHOT_FORMAT,
  type SnapshotField,
  type SnapshotFile,
} from "../../lib/project/snapshots";
import type { datum } from "../../types/ChartTypes";
import {
  SourceReadError,
  type DatabaseSession,
  type ReadLimits,
  type ReadRequest,
} from "./types";

export interface SnapshotRequest extends ReadRequest {
  connection: string;
  driver: string;
}

/** A rough count of the bytes a value takes in the snapshot file. */
function sizeOf(value: unknown) {
  if (value === null || value === undefined) {
    return 5;
  }
  if (typeof value === "string") {
    return value.length + 3;
  }
  if (ArrayBuffer.isView(value)) {
    return value.byteLength * 2;
  }
  return 10;
}

const count = (value: number) => value.toLocaleString("en-US");

/** A limit a little above `rows`, rounded so it reads easily. */
function roomyLimit(rows: number) {
  const target = rows * 2;
  const step = 10 ** Math.max(0, Math.floor(Math.log10(target)) - 1);
  return Math.ceil(target / step) * step;
}

export async function readSnapshot(
  session: DatabaseSession,
  request: SnapshotRequest,
  limits: ReadLimits,
  signal?: AbortSignal
): Promise<SnapshotFile> {
  const controller = new AbortController();
  const timer = setTimeout(
    () =>
      controller.abort(
        new SourceReadError(
          "timeout",
          `${request.sourceId} took longer than ${Math.round(limits.timeout / 1000)} seconds to read.`,
          "Read fewer rows or columns with sql=, or try again when the database is less busy."
        )
      ),
    limits.timeout
  );
  const cancel = () =>
    controller.abort(
      new SourceReadError("cancelled", `Reading ${request.sourceId} stopped.`)
    );
  if (signal?.aborted) {
    cancel();
  }
  signal?.addEventListener("abort", cancel, { once: true });
  const stopIfAborted = () => {
    if (controller.signal.aborted) {
      throw controller.signal.reason;
    }
  };
  try {
    stopIfAborted();
    const cursor = await session.read(
      { ...request, timeout: limits.timeout },
      controller.signal
    );
    const notes: string[] = [];
    const names = fieldNamesFromHeader(cursor.names, notes);
    const values: unknown[][] = names.map(() => []);
    let rows = 0;
    let bytes = 0;
    for await (const batch of cursor.batches) {
      stopIfAborted();
      for (const row of batch) {
        rows += 1;
        if (rows > limits.rows) {
          throw new SourceReadError(
            "too-many-rows",
            `${request.sourceId} has more than ${count(limits.rows)} rows.`,
            `Raise its limit, as limit=${roomyLimit(limits.rows)}, or read fewer rows with sql=.`
          );
        }
        for (let index = 0; index < names.length; index++) {
          const value = row[index];
          bytes += sizeOf(value);
          values[index]!.push(value);
        }
        if (bytes > limits.bytes) {
          throw new SourceReadError(
            "too-large",
            `${request.sourceId} is larger than ${Math.round(limits.bytes / 1024 / 1024)} MB.`,
            "Read fewer columns or rows with sql=."
          );
        }
      }
    }
    stopIfAborted();
    const columns = cursor.columns(values);
    const fields: SnapshotField[] = [];
    const typed = columns.map((column, index) => {
      const converted = convertColumn(column, values[index]!);
      const name = names[index]!;
      if (
        (column.kind === "integer" || column.kind === "decimal") &&
        converted.type === "string"
      ) {
        notes.push(
          `${name} keeps its numbers as text, because some are too precise for a JavaScript number.`
        );
      }
      fields.push({
        id: name,
        type: converted.type ?? "string",
        ...(cursor.databaseTypes[index]
          ? { databaseType: cursor.databaseTypes[index] }
          : {}),
      });
      return converted.values;
    });
    const table: datum[][] = new Array(rows);
    for (let row = 0; row < rows; row++) {
      table[row] = typed.map((column) => column[row] ?? null);
    }
    return {
      format: SNAPSHOT_FORMAT,
      version: 1,
      sourceId: request.sourceId,
      connection: request.connection,
      driver: request.driver,
      readAt: new Date().toISOString(),
      rowCount: rows,
      fields,
      notes,
      rows: table,
    };
  } catch (error) {
    if (controller.signal.aborted) {
      throw controller.signal.reason;
    }
    throw error;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", cancel);
  }
}
