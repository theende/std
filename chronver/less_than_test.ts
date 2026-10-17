// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
import { assert, assertFalse } from "@ende/assert";
import { lessThan } from "./less_than.ts";
import { parse } from "./parse.ts";

Ende.test("lessThan() compares versions", () => {
  assert(lessThan(parse("2024.04.03"), parse("2024.04.04")));
  assert(lessThan(parse("2024.04.03.1"), parse("2024.04.03.1-break")));
  assertFalse(lessThan(parse("2024.04.04"), parse("2024.04.03")));
  assertFalse(lessThan(parse("2024.04.03"), parse("2024.04.03")));
});
