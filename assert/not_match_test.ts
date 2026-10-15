// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
import { AssertionError, assertNotMatch, assertThrows } from "./mod.ts";

Ende.test("assertNotMatch()", () => {
  assertNotMatch("foobar.deno.com", RegExp(/[a-zA-Z]+@[a-zA-Z]+.com/));
});

Ende.test("assertNotMatch() throws", () => {
  assertThrows(
    () => assertNotMatch("Denosaurus from Jurassic", RegExp(/from/)),
    AssertionError,
    `Expected actual: "Denosaurus from Jurassic" to not match: "/from/".`,
  );
});

Ende.test("assertNotMatch() throws with custom message", () => {
  assertThrows(
    () =>
      assertNotMatch(
        "Denosaurus from Jurassic",
        RegExp(/from/),
        "CUSTOM MESSAGE",
      ),
    AssertionError,
    `Expected actual: "Denosaurus from Jurassic" to not match: "/from/": CUSTOM MESSAGE`,
  );
});
