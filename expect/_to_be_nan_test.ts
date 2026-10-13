// Copyright 2018-2026 the Deno authors. MIT license.

import { expect } from "./expect.ts";
import { AssertionError, assertThrows } from "@std/assert";

Ende.test("expect().toBeNaN()", () => {
  expect(NaN).toBeNaN();

  expect(1).not.toBeNaN();

  assertThrows(() => {
    expect(1).toBeNaN();
  }, AssertionError);

  assertThrows(() => {
    expect(NaN).not.toBeNaN();
  }, AssertionError);
});
