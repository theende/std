// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
import { assertLess, assertThrows } from "./mod.ts";

Ende.test("assertLess", () => {
  assertLess(1, 2);
  assertLess(1n, 2n);
  assertLess(1, 1.1);

  assertThrows(() => assertLess(2, 1));
});
