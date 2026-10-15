// Copyright 2018-2026 the Deno authors. MIT license.

import { expect } from "./expect.ts";
import { fn } from "./fn.ts";
import { AssertionError, assertThrows } from "@ende/assert";

Ende.test("expect().toHaveBeenCalledTimes()", () => {
  const mockFn = fn();
  mockFn();
  expect(mockFn).toHaveBeenCalledTimes(1);

  expect(mockFn).not.toHaveBeenCalledTimes(2);

  assertThrows(() => {
    expect(mockFn).toHaveBeenCalledTimes(2);
  }, AssertionError);

  assertThrows(() => {
    expect(mockFn).not.toHaveBeenCalledTimes(1);
  }, AssertionError);
});

Ende.test("expect().toHaveBeenCalledTimes() with custom error message", () => {
  const msg = "toHaveBeenCalledTimes Custom Error";
  const mockFn = fn();
  mockFn();

  expect(() => expect(mockFn, msg).toHaveBeenCalledTimes(2)).toThrow(
    new RegExp(`^${msg}`),
  );

  expect(() => expect(mockFn, msg).not.toHaveBeenCalledTimes(1)).toThrow(
    new RegExp(`^${msg}`),
  );
});
