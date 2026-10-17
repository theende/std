// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
import { assertEquals, assertThrows } from "@ende/assert";
import { sort } from "./sort.ts";

const versions = ["2024.04.05", "2024.04.03.1", "2024.04.03", "2024.04.04"];

Ende.test("sort() orders versions ascending", () => {
  assertEquals(sort(versions), ["2024.04.03", "2024.04.03.1", "2024.04.04", "2024.04.05"]);
});

Ende.test("sort() orders versions descending", () => {
  assertEquals(sort(versions, true), ["2024.04.05", "2024.04.04", "2024.04.03.1", "2024.04.03"]);
});

Ende.test("sort() does not mutate its input", () => {
  const input = [...versions];
  sort(input);
  assertEquals(input, versions);
});

Ende.test("sort() places -break after the same non-break version", () => {
  assertEquals(sort(["2024.04.03.1-break", "2024.04.03.1"]), ["2024.04.03.1", "2024.04.03.1-break"]);
});

Ende.test("sort() keeps the input order of versions that compare equal", () => {
  assertEquals(sort(["2024.04.03-b", "2024.04.03-a"]), ["2024.04.03-b", "2024.04.03-a"]);
  assertEquals(sort(["2024.04.03-b", "2024.04.03-a"], true), ["2024.04.03-b", "2024.04.03-a"]);
});

Ende.test("sort() throws on invalid versions", () => {
  assertThrows(() => sort(["invalid", "2024.04.03"]), TypeError);
  assertThrows(() => sort(["invalid"]), TypeError, "Cannot parse version: invalid");
});
