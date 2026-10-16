import { describe, expect, it } from "vitest";
import { decompressLz4Frame } from "./lz4";

// "abcabcabcabcabcabc!" as an LZ4 frame with one compressed block: three
// literals, a 15-byte match at offset 3, then one literal.
const frame = new Uint8Array([
  0x04,
  0x22,
  0x4d,
  0x18, // magic
  0x60,
  0x40,
  0x82, // FLG (version 1, independent blocks), BD, header checksum
  0x08,
  0x00,
  0x00,
  0x00, // block size 8
  0x3b,
  0x61,
  0x62,
  0x63,
  0x03,
  0x00, // 3 literals "abc", match offset 3, length 4 + 11
  0x10,
  0x21, // 1 literal "!"
  0x00,
  0x00,
  0x00,
  0x00, // end mark
]);

describe("decompressLz4Frame", () => {
  it("expands overlapping matches across a block", () => {
    const text = new TextDecoder().decode(decompressLz4Frame(frame, 19));
    expect(text).toBe("abcabcabcabcabcabc!");
  });

  it("copies stored blocks as they are", () => {
    const stored = new Uint8Array([
      0x04,
      0x22,
      0x4d,
      0x18,
      0x60,
      0x40,
      0x82,
      0x02,
      0x00,
      0x00,
      0x80,
      0x68,
      0x69, // stored block "hi"
      0x00,
      0x00,
      0x00,
      0x00,
    ]);
    expect(new TextDecoder().decode(decompressLz4Frame(stored, 2))).toBe("hi");
  });

  it("rejects data that is not a frame", () => {
    expect(() => decompressLz4Frame(new Uint8Array([1, 2, 3, 4]), 4)).toThrow(
      "not an LZ4 frame"
    );
  });
});
