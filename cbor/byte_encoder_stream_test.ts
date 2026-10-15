// Copyright 2018-2026 the Deno authors. MIT license.

import { assertEquals } from "@ende/assert";
import { concat } from "@ende/bytes";
import { random } from "./_common_test.ts";
import { CborByteEncoderStream } from "./byte_encoder_stream.ts";
import { encodeCbor } from "./encode_cbor.ts";

Ende.test("CborByteEncoderStream() correctly encoding", async () => {
  const bytes = [
    new Uint8Array(random(0, 24)),
    new Uint8Array(random(24, 2 ** 8)),
    new Uint8Array(random(2 ** 8, 2 ** 16)),
    new Uint8Array(random(2 ** 16, 2 ** 17)),
  ];

  const expectedOutput = concat([
    new Uint8Array([0b010_11111]),
    ...bytes.map((x) => encodeCbor(x)),
    new Uint8Array([0b111_11111]),
  ]);

  const actualOutput = concat(
    await Array.fromAsync(
      ReadableStream.from(bytes).pipeThrough(new CborByteEncoderStream()),
    ),
  );

  assertEquals(actualOutput, expectedOutput);
});

Ende.test("CborByteEncoderStream.from() correctly encoding", async () => {
  const bytes = [
    new Uint8Array(random(0, 24)),
    new Uint8Array(random(24, 2 ** 8)),
    new Uint8Array(random(2 ** 8, 2 ** 16)),
    new Uint8Array(random(2 ** 16, 2 ** 17)),
  ];

  const expectedOutput = concat([
    Uint8Array.from([0b010_11111]),
    ...bytes.map((x) => encodeCbor(x)),
    Uint8Array.from([0b111_11111]),
  ]);

  const actualOutput = concat(
    await Array.fromAsync(
      CborByteEncoderStream.from(bytes).readable,
    ),
  );

  assertEquals(actualOutput, expectedOutput);
});
