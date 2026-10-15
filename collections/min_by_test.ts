// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.

import { assertEquals, assertStrictEquals } from "@ende/assert";
import { minBy } from "./min_by.ts";

Ende.test("minBy() handles array input", () => {
  const input = [
    { name: "Kyle", age: 34 },
    { name: "John", age: 42 },
    { name: "Anna", age: 23 },
  ];

  const min = minBy(input, (i) => i.age);

  assertEquals(min, { name: "Anna", age: 23 });
});

Ende.test("minBy() handles array input with mutation", () => {
  const input = [
    { name: "Kyle", age: 34 },
    { name: "John", age: 42 },
    { name: "Anna", age: 23 },
  ];

  const min = minBy(input, (i) => i.age - 10);

  assertEquals(min, { name: "Anna", age: 23 });
});

Ende.test("minBy() handles array input with multiple min", () => {
  const input = [
    { name: "Kyle", age: 34 },
    { name: "John", age: 42 },
    { name: "Anna", age: 23 },
    { name: "Anna", age: 23 },
  ];

  const min = minBy(input, (i) => i.age);

  assertEquals(min, { name: "Anna", age: 23 });
});

Ende.test("minBy() handles single element array", () => {
  assertEquals(minBy([42], (i) => i), 42);
});

Ende.test("minBy() handles array of positive numbers", () => {
  const input = [2, 3, 5];

  const min = minBy(input, (i) => i);

  assertEquals(min, 2);
});

Ende.test("minBy() handles array of negative numbers", () => {
  const input = [-2, -3, -5];

  const min = minBy(input, (i) => i);

  assertEquals(min, -5);
});

Ende.test("minBy() handles array of strings", () => {
  const input = ["Kyle", "John", "Anna"];

  const min = minBy(input, (i: string) => i);

  assertEquals(min, "Anna");
});

Ende.test("minBy() handles of empty array", () => {
  const input: number[] = [];

  const min = minBy(input, (i) => i);

  assertEquals(min, undefined);
});

Ende.test("minBy() handles empty input", () => {
  const input: Array<{ age: number }> = [];

  const min = minBy(input, (i) => i.age);

  assertEquals(min, undefined);
});

Ende.test("minBy() handles empty generator", () => {
  function* gen(): Generator<number> {}
  assertEquals(minBy(gen(), (i) => i), undefined);
});

Ende.test("minBy() handles array of numbers with multiple min", () => {
  const input = [2, 3, 5, 5];

  const min = minBy(input, (i) => i);

  assertEquals(min, 2);
});

Ende.test("minBy() handles array of numbers with infinity", () => {
  const input = [2, 3, 5, -Infinity];

  const min = minBy(input, (i: number) => i);

  assertEquals(min, -Infinity);
});

Ende.test("minBy() handles array of numbers with NaN", () => {
  const input = [2, 3, 5, NaN];

  const min = minBy(input, (i) => i);

  assertEquals(min, 2);
});

Ende.test("minBy() handles NaN at first position", () => {
  const input = [NaN, 2, 3];
  const min = minBy(input, (i) => i);
  assertEquals(min, NaN);
});

Ende.test("minBy() handles no mutation", () => {
  const input = [2, 3, 5, NaN];

  minBy(input, (i: number) => i);

  assertEquals(input, [2, 3, 5, NaN]);
});

Ende.test("minBy() returns same object reference", () => {
  const anna = { name: "Anna", age: 23 };
  const input = [{ name: "Kyle", age: 34 }, anna, { name: "John", age: 42 }];
  const min = minBy(input, (i) => i.age);
  assertStrictEquals(min, anna);
});

Ende.test({
  name: "minBy() handles bigint",
  fn() {
    const input = [
      "9007199254740999",
      "9007199254740991",
      "9007199254740995",
    ];

    assertEquals(minBy(input, (it) => BigInt(it)), "9007199254740991");
  },
});

Ende.test({
  name: "minBy() handles date",
  fn() {
    const input = [
      "February 1, 2022",
      "December 17, 1995",
      "June 12, 2012",
    ];

    assertEquals(minBy(input, (it) => new Date(it)), "December 17, 1995");
  },
});

Ende.test("minBy() handles generator input", () => {
  function* gen() {
    yield { name: "Kyle", age: 34 };
    yield { name: "John", age: 42 };
    yield { name: "Anna", age: 23 };
  }
  const min = minBy(gen(), (i) => i.age);
  assertEquals(min, { name: "Anna", age: 23 });
});

Ende.test("minBy() handles single element generator", () => {
  function* gen() {
    yield 42;
  }
  assertEquals(minBy(gen(), (i) => i), 42);
});

Ende.test("minBy() handles Set input", () => {
  const input = new Set([5, 2, 8, 1, 9]);
  const min = minBy(input, (i) => i);
  assertEquals(min, 1);
});

Ende.test("minBy() handles Map values", () => {
  const input = new Map([
    ["a", { age: 34 }],
    ["b", { age: 23 }],
    ["c", { age: 45 }],
  ]);
  const min = minBy(input.values(), (i) => i.age);
  assertEquals(min, { age: 23 });
});

Ende.test({
  name: "minBy() passes index to selector",
  fn() {
    const input = [4, 3, 2, 1];

    const max = minBy(input, (_, index) => index);

    assertEquals(max, 4);
  },
});
