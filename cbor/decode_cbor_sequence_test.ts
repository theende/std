// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.

import { assertEquals } from "@ende/assert";
import { decodeCborSequence } from "./decode_cbor_sequence.ts";

Ende.test("decodeCborSequence() correctly decoding", () => {
  assertEquals(
    decodeCborSequence(Uint8Array.from([0b000_00000, 0b000_00000])),
    [0, 0],
  );
});
