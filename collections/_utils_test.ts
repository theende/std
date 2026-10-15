// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
import { filterInPlace } from "./_utils.ts";
import { assert, assertEquals } from "@ende/assert";

Ende.test("filterInPlace() filters out elements not matching predicate", () => {
  const array = [1, 2, 3, 4, 5];
  const result = filterInPlace(array, (el) => el > 2 && el < 5);
  assertEquals(result, [3, 4]);
  assert(array === result);
});

Ende.test("filterInPlace() filters out all elements when none match predicate", () => {
  const array = [1, 2, 3, 4, 5];
  const result = filterInPlace(array, (el) => el > 5);
  assertEquals(result, []);
  assert(array === result);
});

Ende.test("filterInPlace() filters out no elements when all match predicate", () => {
  const array = [1, 2, 3, 4, 5];
  const result = filterInPlace(array, (el) => el > 0);
  assertEquals(result, [1, 2, 3, 4, 5]);
  assert(array === result);
});

Ende.test("filterInPlace() filters out no elements when array is empty", () => {
  const array: number[] = [];
  const result = filterInPlace(array, (el) => el > 0);
  assertEquals(result, []);
  assert(array === result);
});
