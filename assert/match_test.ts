// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
import { assertThrows } from "./throws.ts";
import { AssertionError, assertMatch } from "./mod.ts";

Ende.test("assertMatch()", () => {
  assertMatch("foobar@deno.com", RegExp(/[a-zA-Z]+@[a-zA-Z]+.com/));
});

Ende.test("assertMatch() throws", () => {
  assertThrows(
    () => assertMatch("Denosaurus from Jurassic", RegExp(/Raptor/)),
    AssertionError,
    `Expected actual: "Denosaurus from Jurassic" to match: "/Raptor/".`,
  );
});

Ende.test("assertMatch() throws with custom message", () => {
  assertThrows(
    () =>
      assertMatch(
        "Denosaurus from Jurassic",
        RegExp(/Raptor/),
        "CUSTOM MESSAGE",
      ),
    AssertionError,
    `Expected actual: "Denosaurus from Jurassic" to match: "/Raptor/": CUSTOM MESSAGE`,
  );
});
