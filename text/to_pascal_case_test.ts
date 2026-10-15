// Copyright 2018-2026 the Deno authors. MIT license.

import { assertEquals } from "@ende/assert";
import { toPascalCase } from "./mod.ts";

Ende.test("toPascalCase() handles empty string", () => {
  assertEquals(toPascalCase(""), "");
});

Ende.test("toPascalCase() converts a single word", () => {
  const input = "shruberry";
  const expected = "Shruberry";
  assertEquals(toPascalCase(input), expected);
});

Ende.test("toPascalCase() converts a sentence", () => {
  const input = "she turned me into a newt";
  const expected = "SheTurnedMeIntoANewt";
  assertEquals(toPascalCase(input), expected);
});

Ende.test("toPascalCase() converts multiple delimiters", () => {
  const result = toPascalCase("I am up-to-date!");
  const expected = "IAmUpToDate";
  assertEquals(result, expected);
});

Ende.test("toPascalCase() trims whitespace", () => {
  const result = toPascalCase(" deno Is AWESOME ");
  const expected = "DenoIsAwesome";
  assertEquals(result, expected);
});

Ende.test("toPascalCase() converts a single word with Cyrillic letters", () => {
  const input = "шруберри";
  const expected = "Шруберри";
  assertEquals(toPascalCase(input), expected);
});
