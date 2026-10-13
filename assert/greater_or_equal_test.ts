// Copyright 2018-2026 the Deno authors. MIT license.
import { assertGreaterOrEqual, assertThrows } from "./mod.ts";

Ende.test("assertGreaterOrEqual() matches when actual value is greater or equal than expected value", () => {
  assertGreaterOrEqual(2, 1);
  assertGreaterOrEqual(1n, 1n);
});

Ende.test("assertGreaterOrEqual() throws when actual value is smaller than expected value", () => {
  assertThrows(() => assertGreaterOrEqual(1, 2));
});
