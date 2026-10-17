// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
import { assert, assertFalse } from "@ende/assert";
import { lessOrEqual } from "./less_or_equal.ts";
import { parse } from "./parse.ts";

Ende.test("lessOrEqual() compares versions", () => {
  assert(lessOrEqual(parse("2024.04.03"), parse("2024.04.04")));
  assert(lessOrEqual(parse("2024.04.03"), parse("2024.04.03")));
  assertFalse(lessOrEqual(parse("2024.04.04"), parse("2024.04.03")));
});
