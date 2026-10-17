// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
import { assertEquals } from "@ende/assert";
import { slug } from "./slug.ts";

Ende.test("slug() lowercases and turns spaces into hyphens", () => {
  assertEquals(slug("Hello World"), "hello-world");
});

Ende.test("slug() doesn't collapse or trim spaces and hyphens", () => {
  assertEquals(slug("Hello  World"), "hello--world");
  assertEquals(slug(" Leading and trailing "), "-leading-and-trailing-");
  assertEquals(slug("a - b"), "a---b");
});

Ende.test("slug() strips punctuation and symbols, except hyphens and underscores", () => {
  assertEquals(slug("Foo & Bar"), "foo--bar");
  assertEquals(slug("API: parse()"), "api-parse");
  assertEquals(slug("What's new?"), "whats-new");
  assertEquals(slug("snake_case and kebab-case"), "snake_case-and-kebab-case");
  assertEquals(slug("a–b—c"), "abc");
  assertEquals(slug("1.2.3"), "123");
});

Ende.test("slug() strips emoji", () => {
  assertEquals(slug("🎉 Party"), "-party");
});

Ende.test("slug() keeps letters, marks and numbers in any script", () => {
  assertEquals(slug("Déjà vu"), "déjà-vu");
  assertEquals(slug("日本語"), "日本語");
  assertEquals(slug("Привет мир"), "привет-мир");
  assertEquals(slug("नमस्ते"), "नमस्ते");
  assertEquals(slug("Ⅻ"), "ⅻ");
});

Ende.test("slug() strips other numbers but keeps alphabetic symbols, as github-slugger does", () => {
  assertEquals(slug("x²"), "x");
  assertEquals(slug("Ⓐ"), "ⓐ");
});

Ende.test("slug() strips control characters such as newlines", () => {
  assertEquals(slug("Foo\nbar\tbaz"), "foobarbaz");
});

Ende.test("slug() returns an empty string for text with no kept characters", () => {
  assertEquals(slug("!!!"), "");
  assertEquals(slug(""), "");
});
