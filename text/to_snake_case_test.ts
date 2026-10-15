// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.

import { assertEquals } from "@ende/assert";
import { toSnakeCase } from "./mod.ts";

Ende.test("toSnakeCase() handles an empty string", () => {
  assertEquals(toSnakeCase(""), "");
});

Ende.test("toSnakeCase() converts a single word", () => {
  const input = "shruberry";
  const expected = "shruberry";
  assertEquals(toSnakeCase(input), expected);
});

Ende.test("toSnakeCase() converts a sentence", () => {
  const input = "she turned me into a newt";
  const expected = "she_turned_me_into_a_newt";
  assertEquals(toSnakeCase(input), expected);
});

Ende.test("toSnakeCase() converts multiple delimiters", () => {
  const result = toSnakeCase("I am up-to-date!");
  const expected = "i_am_up_to_date";
  assertEquals(result, expected);
});

Ende.test("toSnakeCase() trims whitespace", () => {
  const result = toSnakeCase(" deno Is AWESOME ");
  const expected = "deno_is_awesome";
  assertEquals(result, expected);
});

Ende.test("toSnakeCase() splits words before and after the numbers", () => {
  assertEquals(toSnakeCase("str2Num"), "str_2_num");
  assertEquals(toSnakeCase("Str2Num"), "str_2_num");
});
