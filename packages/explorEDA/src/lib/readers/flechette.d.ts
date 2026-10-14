// Flechette's own modules, imported directly so the codec registry,
// decoder, and table builder are one module instance in every build.
declare module "@uwdata/flechette/src/decode/decode-ipc.js" {
  import type { ArrowData } from "@uwdata/flechette";
  export function decodeIPC(data: Uint8Array): ArrowData & {
    dictsBeforeRecord?: number[];
  };
}
declare module "@uwdata/flechette/src/decode/table-from-ipc.js" {
  import type { ArrowData, ExtractionOptions, Table } from "@uwdata/flechette";
  export function createTable(
    data: ArrowData,
    options?: ExtractionOptions
  ): Table;
}
declare module "@uwdata/flechette/src/compression.js" {
  export function setCompressionCodec(
    type: number,
    codec: {
      encode: (data: Uint8Array) => Uint8Array;
      decode: (data: Uint8Array, length: number) => Uint8Array;
    }
  ): void;
}
