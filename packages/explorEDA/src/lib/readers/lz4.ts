const FRAME_MAGIC = 0x184d2204;
const SKIPPABLE_MASK = 0xfffffff0;
const SKIPPABLE_MAGIC = 0x184d2a50;

const u32 = (bytes: Uint8Array, at: number) =>
  (bytes[at]! |
    (bytes[at + 1]! << 8) |
    (bytes[at + 2]! << 16) |
    (bytes[at + 3]! << 24)) >>>
  0;

/**
 * Decodes one LZ4 block into `out` from `at`, and returns the end position.
 * Matches may reach back into earlier blocks, which share `out`.
 */
function decodeBlock(src: Uint8Array, out: Uint8Array, at: number): number {
  let i = 0;
  let o = at;
  while (i < src.length) {
    const token = src[i++]!;
    let literals = token >>> 4;
    if (literals === 15) {
      let byte: number;
      do {
        byte = src[i++]!;
        literals += byte;
      } while (byte === 255);
    }
    out.set(src.subarray(i, i + literals), o);
    i += literals;
    o += literals;
    // The last sequence ends after its literals.
    if (i >= src.length) break;
    const offset = src[i]! | (src[i + 1]! << 8);
    i += 2;
    if (offset === 0 || offset > o) {
      throw new Error("LZ4 data refers outside its output.");
    }
    let length = token & 15;
    if (length === 15) {
      let byte: number;
      do {
        byte = src[i++]!;
        length += byte;
      } while (byte === 255);
    }
    length += 4;
    // Copy byte by byte: a match may overlap the bytes it is writing.
    for (let from = o - offset, end = o + length; o < end; ) {
      out[o++] = out[from++]!;
    }
  }
  return o;
}

/**
 * Decompresses LZ4 frame data, as Arrow IPC buffers use it, into a buffer
 * of the known uncompressed length. Checksums are skipped.
 */
export function decompressLz4Frame(
  src: Uint8Array,
  length: number
): Uint8Array {
  const out = new Uint8Array(length);
  let i = 0;
  let o = 0;
  while (i + 4 <= src.length) {
    const magic = u32(src, i);
    if ((magic & SKIPPABLE_MASK) >>> 0 === SKIPPABLE_MAGIC) {
      i += 8 + u32(src, i + 4);
      continue;
    }
    if (magic !== FRAME_MAGIC) throw new Error("Data is not an LZ4 frame.");
    const flags = src[i + 4]!;
    i += 6; // magic, FLG, BD
    if (flags & 0x08) i += 8; // content size
    if (flags & 0x01) i += 4; // dictionary ID
    i += 1; // header checksum
    const blockChecksum = (flags & 0x10) !== 0;
    for (;;) {
      const size = u32(src, i);
      i += 4;
      if (size === 0) break;
      const stored = (size & 0x80000000) !== 0;
      const bytes = size & 0x7fffffff;
      const block = src.subarray(i, i + bytes);
      if (stored) {
        out.set(block, o);
        o += bytes;
      } else {
        o = decodeBlock(block, out, o);
      }
      i += bytes + (blockChecksum ? 4 : 0);
    }
    if (flags & 0x04) i += 4; // content checksum
  }
  return o === length ? out : out.subarray(0, o);
}
