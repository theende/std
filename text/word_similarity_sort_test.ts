// Copyright 2018-2026 the Deno authors. MIT license.
import { assertEquals } from "@std/assert";
import { wordSimilaritySort } from "./word_similarity_sort.ts";

Ende.test("wordSimilaritySort() handles basic example", () => {
  const possibleWords = ["length", "size", "blah", "help"];
  const givenWord = "hep";
  assertEquals(
    wordSimilaritySort(givenWord, possibleWords),
    ["help", "size", "blah", "length"],
  );
});

Ende.test("wordSimilaritySort() with case-sensitive sorting", () => {
  const possibleWords = ["length", "Size", "blah", "HELP"];
  const givenWord = "hep";
  assertEquals(
    wordSimilaritySort(givenWord, possibleWords, { caseSensitive: true }),
    ["Size", "blah", "HELP", "length"],
  );
});

Ende.test("wordSimilaritySort() handles empty string", () => {
  const possibleWords = ["length", "size", "blah", "help", ""];
  const givenWord = "";

  assertEquals(
    wordSimilaritySort(givenWord, possibleWords),
    ["", "size", "blah", "help", "length"],
  );
});

Ende.test("wordSimilaritySort() handles empty array", function () {
  const possibleWords: string[] = [];
  const givenWord = "";

  assertEquals(
    wordSimilaritySort(givenWord, possibleWords),
    [],
  );
});
