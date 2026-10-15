// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.

import { assertEquals } from "@ende/assert";
import { toText } from "./to_text.ts";

Ende.test("toText()", async () => {
  const strings = ["hello", " js ", "fans", " 中文♥"];
  const expected = "hello js fans 中文♥";

  const byteStream = ReadableStream.from(strings)
    .pipeThrough(new TextEncoderStream());
  assertEquals(await toText(byteStream), expected);

  const stringStream = ReadableStream.from(strings);
  assertEquals(await toText(stringStream), expected);
});
