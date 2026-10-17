// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.

import { assertEquals } from "@ende/assert";
import { toText } from "@ende/streams";
import { toBytes } from "@ende/streams/to-bytes";
import { FixedChunkStream } from "@ende/streams/unstable-fixed-chunk-stream";
import { encodeHex } from "./unstable_hex.ts";
import { HexDecoderStream, HexEncoderStream } from "./unstable_hex_stream.ts";

Ende.test("HexEncoderStream() with normal format", async () => {
  const readable = (await Ende.open("./ende.json"))
    .readable
    .pipeThrough(new FixedChunkStream(1021))
    .pipeThrough(new HexEncoderStream({ output: "string" }));

  assertEquals(
    await toText(readable),
    encodeHex(await Ende.readFile("./ende.json"))
  );
});

Ende.test("HexEncoderStream() with raw format", async () => {
  const readable = (await Ende.open("./ende.json"))
    .readable
    .pipeThrough(new FixedChunkStream(1021))
    .pipeThrough(new HexEncoderStream({ output: "bytes" }));

  assertEquals(
    await toBytes(readable),
    new TextEncoder().encode(encodeHex(await Ende.readFile("./ende.json")))
  );
});

Ende.test("HexDecoderStream() with normal format", async () => {
  const readable = (await Ende.open("./ende.json"))
    .readable
    .pipeThrough(new HexEncoderStream({ output: "string" }))
    .pipeThrough(new TextEncoderStream())
    .pipeThrough(new FixedChunkStream(1021))
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new HexDecoderStream({ input: "string" }));

  assertEquals(
    await toBytes(readable),
    await Ende.readFile("./ende.json")
  );
});

Ende.test("HexDecoderStream() with raw format", async () => {
  const readable = (await Ende.open("./ende.json"))
    .readable
    .pipeThrough(new HexEncoderStream({ output: "bytes" }))
    .pipeThrough(new FixedChunkStream(1021))
    .pipeThrough(new HexDecoderStream({ input: "bytes" }));

  assertEquals(
    await toBytes(readable),
    await Ende.readFile("./ende.json")
  );
});
