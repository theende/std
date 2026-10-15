// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
import { AssertionError, assertThrows, unimplemented } from "./mod.ts";

Ende.test("unimplemented() throws", function() {
  assertThrows(() => unimplemented(), AssertionError, "Unimplemented.");
});

Ende.test("unimplemented() throws with custom message", function() {
  assertThrows(
    () => unimplemented("CUSTOM MESSAGE"),
    AssertionError,
    "Unimplemented: CUSTOM MESSAGE"
  );
});
