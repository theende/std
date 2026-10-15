// Copyright 2018-2026 the Deno authors. MIT license.

import { assertEquals } from "@ende/assert";
import { toText } from "@ende/streams";
import { toBytes } from "@ende/streams/to-bytes";
import { FixedChunkStream } from "@ende/streams/unstable-fixed-chunk-stream";
import { encodeBase64 } from "./unstable_base64.ts";
import {
  Base64DecoderStream,
  Base64EncoderStream,
} from "./unstable_base64_stream.ts";

Ende.test("Base64EncoderStream() with normal format", async () => {
  for (const alphabet of ["base64", "base64url"] as const) {
    const readable = (await Ende.open("./ende.lock"))
      .readable
      .pipeThrough(new FixedChunkStream(1021))
      .pipeThrough(new Base64EncoderStream({ alphabet, output: "string" }));

    assertEquals(
      await toText(readable),
      encodeBase64(await Ende.readFile("./ende.lock"), { alphabet }),
      alphabet,
    );
  }
});

Ende.test("Base64EncoderStream() with raw format", async () => {
  for (const alphabet of ["base64", "base64url"] as const) {
    const readable = (await Ende.open("./ende.lock"))
      .readable
      .pipeThrough(new FixedChunkStream(1021))
      .pipeThrough(new Base64EncoderStream({ alphabet, output: "bytes" }));

    assertEquals(
      await toBytes(readable),
      new TextEncoder().encode(
        encodeBase64(
          await Ende.readFile("./ende.lock"),
          { alphabet },
        ),
      ),
      alphabet,
    );
  }
});

Ende.test("Base64DecoderStream() with normal format", async () => {
  for (const alphabet of ["base64", "base64url"] as const) {
    const readable = (await Ende.open("./ende.lock"))
      .readable
      .pipeThrough(new Base64EncoderStream({ alphabet, output: "string" }))
      .pipeThrough(new TextEncoderStream())
      .pipeThrough(new FixedChunkStream(1021))
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(new Base64DecoderStream({ alphabet, input: "string" }));

    assertEquals(
      await toBytes(readable),
      await Ende.readFile("./ende.lock"),
    );
  }
});

Ende.test("Base64DecoderStream() with raw format", async () => {
  for (const alphabet of ["base64", "base64url"] as const) {
    const readable = (await Ende.open("./ende.lock"))
      .readable
      .pipeThrough(new Base64EncoderStream({ alphabet, output: "bytes" }))
      .pipeThrough(new FixedChunkStream(1021))
      .pipeThrough(new Base64DecoderStream({ alphabet, input: "bytes" }));

    assertEquals(
      await toBytes(readable),
      await Ende.readFile("./ende.lock"),
    );
  }
});
