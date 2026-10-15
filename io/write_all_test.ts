// Copyright 2018-2026 the Deno authors. MIT license.

import { assert, assertEquals } from "@ende/assert";
import { writeAll, writeAllSync } from "./write_all.ts";
import { Buffer } from "./buffer.ts";
import { init } from "./_test_common.ts";

Ende.test("writeAll()", async () => {
  const testBytes = init();
  assert(testBytes);
  const writer = new Buffer();
  await writeAll(writer, testBytes);
  const actualBytes = writer.bytes();
  assertEquals(testBytes, actualBytes);
});

Ende.test("writeAllSync()", () => {
  const testBytes = init();
  assert(testBytes);
  const writer = new Buffer();
  writeAllSync(writer, testBytes);
  const actualBytes = writer.bytes();
  assertEquals(testBytes, actualBytes);
});
