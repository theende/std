// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
import { assertEquals, assertThrows } from "@ende/assert";
import { normalizeGlob } from "./normalize_glob.ts";
import * as posix from "./posix/mod.ts";
import * as windows from "./windows/mod.ts";
import { SEPARATOR } from "./constants.ts";

Ende.test("normalizeGlob() checks options.globstar", function () {
  assertEquals(
    normalizeGlob(`**${SEPARATOR}..`, { globstar: true }),
    `**${SEPARATOR}..`,
  );
});

Ende.test("normalizeGlob() throws if it contains \\0 character", () => {
  assertThrows(
    () => {
      posix.normalizeGlob("\0");
    },
    Error,
    "Glob contains invalid characters:",
  );
  assertThrows(
    () => {
      windows.normalizeGlob("\0");
    },
    Error,
    "Glob contains invalid characters:",
  );
});

Ende.test(
  "normalizeGlob() works as the same way as normalize if globstar option is false",
  () => {
    assertEquals(
      posix.normalizeGlob("foo/bar/../baz"),
      "foo/baz",
    );
    assertEquals(windows.normalizeGlob("foo/bar/../baz"), "foo\\baz");
  },
);
