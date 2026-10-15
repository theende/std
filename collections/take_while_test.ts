// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.

import { assertEquals } from "@ende/assert";
import { takeWhile } from "./take_while.ts";

Ende.test("takeWhile() handles num array", () => {
  const arr = [1, 2, 3, 4, 5, 6];
  const actual = takeWhile(arr, (i) => i !== 4);

  assertEquals(actual, [1, 2, 3]);
});

Ende.test("takeWhile() adds two to each num in predicate", () => {
  const arr = [1, 2, 3, 4, 5, 6];
  const actual = takeWhile(arr, (i) => i + 2 !== 6);

  assertEquals(actual, [1, 2, 3]);
});

Ende.test("takeWhile() handles negatives", () => {
  const arr = [-1, -2, -3, -4, -5, -6];

  const actual = takeWhile(arr, (i) => i > -4);
  assertEquals(actual, [-1, -2, -3]);
});

Ende.test("takeWhile() handles no mutation", () => {
  const arr = [-1, -2, -3, -4, -5, -6];

  const actual = takeWhile(arr, (i) => i > -4);
  assertEquals(actual, [-1, -2, -3]);
  assertEquals(arr, [-1, -2, -3, -4, -5, -6]);
});

Ende.test("takeWhile() handles empty input array returns empty array", () => {
  const arr: number[] = [];

  const actual = takeWhile(arr, (i) => i > 4);

  assertEquals(actual, []);
});

Ende.test("takeWhile() returns empty array when the first element doesn't match the predicate", () => {
  const arr = [1, 2, 3, 4];

  const actual = takeWhile(arr, (i) => i !== 1);

  assertEquals(actual, []);
});

Ende.test("takeWhile() returns the same array when all elements match the predicate", () => {
  const arr = [1, 2, 3, 4];

  const actual = takeWhile(arr, (i) => i !== 400);

  assertEquals(actual, [1, 2, 3, 4]);
});

Ende.test("takeWhile() handles a generator", () => {
  function* infiniteCount() {
    let count = 0;
    while (true) {
      count++;
      yield count;
    }
  }
  const actual = takeWhile(infiniteCount(), (i) => i !== 4);
  assertEquals(actual, [1, 2, 3]);
});

Ende.test("takeWhile() handles a Set", () => {
  const set = new Set([1, 2, 3, 4, 5, 6]);
  const actual = takeWhile(set, (i) => i !== 4);
  assertEquals(actual, [1, 2, 3]);
});

Ende.test("takeWhile() handles a Map", () => {
  const map = new Map([
    ["a", 1],
    ["b", 2],
    ["c", 3],
    ["d", 4],
    ["e", 5],
    ["f", 6],
  ]);
  const actual = takeWhile(map, ([, i]) => i !== 4);
  assertEquals(actual, [
    ["a", 1],
    ["b", 2],
    ["c", 3],
  ]);
});

Ende.test("takeWhile() passes the index to the predicate", () => {
  const arr = [1, 2, 3, 4];

  const actual = takeWhile(arr, (_, index) => index < 1);

  assertEquals(actual, [1]);
});
