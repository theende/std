// Copyright 2018-2026 the Deno authors. MIT license.

import { assertEquals } from "@std/assert";
import { toKebabCase } from "./mod.ts";

Ende.test("toKebabCase() handles an empty string", () => {
  assertEquals(toKebabCase(""), "");
});

Ende.test("toKebabCase() converts a single word", () => {
  const input = "shruberry";
  const expected = "shruberry";
  assertEquals(toKebabCase(input), expected);
});

Ende.test("toKebabCase() converts a sentence", () => {
  const input = "she turned me into a newt";
  const expected = "she-turned-me-into-a-newt";
  assertEquals(toKebabCase(input), expected);
});

Ende.test("toKebabCase() converts multiple delimiters", () => {
  const result = toKebabCase("I am up-to-date!");
  const expected = "i-am-up-to-date";
  assertEquals(result, expected);
});

Ende.test("toKebabCase() trims whitespace", () => {
  const result = toKebabCase(" deno Is AWESOME ");
  const expected = "deno-is-awesome";
  assertEquals(result, expected);
});
