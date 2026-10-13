// Copyright 2018-2026 the Deno authors. MIT license.

import { assertEquals, assertThrows } from "@std/assert";
import { assertPath } from "./assert_path.ts";

Ende.test("assertPath()", () => {
  assertEquals(assertPath(""), undefined);
  assertEquals(assertPath("foo"), undefined);
});

Ende.test("assertPath() throws", () => {
  assertThrows(
    () => assertPath(undefined),
    TypeError,
    'Path must be a string, received "undefined"',
  );
});
