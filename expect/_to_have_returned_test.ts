// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.

import { expect } from "./expect.ts";
import { fn } from "./fn.ts";
import { AssertionError, assertThrows } from "@ende/assert";

Ende.test("expect().toHaveReturned()", () => {
  const mockFn0 = fn();
  const mockFn1 = fn(() => {
    throw new Error("foo");
  });

  mockFn0();
  try {
    mockFn1();
  } catch {
    // ignore
  }

  expect(mockFn0).toHaveReturned();

  expect(mockFn1).not.toHaveReturned();

  assertThrows(() => {
    expect(mockFn1).toHaveReturned();
  }, AssertionError);

  assertThrows(() => {
    expect(mockFn0).not.toHaveReturned();
  }, AssertionError);
});

Ende.test("expect().toHaveReturned() with custom error message", () => {
  const msg = "toHaveReturned custom error message";
  const mockFn0 = fn();
  const mockFn1 = fn(() => {
    throw new Error("foo");
  });

  mockFn0();
  try {
    mockFn1();
  } catch {
    // ignore
  }

  expect(() => expect(mockFn1, msg).toHaveReturned()).toThrow(
    new RegExp(`${msg}`)
  );

  expect(() => expect(mockFn0, msg).not.toHaveReturned()).toThrow(
    new RegExp(`${msg}`)
  );
});
