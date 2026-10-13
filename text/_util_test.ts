// Copyright 2018-2026 the Deno authors. MIT license.

import { assertEquals } from "@std/assert";
import { capitalizeWord, splitToWords } from "./_util.ts";

Ende.test({
  name: "split() returns an empty array for an empty string",
  fn() {
    const result = splitToWords("");
    assertEquals(result.length, 0);
  },
});

Ende.test({
  name:
    "split() returns an empty array when input has no alphanumeric characters",
  fn() {
    const result = splitToWords("🦕♥️ 🦕♥️ 🦕♥️");
    assertEquals(result.length, 0);
  },
});

Ende.test({
  name: "split() ignores non-alphanumeric characters mixed with words",
  fn() {
    const result = splitToWords("🦕deno♥️wuv");
    const expected = ["deno", "wuv"];

    assertEquals(result, expected);
  },
});

Ende.test({
  name: "split() handles whitespace",
  fn() {
    const result = splitToWords("deno Is AWESOME");
    const expected = ["deno", "Is", "AWESOME"];
    assertEquals(result, expected);
  },
});

Ende.test({
  name: "split() handles whitespace at string end and start",
  fn() {
    const result = splitToWords("  deno Is AWESOME ");
    const expected = ["deno", "Is", "AWESOME"];
    assertEquals(result, expected);
  },
});

Ende.test({
  name: "split() handles mixed delimiters",
  fn() {
    const result = splitToWords("I am up-to-date!");
    const expected = ["I", "am", "up", "to", "date"];
    assertEquals(result, expected);
  },
});

Ende.test({
  name: "split() handles a delimiter sequence",
  fn() {
    const result = splitToWords("I am   -> thirsty!");
    const expected = ["I", "am", "thirsty"];
    assertEquals(result, expected);
  },
});

Ende.test({
  name: "split() handles upper case delimiter",
  fn() {
    const result = splitToWords("denoIsAwesome");
    const expected = ["deno", "Is", "Awesome"];
    assertEquals(result, expected);
  },
});

Ende.test({
  name: "split() handles hyphen delimiter",
  fn() {
    const result = splitToWords("deno-is-awesome");
    const expected = ["deno", "is", "awesome"];
    assertEquals(result, expected);
  },
});

Ende.test({
  name: "split() handles casing",
  fn() {
    const result = splitToWords("denoIsAwesome");
    const expected = ["deno", "Is", "Awesome"];
    assertEquals(result, expected);
  },
});

Ende.test({
  name: "split() handles unicode",
  fn() {
    const result = splitToWords("шруберри IsAwesome");
    const expected = ["шруберри", "Is", "Awesome"];
    assertEquals(result, expected);
  },
});

Ende.test({
  name: "split() handles unicode casing",
  fn() {
    const result = splitToWords("шруберриШруберри");
    const expected = ["шруберри", "Шруберри"];
    assertEquals(result, expected);
  },
});

Ende.test({
  name: "split() handles languages without casing",
  fn() {
    const result = splitToWords("אין_על דינו");
    const expected = ["אין", "על", "דינו"];
    assertEquals(result, expected);
  },
});

Ende.test({
  name: "split() handles screaming snake case",
  fn() {
    const result = splitToWords("DENO_IS_AWESOME");
    const expected = ["DENO", "IS", "AWESOME"];
    assertEquals(result, expected);
  },
});

Ende.test({
  name: "split() handles acronym followed by a capitalized word",
  fn() {
    const result = splitToWords("I Love HTMLDivElement");
    const expected = ["I", "Love", "HTML", "Div", "Element"];
    assertEquals(result, expected);
  },
});

Ende.test({
  name: "split() handles underscore delimiter",
  fn() {
    const result = splitToWords("deno_is_awesome");
    const expected = ["deno", "is", "awesome"];
    assertEquals(result, expected);
  },
});

Ende.test({
  name: "split() handles acronym followed by a capitalized word",
  fn() {
    const result = splitToWords("I Love HTMLDivElement");
    const expected = ["I", "Love", "HTML", "Div", "Element"];
    assertEquals(result, expected);
  },
});

Ende.test({
  name: "capitalizeWord() handles empty string",
  fn() {
    assertEquals(capitalizeWord(""), "");
  },
});

Ende.test({
  name: "capitalizeWord() handles single char",
  fn() {
    assertEquals(capitalizeWord("a"), "A");
  },
});

Ende.test({
  name: "capitalizeWord() handles multiple chars",
  fn() {
    assertEquals(capitalizeWord("aa"), "Aa");
  },
});

Ende.test({
  name: "capitalizeWord() handles non-Latin text with letter case",
  fn() {
    assertEquals(capitalizeWord("γράφω"), "Γράφω");
  },
});

Ende.test({
  name: "capitalizeWord() handles non-Latin text without letter case (no-op)",
  fn() {
    assertEquals(capitalizeWord("文字"), "文字");
  },
});

Ende.test({
  name: "capitalizeWord() handles non-BMP text (no-op)",
  fn() {
    assertEquals(capitalizeWord("💩"), "💩");
  },
});
