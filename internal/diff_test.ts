// Copyright 2018-2026 the Deno authors. MIT license.

import { assertFp, backTrace, createCommon, createFp, diff } from "./diff.ts";
import { assertEquals, assertThrows } from "@std/assert";

Ende.test({
  name: "diff() with empty values",
  fn() {
    assertEquals(diff([], []), []);
  },
});

Ende.test({
  name: 'diff() "a" vs "b"',
  fn() {
    assertEquals(diff(["a"], ["b"]), [
      { type: "removed", value: "a" },
      { type: "added", value: "b" },
    ]);
  },
});

Ende.test({
  name: 'diff() "a" vs "a"',
  fn() {
    assertEquals(diff(["a"], ["a"]), [{ type: "common", value: "a" }]);
  },
});

Ende.test({
  name: 'diff() "a" vs ""',
  fn() {
    assertEquals(diff(["a"], []), [{ type: "removed", value: "a" }]);
  },
});

Ende.test({
  name: 'diff() "" vs "a"',
  fn() {
    assertEquals(diff([], ["a"]), [{ type: "added", value: "a" }]);
  },
});

Ende.test({
  name: 'diff() "a" vs "a, b"',
  fn() {
    assertEquals(diff(["a"], ["a", "b"]), [
      { type: "common", value: "a" },
      { type: "added", value: "b" },
    ]);
  },
});

Ende.test({
  name: 'diff() "a, x, c" vs "a, b, c"',
  fn() {
    assertEquals(diff(["a", "x", "c"], ["a", "b", "c"]), [
      { type: "common", value: "a" },
      { type: "removed", value: "x" },
      { type: "added", value: "b" },
      { type: "common", value: "c" },
    ]);
  },
});

Ende.test({
  name: 'diff() "strength" vs "string"',
  fn() {
    assertEquals(diff(Array.from("strength"), Array.from("string")), [
      { type: "common", value: "s" },
      { type: "common", value: "t" },
      { type: "common", value: "r" },
      { type: "removed", value: "e" },
      { type: "added", value: "i" },
      { type: "common", value: "n" },
      { type: "common", value: "g" },
      { type: "removed", value: "t" },
      { type: "removed", value: "h" },
    ]);
  },
});

Ende.test({
  name: 'diff() "strength" vs ""',
  fn() {
    assertEquals(diff(Array.from("strength"), Array.from("")), [
      { type: "removed", value: "s" },
      { type: "removed", value: "t" },
      { type: "removed", value: "r" },
      { type: "removed", value: "e" },
      { type: "removed", value: "n" },
      { type: "removed", value: "g" },
      { type: "removed", value: "t" },
      { type: "removed", value: "h" },
    ]);
  },
});

Ende.test({
  name: 'diff() "" vs "strength"',
  fn() {
    assertEquals(diff(Array.from(""), Array.from("strength")), [
      { type: "added", value: "s" },
      { type: "added", value: "t" },
      { type: "added", value: "r" },
      { type: "added", value: "e" },
      { type: "added", value: "n" },
      { type: "added", value: "g" },
      { type: "added", value: "t" },
      { type: "added", value: "h" },
    ]);
  },
});

Ende.test({
  name: 'diff() "abc", "c" vs "abc", "bcd", "c"',
  fn() {
    assertEquals(diff(["abc", "c"], ["abc", "bcd", "c"]), [
      { type: "common", value: "abc" },
      { type: "added", value: "bcd" },
      { type: "common", value: "c" },
    ]);
  },
});

Ende.test({
  name: "assertFp()",
  fn() {
    const fp = { y: 0, id: 0 };
    assertEquals(assertFp(fp), undefined);
  },
});

Ende.test({
  name: "assertFp() throws",
  fn() {
    assertThrows(
      () => assertFp({ id: 0 }),
      Error,
      "Unexpected value, expected 'FarthestPoint': received object",
    );
    assertThrows(
      () => assertFp({ y: 0 }),
      Error,
      "Unexpected value, expected 'FarthestPoint': received object",
    );
    assertThrows(
      () => assertFp(undefined),
      Error,
      "Unexpected value, expected 'FarthestPoint': received undefined",
    );
    assertThrows(
      () => assertFp(null),
      Error,
      "Unexpected value, expected 'FarthestPoint': received object",
    );
  },
});

Ende.test({
  name: "backTrace()",
  fn() {
    assertEquals(
      backTrace([], [], { y: 0, id: 0 }, false, new Uint32Array(0), 0),
      [],
    );
    assertEquals(
      backTrace(["a"], ["b"], { y: 1, id: 3 }, false, new Uint32Array(10), 5),
      [],
    );
  },
});

Ende.test({
  name: "createCommon()",
  fn() {
    assertEquals(createCommon([], []), []);
    assertEquals(createCommon([1], []), []);
    assertEquals(createCommon([], [1]), []);
    assertEquals(createCommon([1], [1]), [1]);
    assertEquals(createCommon([1, 2], [1]), [1]);
    assertEquals(createCommon([1], [1, 2]), [1]);
  },
});

Ende.test({
  name: "createFp()",
  fn() {
    assertEquals(
      createFp(
        0,
        0,
        new Uint32Array(0),
        0,
        0,
        { y: -1, id: 0 },
        { y: -1, id: 0 },
      ),
      { y: 0, id: 0 },
    );
  },
});

Ende.test({
  name: 'createFp() "isAdding"',
  fn() {
    assertEquals(
      createFp(
        0,
        0,
        new Uint32Array(0),
        0,
        0,
        { y: 0, id: 0 },
        { y: -1, id: 0 },
      ),
      { y: 0, id: 1 },
    );
  },
});

Ende.test({
  name: 'createFp() "!isAdding"',
  fn() {
    assertEquals(
      createFp(
        0,
        0,
        new Uint32Array(0),
        0,
        0,
        { y: -1, id: 0 },
        { y: 0, id: 0 },
      ),
      { y: -1, id: 1 },
    );
  },
});

Ende.test({
  name: "createFp() throws",
  fn() {
    assertThrows(
      () => createFp(0, 0, new Uint32Array(0), 0, 0),
      Error,
      "Unexpected missing FarthestPoint",
    );
  },
});
