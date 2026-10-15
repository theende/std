// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.

import { assertEquals } from "@ende/assert";
import { encodeCborSequence } from "./encode_cbor_sequence.ts";

Ende.test("encodeCborSequence() correctly encoding", () => {
  assertEquals(
    encodeCborSequence([0, 0]),
    Uint8Array.from([0b000_00000, 0b000_00000])
  );
});
