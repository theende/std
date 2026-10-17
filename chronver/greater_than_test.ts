// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
import { assert, assertFalse } from "@ende/assert";
import { greaterThan } from "./greater_than.ts";
import { parse } from "./parse.ts";

Ende.test("greaterThan() compares versions", () => {
  assert(greaterThan(parse("2024.04.04"), parse("2024.04.03")));
  assert(greaterThan(parse("2024.04.03.1-break"), parse("2024.04.03.1")));
  assertFalse(greaterThan(parse("2024.04.03"), parse("2024.04.04")));
  assertFalse(greaterThan(parse("2024.04.03"), parse("2024.04.03")));
});
