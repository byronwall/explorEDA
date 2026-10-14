import type { DataType, Field } from "@uwdata/flechette";
import { fieldNamesFromHeader } from "./columns";
import { decompressLz4Frame } from "./lz4";
import { convertColumn, type Column, type Kind } from "./typedColumns";
import { TableReadError } from "./types";
import type {
  AnalysisSourceRow,
  FieldDefinition,
} from "@/types/AnalysisProject";

// Arrow's type IDs, from the IPC format.
const TYPE = {
  Int: 2,
  Float: 3,
  Binary: 4,
  Utf8: 5,
  Bool: 6,
  Decimal: 7,
  Date: 8,
  Time: 9,
  Timestamp: 10,
  LargeBinary: 19,
  LargeUtf8: 20,
  BinaryView: 23,
  Utf8View: 24,
  Dictionary: -1,
} as const;

/** Fractional digits for Arrow's time units: seconds to nanoseconds. */
const UNIT_DIGITS = [0, 3, 6, 9];

function classify(name: string, type: DataType): Column {
  const column = (kind: Kind, scale = 0, utc = true): Column => ({
    name,
    kind,
    scale,
    utc,
  });
  const info = type as DataType & {
    unit?: number;
    scale?: number;
    timezone?: string | null;
    dictionary?: DataType;
  };
  switch (type.typeId as number) {
    case TYPE.Dictionary:
      return classify(name, info.dictionary!);
    case TYPE.Int:
      return column("integer");
    case TYPE.Float:
      return column("float");
    case TYPE.Bool:
      return column("boolean");
    case TYPE.Decimal:
      return column("decimal", info.scale ?? 0);
    case TYPE.Date:
      return { ...column("date"), dateUnit: "ms" };
    case TYPE.Time:
      return column("time", UNIT_DIGITS[info.unit ?? 1] ?? 3);
    case TYPE.Timestamp:
      return column(
        "timestamp",
        UNIT_DIGITS[info.unit ?? 1] ?? 3,
        Boolean(info.timezone)
      );
    case TYPE.Utf8:
    case TYPE.LargeUtf8:
    case TYPE.Utf8View:
    case TYPE.Binary:
    case TYPE.LargeBinary:
    case TYPE.BinaryView:
      return column("text");
    default:
      return column("json");
  }
}

let codecsReady = false;

// Arrow's body compression codes.
const COMPRESSION = { LZ4_FRAME: 0, ZSTD: 1 } as const;
const FILE_MAGIC = [0x41, 0x52, 0x52, 0x4f, 0x57, 0x31]; // "ARROW1"

const isIpcFile = (data: Uint8Array) =>
  FILE_MAGIC.every((byte, index) => data[index] === byte);

/**
 * Reads an Arrow IPC file or stream, including Feather V2. Columns take the
 * schema's types with the same rules as Parquet: timestamps keep their
 * stored precision, decimals keep exact digits, 64-bit integers past 2^53
 * stay text, and nested values become JSON text. LZ4 and zstd buffers are
 * read.
 */
export async function readArrow(bytes: ArrayBuffer): Promise<{
  rows: AnalysisSourceRow[];
  fields: FieldDefinition[];
  notes: string[];
}> {
  const [
    { decodeIPC },
    { createTable },
    { setCompressionCodec },
    { decompress },
  ] = await Promise.all([
    import("@uwdata/flechette/src/decode/decode-ipc.js"),
    import("@uwdata/flechette/src/decode/table-from-ipc.js"),
    import("@uwdata/flechette/src/compression.js"),
    import("fzstd"),
  ]);
  if (!codecsReady) {
    setCompressionCodec(COMPRESSION.LZ4_FRAME, {
      encode: () => {
        throw new Error("explorEDA only reads Arrow data.");
      },
      decode: (data: Uint8Array, length: number) =>
        decompressLz4Frame(data, length),
    });
    setCompressionCodec(COMPRESSION.ZSTD, {
      encode: () => {
        throw new Error("explorEDA only reads Arrow data.");
      },
      decode: (data: Uint8Array, length: number) =>
        decompress(data, new Uint8Array(length)),
    });
    codecsReady = true;
  }
  let table: ReturnType<typeof createTable>;
  try {
    const data = new Uint8Array(bytes);
    const decoded = decodeIPC(data);
    // A file's dictionaries apply to all of its record batches, wherever
    // the writer placed them; Polars writes them after the records.
    if (isIpcFile(data) && decoded.dictsBeforeRecord) {
      decoded.dictsBeforeRecord = decoded.dictsBeforeRecord.map(
        () => decoded.dictionaries?.length ?? 0
      );
    }
    table = createTable(decoded, {
      useDecimalInt: true,
      useBigInt: true,
      useBigIntTimestamp: true,
    });
  } catch (error) {
    throw new TableReadError(
      `The file is not a readable Arrow or Feather file (${error instanceof Error ? error.message : String(error)}).`
    );
  }
  const schemaFields = table.schema.fields as Field[];
  const columns = schemaFields.map((field) => classify(field.name, field.type));
  const notes: string[] = [];
  const names = fieldNamesFromHeader(
    columns.map((column) => column.name),
    notes
  );
  const rows: AnalysisSourceRow[] = Array.from(
    { length: table.numRows },
    () => ({})
  );
  const fields = columns.map((column, index) => {
    const name = names[index]!;
    const values = Array.from(
      table.getChildAt(index)!.toArray() as ArrayLike<unknown>
    );
    const converted = convertColumn(column, values);
    converted.values.forEach((value, row) => {
      rows[row]![name] = value;
    });
    return { id: name, name, type: converted.type };
  });
  return { rows, fields, notes };
}
