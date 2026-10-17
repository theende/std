// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
import { assert, assertFalse } from "@ende/assert";
import { equals } from "./equals.ts";
import { parse } from "./parse.ts";

Ende.test("equals() returns true for equal versions", () => {
  assert(equals(parse("2024.04.03.1"), parse("2024.04.03.1")));
  assert(equals(parse("2024.04.03-break"), parse("2024.04.03-break")));
});

Ende.test("equals() returns false for different versions", () => {
  assertFalse(equals(parse("2024.04.03.1"), parse("2024.04.03.2")));
  assertFalse(equals(parse("2024.04.03"), parse("2024.04.03-break")));
});

Ende.test("equals() ignores the feature", () => {
  assert(equals(parse("2024.04.03-feature1"), parse("2024.04.03-feature2")));
});
