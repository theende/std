// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
import { assert, assertFalse } from "@ende/assert";
import { greaterOrEqual } from "./greater_or_equal.ts";
import { parse } from "./parse.ts";

Ende.test("greaterOrEqual() compares versions", () => {
  assert(greaterOrEqual(parse("2024.04.04"), parse("2024.04.03")));
  assert(greaterOrEqual(parse("2024.04.03"), parse("2024.04.03")));
  assertFalse(greaterOrEqual(parse("2024.04.03"), parse("2024.04.04")));
});
