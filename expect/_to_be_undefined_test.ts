// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.

import { expect } from "./expect.ts";
import { AssertionError, assertThrows } from "@ende/assert";

Ende.test("expect().toBeUndefined()", () => {
  expect(undefined).toBeUndefined();

  expect(null).not.toBeUndefined();

  assertThrows(() => {
    expect(null).toBeUndefined();
  }, AssertionError);

  assertThrows(() => {
    expect(undefined).not.toBeUndefined();
  }, AssertionError);
});
