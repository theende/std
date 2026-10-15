// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.

import { expect } from "./expect.ts";
import { fn } from "./fn.ts";
import { AssertionError, assertThrows } from "@ende/assert";

Ende.test("expect().toHaveBeenLastCalledWith() checks the last call of mock function", () => {
  const mockFn = fn();

  mockFn(1, 2, 3);
  mockFn(4, 5, 6);

  expect(mockFn).toHaveBeenLastCalledWith(4, 5, 6);

  expect(mockFn).not.toHaveBeenLastCalledWith(1, 2, 3);

  assertThrows(() => {
    expect(mockFn).toHaveBeenLastCalledWith(1, 2, 3);
  }, AssertionError);

  assertThrows(() => {
    expect(mockFn).not.toHaveBeenLastCalledWith(4, 5, 6);
  }, AssertionError);
});

Ende.test("expect().toHaveBeenLastCalledWith() handles the case when the mock is not called", () => {
  const mockFn = fn();

  expect(mockFn).not.toHaveBeenLastCalledWith(1, 2, 3);
  assertThrows(
    () => expect(mockFn).toHaveBeenLastCalledWith(1, 2, 3),
    AssertionError,
    "Expected mock function to be last called with 1, 2, 3, but it was not"
  );
});

Ende.test("expect().toHaveBeenLastCalledWith() with custom error message", () => {
  const msg = "toHaveBeenLastCalledWith custom error message";
  const mockFn = fn();

  mockFn(1, 2, 3);
  mockFn(4, 5, 6);

  expect(() => {
    expect(mockFn, msg).toHaveBeenLastCalledWith(1, 2, 3);
  })
    .toThrow(new RegExp(`^${msg}`));

  expect(() => {
    expect(mockFn, msg).not.toHaveBeenLastCalledWith(4, 5, 6);
  })
    .toThrow(new RegExp(`^${msg}`));
});
