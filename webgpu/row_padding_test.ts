// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.

import { getRowPadding, resliceBufferWithPadding } from "./row_padding.ts";
import { assertEquals } from "@ende/assert";

Ende.test("getRowPadding()", () => {
  const { unpadded, padded } = getRowPadding(64);
  assertEquals(unpadded, 256);
  assertEquals(padded, 256);
});

Ende.test("getRowPadding() works for odd number smaller than COPY_BYTES_PER_ROW_ALIGNMENT", () => {
  const { unpadded, padded } = getRowPadding(5);
  assertEquals(unpadded, 20);
  assertEquals(padded, 256);
});

Ende.test("getRowPadding() works for odd number larger than COPY_BYTES_PER_ROW_ALIGNMENT", () => {
  const { unpadded, padded } = getRowPadding(329);
  assertEquals(unpadded, 1316);
  assertEquals(padded, 1536);
});

Ende.test("getRowPadding() works for even number smaller than COPY_BYTES_PER_ROW_ALIGNMENT", () => {
  const { unpadded, padded } = getRowPadding(4);
  assertEquals(unpadded, 16);
  assertEquals(padded, 256);
});

Ende.test("getRowPadding() works for even number larger than COPY_BYTES_PER_ROW_ALIGNMENT", () => {
  const { unpadded, padded } = getRowPadding(4024);
  assertEquals(unpadded, 16096);
  assertEquals(padded, 16128);
});

Ende.test("resliceBufferWithPadding()", () => {
  // deno-fmt-ignore
  const input = new Uint8Array([
      0, 255, 0, 255, 255,   0, 0, 255,   0, 255, 0, 255,   0, 0, 0,
      0,   0, 0,   0,   0,   0, 0,   0,   0,   0, 0,   0,   0, 0, 0,
      0,   0, 0,   0,   0,   0, 0,   0,   0,   0, 0,   0,   0, 0, 0,
      0,   0, 0,   0,   0,   0, 0,   0,   0,   0, 0,   0,   0, 0, 0,
      0,   0, 0,   0,   0,   0, 0,   0,   0,   0, 0,   0,   0, 0, 0,
      0,   0, 0,   0,   0,   0, 0,   0,   0,   0, 0,   0,   0, 0, 0,
      0,   0, 0,   0,   0,   0, 0,   0,   0,   0, 0,   0,   0, 0, 0,
      0,   0, 0,   0,   0,   0, 0,   0,   0,   0, 0,   0,   0, 0, 0,
      0,   0, 0,   0,   0,   0, 0,   0,   0,   0, 0,   0,   0, 0, 0,
      0,   0, 0,   0,   0,   0, 0,   0,   0,   0, 0,   0,   0, 0, 0,
      0,   0, 0,   0,   0,   0, 0,   0,   0,   0, 0,   0,   0, 0, 0,
      0,   0, 0,   0,   0,   0, 0,   0,   0,   0, 0,   0,   0, 0, 0,
      0,   0, 0,   0,   0,   0, 0,   0,   0,   0, 0,   0,   0, 0, 0,
      0,   0, 0,   0,   0,   0, 0,   0,   0,   0, 0,   0,   0, 0, 0,
      0,   0, 0,   0,   0,   0, 0,   0,   0,   0, 0,   0,   0, 0, 0,
      0,   0, 0,   0,   0,   0, 0,   0,   0,   0, 0,   0,   0, 0, 0,
      0,   0, 0,   0,   0,   0, 0,   0,   0,   0, 0,   0,   0, 0, 0,
      0, 255, 0,   0, 255, 255, 0,   0, 255, 255, 0,   0, 255, 0, 0,
      0,   0, 0,   0,   0,   0, 0,   0,   0,   0, 0,   0,   0, 0, 0,
      0,   0, 0,   0,   0,   0, 0,   0,   0,   0, 0,   0,   0, 0, 0,
      0,   0, 0,   0,   0,   0, 0,   0,   0,   0, 0,   0,   0, 0, 0,
      0,   0, 0,   0,   0,   0, 0,   0,   0,   0, 0,   0,   0, 0, 0,
      0,   0, 0,   0,   0,   0, 0,   0,   0,   0, 0,   0,   0, 0, 0,
      0,   0, 0,   0,   0,   0, 0,   0,   0,   0, 0,   0,   0, 0, 0,
      0,   0, 0,   0,   0,   0, 0,   0,   0,   0, 0,   0,   0, 0, 0,
      0,   0, 0,   0,   0,   0, 0,   0,   0,   0, 0,   0,   0, 0, 0,
      0,   0, 0,   0,   0,   0, 0,   0,   0,   0, 0,   0,   0, 0, 0,
      0,   0, 0,   0,   0,   0, 0,   0,   0,   0, 0,   0,   0, 0, 0,
      0,   0, 0,   0,   0,   0, 0,   0,   0,   0, 0,   0,   0, 0, 0,
      0,   0, 0,   0,   0,   0, 0,   0,   0,   0, 0,   0,   0, 0, 0,
      0,   0, 0,   0,   0,   0, 0,   0,   0,   0, 0,   0,   0, 0, 0,
      0,   0, 0,   0,   0,   0, 0,   0,   0,   0, 0,   0,   0, 0, 0,
      0,   0, 0,   0,   0,   0, 0,   0,   0,   0, 0,   0,   0, 0, 0,
      0,   0, 0,   0,   0,   0, 0,   0,   0,   0, 0,   0,   0, 0, 0,
      0,
      0]);

  const buf = resliceBufferWithPadding(input, 3, 2);
  assertEquals(
    buf,
    new Uint8Array([
      0,
      255,
      0,
      255,
      255,
      0,
      0,
      255,
      0,
      255,
      0,
      255,
      255,
      0,
      0,
      255,
      255,
      0,
      0,
      255,
      255,
      0,
      0,
      255,
    ]),
  );
});
