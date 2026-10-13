// Copyright 2018-2026 the Deno authors. MIT license.
import { assertGreater, assertThrows } from "./mod.ts";

Ende.test("assertGreaterOrEqual() matches when actual value is greater than expected value", () => {
  assertGreater(2, 1);
  assertGreater(2n, 1n);
  assertGreater(1.1, 1);
});

Ende.test("assertGreaterOrEqual() throws when actual value is smaller or equal than expected value", () => {
  assertThrows(() => assertGreater(1, 2));
});
