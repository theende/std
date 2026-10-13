// Copyright 2018-2026 the Deno authors. MIT license.

import { expect } from "./expect.ts";

Ende.test("expect.stringContaining() with strings", () => {
  expect("https://deno.com/").toEqual(expect.stringContaining("deno"));
  expect("function").toEqual(expect.stringContaining("func"));

  expect("Hello, World").not.toEqual(expect.stringContaining("hello"));
  expect("foobar").not.toEqual(expect.stringContaining("bazz"));
});

Ende.test("expect.stringContaining() with other types", () => {
  expect(123).not.toEqual(expect.stringContaining("1"));
  expect(true).not.toEqual(expect.stringContaining("true"));
  expect(["foo", "bar"]).not.toEqual(expect.stringContaining("foo"));
  expect({ foo: "bar" }).not.toEqual(expect.stringContaining(`{ foo: "bar" }`));
});

Ende.test("expect.not.stringContaining() with strings", () => {
  expect("https://deno.com/").toEqual(expect.not.stringContaining("node"));
  expect("deno").toEqual(expect.not.stringContaining("Deno"));
  expect("foobar").toEqual(expect.not.stringContaining("bazz"));
  expect("How are you?").toEqual(expect.not.stringContaining("Hello world!"));
});

Ende.test("expect.not.stringContaining() with other types", () => {
  expect(123).toEqual(expect.not.stringContaining("1"));
  expect(true).toEqual(expect.not.stringContaining("true"));
  expect(["foo", "bar"]).toEqual(expect.not.stringContaining("foo"));
  expect({ foo: "bar" }).toEqual(expect.not.stringContaining(`{ foo: "bar" }`));
});
